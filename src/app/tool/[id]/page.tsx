import { tools, categories } from '@/data/tools';
import { ToolDetailClient } from './ToolDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return tools.map(tool => ({ id: tool.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tool = tools.find(t => t.id === id);
  if (!tool) return {};

  return {
    title: `${tool.nameCN} - ${tool.descriptionCN} | AI Toolbox`,
    description: tool.descriptionCN,
  };
}

export default async function ToolPage({ params }: Props) {
  const { id } = await params;
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
