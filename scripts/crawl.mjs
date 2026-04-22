/**
 * AI Toolbox 自动抓取系统 v2
 * 
 * 策略：通过智谱 AI 搜索最新 AI 工具信息，不依赖网页抓取
 * 优势：不受 Cloudflare/反爬限制，数据质量更高
 * 
 * 使用方式：
 *   node scripts/crawl.mjs              # 手动运行一次
 *   node scripts/crawl.mjs --dry-run    # 试运行（不写入文件）
 *   node scripts/crawl.mjs --category text  # 只抓取指定分类
 * 
 * 定时任务（每天凌晨 3 点执行）：
 *   0 3 * * * cd /path/to/ai-toolbox && node scripts/crawl.mjs >> logs/crawl.log 2>&1
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const TOOLS_FILE = path.join(ROOT_DIR, 'src', 'data', 'tools.ts');

// ============ 配置 ============
const CONFIG = {
  ai: {
    apiKey: process.env.ZHIPU_API_KEY || 'e39dd88167644894aada6f0d39adc0af.VJ8AZYx3yOHRuYtc',
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4.5-air',
  },
  // 每个分类每次抓取多少个新工具
  newToolsPerCategory: 3,
  // 分类描述（用于 AI 搜索提示）
  categoryDescriptions: {
    text: 'AI 文本生成、写作、翻译、摘要工具',
    image: 'AI 图像生成、绘画、图片编辑工具',
    video: 'AI 视频生成、编辑工具',
    audio: 'AI 语音合成、音乐生成、音频处理工具',
    code: 'AI 编程助手、代码生成工具',
    chatbot: 'AI 聊天机器人、对话助手',
    productivity: 'AI 办公效率、文档处理工具',
    marketing: 'AI 营销推广、广告工具',
    design: 'AI 设计、Logo 生成工具',
    data: 'AI 数据分析、可视化工具',
    agent: 'AI Agent、自动化工作流工具',
    education: 'AI 教育、学习辅导工具',
  },
};

// ============ 工具函数 ============

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${ts}] ${msg}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 发起 HTTPS POST 请求
 */
function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = JSON.stringify(body);
    
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.ai.apiKey}`,
        'Content-Length': Buffer.byteLength(bodyStr),
      },
      timeout: 60000,
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString('utf-8');
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(bodyStr);
    req.end();
  });
}

/**
 * 从现有 tools.ts 中提取已有工具信息（用于去重）
 */
function getExistingTools() {
  const content = fs.readFileSync(TOOLS_FILE, 'utf-8');
  const existing = new Map();
  
  const idPattern = /id:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = idPattern.exec(content)) !== null) {
    existing.set(match[1].toLowerCase(), true);
  }
  
  const urlPattern = /url:\s*['"](https?:\/\/[^'"]+)['"]/g;
  while ((match = urlPattern.exec(content)) !== null) {
    try {
      const hostname = new URL(match[1]).hostname.replace(/^www\./, '');
      existing.set(hostname, true);
    } catch {}
  }
  
  const namePattern = /name:\s*['"]([^'"]+)['"]/g;
  while ((match = namePattern.exec(content)) !== null) {
    existing.set(match[1].toLowerCase(), true);
  }
  
  return existing;
}

/**
 * 通过 AI 搜索指定分类的最新 AI 工具
 */
async function searchToolsByCategory(category) {
  const desc = CONFIG.categoryDescriptions[category] || category;
  
  const prompt = `请搜索并推荐 ${CONFIG.newToolsPerCategory} 个最新、最热门的 ${desc}。
要求：
1. 必须是 2024-2025 年发布或更新的工具
2. 不要推荐以下已知名工具：ChatGPT, Claude, Gemini, Midjourney, DALL-E, Stable Diffusion, Runway, Pika, HeyGen, CapCut, ElevenLabs, Suno, Udio, GitHub Copilot, Cursor, v0, Replit, Bolt, Gamma, Tome, ChatPDF, Perplexity, DeepSeek, Kimi, Notion AI, Grammarly, DeepL, Jasper, Copy.ai, Canva AI, Figma AI, Looka, Fotor, Julius AI, Monica, AutoGPT, Coze, Dify, Zapier, Khanmigo, Quizlet, Duolingo, Wolfram Alpha, Ideogram, Remove.bg, Kling
3. 优先推荐有独立官网的工具

严格按以下 JSON 数组格式返回（不要添加任何其他文字）：
[
  {
    "name": "工具英文名",
    "url": "官网URL",
    "description": "一句话英文描述（20-40词）"
  }
]`;

  try {
    const data = await httpsPost(CONFIG.ai.apiUrl, {
      model: CONFIG.ai.model,
      messages: [
        { role: 'system', content: '你是一个 AI 工具搜索专家。只返回 JSON 格式数据，不要添加任何其他文字、markdown 标记或代码块。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      log(`  ⚠ AI 返回格式异常`);
      return [];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    log(`  ⚠ 搜索失败: ${error.message}`);
    return [];
  }
}

/**
 * 通过 AI 分析单个工具，生成完整的中文信息
 */
async function analyzeTool(tool, category) {
  const prompt = `分析以下 AI 工具，生成结构化数据。

工具名: ${tool.name}
描述: ${tool.description}
官网: ${tool.url}
分类: ${category}

严格按以下 JSON 格式返回（不要添加任何其他文字）：
{
  "nameCN": "中文名称",
  "descriptionCN": "一句话中文描述（20-50字）",
  "category": "分类slug（text/image/video/audio/code/chatbot/productivity/marketing/design/data/agent/education）",
  "tags": ["标签1", "标签2", "标签3"],
  "pricing": "Free/Freemium/Paid/Open Source",
  "rating": 评分数字(3.5-5.0)
}`;

  try {
    const data = await httpsPost(CONFIG.ai.apiUrl, {
      model: CONFIG.ai.model,
      messages: [
        { role: 'system', content: '只返回 JSON，不要添加其他文字。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    return null;
  }
}

/**
 * 生成工具 ID
 */
function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/**
 * 将新工具写入 tools.ts 文件
 */
function writeNewTools(newTools) {
  const content = fs.readFileSync(TOOLS_FILE, 'utf-8');
  
  const arrayEndPattern = /(\n\];\n\n\/\/ Build categories)/;
  const match = content.match(arrayEndPattern);
  
  if (!match) {
    log('❌ 无法找到 tools 数组结束位置');
    return false;
  }
  
  const newEntries = newTools.map(tool => {
    const escapedDesc = (tool.descriptionCN || '').replace(/'/g, "\\'");
    const escapedDescEn = (tool.description || '').replace(/'/g, "\\'");
    const escapedNameCN = (tool.nameCN || tool.name).replace(/'/g, "\\'");
    const escapedName = (tool.name || '').replace(/'/g, "\\'");
    const tagsStr = tool.tags.map(t => `'${t.replace(/'/g, "\\'")}'`).join(', ');
    
    return `  {
    id: '${tool.id}',
    name: '${escapedName}',
    nameCN: '${escapedNameCN}',
    description: '${escapedDescEn}',
    descriptionCN: '${escapedDesc}',
    url: '${tool.url}',
    logo: '',
    category: '${tool.category}',
    tags: [${tagsStr}],
    pricing: '${tool.pricing}',
    rating: ${tool.rating},
    isNew: true,
    dateAdded: '${new Date().toISOString().slice(0, 10)}',
  }`;
  }).join(',\n');

  const insertion = `\n${newEntries},`;
  const newContent = content.replace(arrayEndPattern, `${insertion}\n$1`);
  
  fs.writeFileSync(TOOLS_FILE, newContent, 'utf-8');
  return true;
}

// ============ 主流程 ============

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const targetCategory = process.argv.find(a => a.startsWith('--category='))?.split('=')[1];
  
  log('🚀 AI Toolbox 自动抓取系统 v2 启动');
  log(`模式: ${isDryRun ? '试运行' : '正式运行'}`);
  
  // 1. 获取已有工具
  const existingTools = getExistingTools();
  log(`📋 已有工具: ${existingTools.size} 个`);
  
  // 2. 确定要抓取的分类
  const categories = targetCategory 
    ? [targetCategory] 
    : Object.keys(CONFIG.categoryDescriptions);
  
  log(`📂 抓取分类: ${categories.join(', ')}`);
  
  // 3. 逐分类搜索新工具
  const allNewTools = [];
  
  for (const category of categories) {
    log(`\n📡 搜索分类: ${category} (${CONFIG.categoryDescriptions[category]})`);
    
    const tools = await searchToolsByCategory(category);
    log(`  找到 ${tools.length} 个候选工具`);
    
    // 去重
    const uniqueTools = tools.filter(t => {
      const nameLower = t.name.toLowerCase();
      try {
        const hostname = new URL(t.url).hostname.replace(/^www\./, '');
        return !existingTools.has(nameLower) && 
               !existingTools.has(hostname) &&
               !allNewTools.some(nt => nt.name.toLowerCase() === nameLower);
      } catch {
        return !existingTools.has(nameLower);
      }
    });
    
    log(`  去重后: ${uniqueTools.length} 个新工具`);
    
    // AI 分析每个工具
    for (let i = 0; i < uniqueTools.length; i++) {
      const tool = uniqueTools[i];
      log(`  [${i + 1}/${uniqueTools.length}] 分析: ${tool.name}`);
      
      const analysis = await analyzeTool(tool, category);
      if (analysis) {
        let id = generateId(tool.name);
        let counter = 1;
        while (existingTools.has(id) || allNewTools.some(t => t.id === id)) {
          id = `${generateId(tool.name)}-${counter++}`;
        }
        
        allNewTools.push({
          id,
          name: tool.name,
          nameCN: analysis.nameCN || tool.name,
          description: tool.description || '',
          descriptionCN: analysis.descriptionCN || '',
          url: tool.url,
          category: analysis.category || category,
          tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 4) : [],
          pricing: ['Free', 'Freemium', 'Paid', 'Open Source'].includes(analysis.pricing) ? analysis.pricing : 'Freemium',
          rating: Math.min(5, Math.max(3, Number(analysis.rating) || 4)),
          isNew: true,
          dateAdded: new Date().toISOString().slice(0, 10),
        });
        
        existingTools.set(id, true);
        existingTools.set(tool.name.toLowerCase(), true);
        log(`  ✅ ${analysis.nameCN} [${analysis.category}]`);
      } else {
        log(`  ⚠ 分析失败: ${tool.name}`);
      }
      
      await sleep(500); // AI API 限流
    }
    
    await sleep(1000); // 分类间间隔
  }
  
  log(`\n📊 搜索完成，共发现 ${allNewTools.length} 个新工具`);
  
  if (allNewTools.length === 0) {
    log('✅ 没有新工具需要添加');
    return;
  }
  
  // 4. 输出结果
  log('\n📋 新增工具列表:');
  allNewTools.forEach((tool, i) => {
    log(`  ${i + 1}. ${tool.nameCN} (${tool.name}) [${tool.category}] - ${tool.descriptionCN}`);
    log(`     ${tool.url}`);
  });
  
  // 5. 写入文件
  if (!isDryRun) {
    log('\n💾 写入 tools.ts...');
    const success = writeNewTools(allNewTools);
    if (success) {
      log(`✅ 成功添加 ${allNewTools.length} 个新工具！`);
    } else {
      log('❌ 写入失败');
      process.exit(1);
    }
  } else {
    log('\n🔍 试运行模式 - 未写入文件');
  }
  
  log('\n🎉 抓取任务完成！');
}

main().catch(error => {
  log(`❌ 程序异常: ${error.message}`);
  console.error(error);
  process.exit(1);
});
