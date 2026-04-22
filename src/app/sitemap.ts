import type { MetadataRoute } from 'next';
import { tools, categories } from '@/data/tools';

const BASE_URL = 'https://ai-toolbox.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  // 首页
  const home = {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  };

  // 分类页
  const categoryPages = categories.map(cat => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 工具详情页
  const toolPages = tools.map(tool => ({
    url: `${BASE_URL}/tool/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [home, ...categoryPages, ...toolPages];
}
