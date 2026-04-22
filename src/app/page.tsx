import { tools, categories, getFeaturedTools } from '@/data/tools';
import { HomeClient } from './HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Toolbox - 发现最好的 AI 工具',
  description: '精选全球优质 AI 工具导航，涵盖写作、绘画、视频、编程、办公等多个领域，帮你快速找到最适合的 AI 工具。',
};

export default function HomePage() {
  const featuredTools = getFeaturedTools();
  const totalTools = tools.length;

  return (
    <HomeClient
      initialTools={tools}
      featuredTools={featuredTools}
      categories={categories}
      totalTools={totalTools}
    />
  );
}
