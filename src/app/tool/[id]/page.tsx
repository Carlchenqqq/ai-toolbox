import { tools, categories } from '@/data/tools';
import { ToolDetailClient } from './ToolDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// 允许的 id 格式：仅小写字母、数字、连字符
const ID_PATTERN = /^[a-z0-9-]+$/;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return tools.map(tool => ({ id: tool.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // 格式验证
  if (!ID_PATTERN.test(id)) return {};

  const tool = tools.find(t => t.id === id);
  if (!tool) return {};

  return {
    title: `${tool.nameCN} - ${tool.descriptionCN} | AI Toolbox`,
    description: tool.descriptionCN,
  };
}

export default async function ToolPage({ params }: Props) {
  const { id } = await params;

  // 格式验证：阻止路径遍历等攻击
  if (!ID_PATTERN.test(id)) {
    notFound();
  }

  const tool = tools.find(t => t.id === id);

  if (!tool) {
    notFound();
  }

  const category = categories.find(c => c.slug === tool.category);
  const relatedTools = tools
    .filter(t => t.category === tool.category && t.id !== tool.id)
    .slice(0, 4);

  return <ToolDetailClient tool={tool} category={category} relatedTools={relatedTools} />;
}
