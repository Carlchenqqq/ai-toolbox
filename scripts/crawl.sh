#!/bin/bash
# AI Toolbox 自动抓取系统 v2 - Shell 版
# 
# 使用方式：
#   bash scripts/crawl.sh                # 手动运行一次
#   bash scripts/crawl.sh --dry-run      # 试运行（不写入文件）
#   bash scripts/crawl.sh --category code  # 只抓取指定分类
#
# 定时任务（每天凌晨 3 点执行）：
#   0 3 * * * cd /path/to/ai-toolbox && bash scripts/crawl.sh >> logs/crawl.log 2>&1

set +e

# ============ 配置 ============
API_KEY="${ZHIPU_API_KEY:-e39dd88167644894aada6f0d39adc0af.VJ8AZYx3yOHRuYtc}"
API_URL="https://open.bigmodel.cn/api/paas/v4/chat/completions"
MODEL="glm-4-flash"
TOOLS_FILE="src/data/tools.ts"
DRY_RUN=false
TARGET_CATEGORY=""
TMPDIR="/tmp/ai-toolbox-crawl"
mkdir -p "$TMPDIR"

# 解析参数
for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --category=*) TARGET_CATEGORY="${arg#*=}" ;;
  esac
done

# ============ 工具函数 ============
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

call_ai() {
  local prompt_file="$1"
  local max_tokens="${2:-1000}"
  
  # 构建 system prompt
  local sys_prompt='You are an AI tool search expert. Only return JSON data, no other text, no markdown code blocks.'
  
  # 读取 user prompt
  local user_prompt
  user_prompt=$(cat "$prompt_file")
  
  # 构建请求 JSON
  local req_file="$TMPDIR/request_$$.json"
  jq -n \
    --arg model "$MODEL" \
    --arg sys "$sys_prompt" \
    --arg user "$user_prompt" \
    --argjson max "$max_tokens" \
    '{
      model: $model,
      messages: [
        {role: "system", content: $sys},
        {role: "user", content: $user}
      ],
      temperature: 0.7,
      max_tokens: $max
    }' > "$req_file"
  
  # 调用 API
  local response_file="$TMPDIR/response_$$.json"
  curl -s --max-time 120 "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d @"$req_file" > "$response_file" 2>/dev/null
  
  # 提取 content
  local content
  content=$(jq -r '.choices[0].message.content // empty' "$response_file" 2>/dev/null)
  
  # 清理
  rm -f "$req_file" "$response_file"
  
  echo "$content"
}

# ============ 主流程 ============
log "🚀 AI Toolbox 自动抓取系统 v2 启动"
log "模式: $([ "$DRY_RUN" = true ] && echo '试运行' || echo '正式运行')"

# 统计已有工具数量
EXISTING_COUNT=$(grep -c "id: '" "$TOOLS_FILE" 2>/dev/null || echo 0)
log "📋 已有工具: $EXISTING_COUNT 个"

# 定义分类
declare -a CATEGORIES=("text" "image" "video" "audio" "code" "chatbot" "productivity" "marketing" "design" "data" "agent" "education")
declare -a CATEGORY_DESCS=("AI text generation, writing, translation tools" "AI image generation, painting, photo editing tools" "AI video generation and editing tools" "AI voice synthesis, music generation tools" "AI coding assistants, code generation tools" "AI chatbots, conversational assistants" "AI productivity, document processing tools" "AI marketing and advertising tools" "AI design, logo generation tools" "AI data analysis and visualization tools" "AI Agent, automation workflow tools" "AI education, learning tools")

KNOWN_TOOLS="ChatGPT, Claude, Gemini, Midjourney, DALL-E, Stable Diffusion, Runway, Pika, HeyGen, CapCut, ElevenLabs, Suno, Udio, GitHub Copilot, Cursor, v0, Replit, Bolt, Gamma, Tome, ChatPDF, Perplexity, DeepSeek, Kimi, Notion AI, Grammarly, DeepL, Jasper, Copy.ai, Canva AI, Figma AI, Looka, Fotor, Julius AI, Monica, AutoGPT, Coze, Dify, Zapier, Khanmigo, Quizlet, Duolingo, Wolfram Alpha, Ideogram, Remove.bg, Kling"

ALL_NEW_TOOLS_FILE="$TMPDIR/all_new_tools_$$.json"
echo "[]" > "$ALL_NEW_TOOLS_FILE"

for i in "${!CATEGORIES[@]}"; do
  CATEGORY="${CATEGORIES[$i]}"
  CAT_DESC="${CATEGORY_DESCS[$i]}"
  
  if [ -n "$TARGET_CATEGORY" ] && [ "$TARGET_CATEGORY" != "$CATEGORY" ]; then
    continue
  fi
  
  log ""
  log "📡 搜索分类: $CATEGORY ($CAT_DESC)"
  
  # Step 1: AI 搜索该分类的新工具
  SEARCH_PROMPT_FILE="$TMPDIR/search_prompt_$$.txt"
  cat > "$SEARCH_PROMPT_FILE" << EOF
Search and recommend 3 newest, most popular ${CAT_DESC}.
Requirements:
1. Must be tools released or updated in 2024-2026
2. Do NOT recommend these known tools: ${KNOWN_TOOLS}
3. Prefer tools with their own official websites
4. Tools must be real and currently available

Return ONLY a JSON array (no markdown, no code blocks):
[{"name": "Tool Name", "url": "https://official-site.com", "description": "One sentence description (20-40 words)"}]
EOF

  SEARCH_RESULT=$(call_ai "$SEARCH_PROMPT_FILE" 2000)
  rm -f "$SEARCH_PROMPT_FILE"
  
  if [ -z "$SEARCH_RESULT" ]; then
    log "  ⚠ 搜索失败或无结果"
    continue
  fi
  
  # 提取 JSON 数组（使用 python 处理多行 JSON）
  TOOLS_JSON_FILE="$TMPDIR/tools_$$.json"
  echo "$SEARCH_RESULT" | python3 -c "
import sys, json, re
text = sys.stdin.read()
# 尝试直接解析
try:
    data = json.loads(text)
    if isinstance(data, list):
        print(json.dumps(data))
    else:
        print('')
except:
    # 提取 [...] 部分
    m = re.search(r'\[.*\]', text, re.DOTALL)
    if m:
        try:
            data = json.loads(m.group())
            print(json.dumps(data))
        except:
            print('')
    else:
        print('')
" > "$TOOLS_JSON_FILE" 2>/dev/null || true
  
  if [ ! -s "$TOOLS_JSON_FILE" ]; then
    log "  ⚠ AI 返回格式异常"
    rm -f "$TOOLS_JSON_FILE"
    continue
  fi
  
  TOOL_COUNT=$(jq 'length' "$TOOLS_JSON_FILE" 2>/dev/null || echo 0)
  log "  找到 $TOOL_COUNT 个候选工具"
  
  if [ "$TOOL_COUNT" -eq 0 ]; then
    rm -f "$TOOLS_JSON_FILE"
    continue
  fi
  
  # Step 2: 逐个分析工具
  for j in $(seq 0 $((TOOL_COUNT - 1))); do
    TOOL_NAME=$(jq -r ".[$j].name // empty" "$TOOLS_JSON_FILE" 2>/dev/null)
    TOOL_URL=$(jq -r ".[$j].url // empty" "$TOOLS_JSON_FILE" 2>/dev/null)
    TOOL_DESC=$(jq -r ".[$j].description // empty" "$TOOLS_JSON_FILE" 2>/dev/null)
    
    if [ -z "$TOOL_NAME" ] || [ -z "$TOOL_URL" ]; then
      continue
    fi
    
    # 检查是否已存在
    if grep -qi "name: '${TOOL_NAME}" "$TOOLS_FILE" 2>/dev/null; then
      log "  ⏭ 已存在: $TOOL_NAME"
      continue
    fi
    
    log "  [$((j+1))/$TOOL_COUNT] 分析: $TOOL_NAME"
    
    # Step 3: AI 分析生成中文信息
    ANALYZE_PROMPT_FILE="$TMPDIR/analyze_prompt_$$.txt"
    cat > "$ANALYZE_PROMPT_FILE" << EOF
Analyze this AI tool and generate structured data in Chinese.
Tool Name: $TOOL_NAME
Description: $TOOL_DESC
Website: $TOOL_URL
Category: $CATEGORY

Return ONLY a JSON object (no markdown, no code blocks):
{"nameCN": "Chinese name", "descriptionCN": "One sentence Chinese description (20-50 chars)", "category": "category slug (text/image/video/audio/code/chatbot/productivity/marketing/design/data/agent/education)", "tags": ["tag1","tag2","tag3"], "pricing": "Free/Freemium/Paid/Open Source", "rating": number(3.5-5.0)}
EOF

    ANALYZE_RESULT=$(call_ai "$ANALYZE_PROMPT_FILE" 1000)
    rm -f "$ANALYZE_PROMPT_FILE"
    
    if [ -z "$ANALYZE_RESULT" ]; then
      log "  ⚠ 分析失败: $TOOL_NAME"
      continue
    fi
    
    TOOL_DATA_FILE="$TMPDIR/tool_data_$$.json"
    echo "$ANALYZE_RESULT" | python3 -c "
import sys, json, re
text = sys.stdin.read()
try:
    data = json.loads(text)
    if isinstance(data, dict):
        print(json.dumps(data))
    else:
        print('')
except:
    m = re.search(r'\{.*\}', text, re.DOTALL)
    if m:
        try:
            data = json.loads(m.group())
            print(json.dumps(data))
        except:
            print('')
    else:
        print('')
" > "$TOOL_DATA_FILE" 2>/dev/null || true
    
    if [ ! -s "$TOOL_DATA_FILE" ]; then
      log "  ⚠ 分析格式异常: $TOOL_NAME"
      rm -f "$TOOL_DATA_FILE"
      continue
    fi
    
    # 提取字段
    NAME_CN=$(jq -r '.nameCN // "'"$TOOL_NAME"'"' "$TOOL_DATA_FILE")
    DESC_CN=$(jq -r '.descriptionCN // "暂无描述"' "$TOOL_DATA_FILE")
    FINAL_CAT=$(jq -r '.category // "'"$CATEGORY"'"' "$TOOL_DATA_FILE")
    PRICING=$(jq -r '.pricing // "Freemium"' "$TOOL_DATA_FILE")
    RATING=$(jq -r '.rating // 4' "$TOOL_DATA_FILE")
    TAGS_JSON=$(jq -c '.tags // []' "$TOOL_DATA_FILE")
    
    # 验证 pricing
    case "$PRICING" in
      Free|Freemium|Paid|"Open Source") ;;
      *) PRICING="Freemium" ;;
    esac
    
    # 生成 ID
    TOOL_ID=$(echo "$TOOL_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/^-\|-$//g' | cut -c1-50)
    
    log "  ✅ $NAME_CN [$FINAL_CAT]"
    
    # 添加到结果文件
    NEW_TOOL_FILE="$TMPDIR/new_tool_$$.json"
    jq -n \
      --arg id "$TOOL_ID" \
      --arg name "$TOOL_NAME" \
      --arg nameCN "$NAME_CN" \
      --arg desc "$TOOL_DESC" \
      --arg descCN "$DESC_CN" \
      --arg url "$TOOL_URL" \
      --arg category "$FINAL_CAT" \
      --argjson tags "$TAGS_JSON" \
      --arg pricing "$PRICING" \
      --argjson rating "$RATING" \
      --arg dateAdded "$(date '+%Y-%m-%d')" \
      '{
        id: $id,
        name: $name,
        nameCN: $nameCN,
        description: $desc,
        descriptionCN: $descCN,
        url: $url,
        category: $category,
        tags: $tags,
        pricing: $pricing,
        rating: $rating,
        isNew: true,
        dateAdded: $dateAdded
      }' > "$NEW_TOOL_FILE"
    
    # 合并到总结果
    jq -s '.[0] + [.[1]]' "$ALL_NEW_TOOLS_FILE" "$NEW_TOOL_FILE" > "$TMPDIR/merged_$$.json"
    mv "$TMPDIR/merged_$$.json" "$ALL_NEW_TOOLS_FILE"
    
    rm -f "$NEW_TOOL_FILE" "$TOOL_DATA_FILE"
    
    sleep 1
  done
  
  rm -f "$TOOLS_JSON_FILE"
  sleep 2
done

NEW_COUNT=$(jq 'length' "$ALL_NEW_TOOLS_FILE")
log ""
log "📊 搜索完成，共发现 $NEW_COUNT 个新工具"

if [ "$NEW_COUNT" -eq 0 ]; then
  log "✅ 没有新工具需要添加"
  rm -f "$ALL_NEW_TOOLS_FILE"
  exit 0
fi

# 输出新工具列表
log ""
log "📋 新增工具列表:"
jq -r 'to_entries[] | "  \(.key + 1). \(.value.nameCN) (\(.value.name)) [\(.value.category)] - \(.value.descriptionCN)\n     \(.value.url)"' "$ALL_NEW_TOOLS_FILE"

# 写入文件
if [ "$DRY_RUN" = false ]; then
  log ""
  log "💾 写入 $TOOLS_FILE..."
  
  # 用 Python 生成 TypeScript 条目并插入
  python3 << PYEOF
import json

with open("$ALL_NEW_TOOLS_FILE", "r") as f:
    new_tools = json.load(f)

entries = []
for t in new_tools:
    tags = ", ".join(f"'{tag}'" for tag in t.get("tags", []))
    entry = f"""  {{
    id: '{t["id"]}',
    name: '{t["name"]}',
    nameCN: '{t["nameCN"]}',
    description: '{t["description"]}',
    descriptionCN: '{t["descriptionCN"]}',
    url: '{t["url"]}',
    logo: '',
    category: '{t["category"]}',
    tags: [{tags}],
    pricing: '{t["pricing"]}',
    rating: {t["rating"]},
    isNew: true,
    dateAdded: '{t["dateAdded"]}',
  }}"""
    entries.append(entry)

insertion = ",\n".join(entries) + ","

with open("$TOOLS_FILE", "r") as f:
    content = f.read()

# 在 ]; 之前插入
marker = "\n];\n\n// Build categories"
if marker in content:
    content = content.replace(marker, "\n" + insertion + marker)
    with open("$TOOLS_FILE", "w") as f:
        f.write(content)
    print(f"✅ 成功添加 {len(new_tools)} 个新工具！")
else:
    print("❌ 无法找到插入位置")
    exit(1)
PYEOF
else
  log ""
  log "🔍 试运行模式 - 未写入文件"
fi

rm -f "$ALL_NEW_TOOLS_FILE"
log ""
log "🎉 抓取任务完成！"
