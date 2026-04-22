import { tools, categories } from '@/data/tools';
import { CategoryPageClient } from './CategoryPageClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map(cat => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find(c => c.slug === slug);
  if (!category) return {};

  return {
    title: `${category.name} AI 工具 - AI Toolbox`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categories.find(c => c.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryTools = tools.filter(t => t.category === slug);

  return <CategoryPageClient category={category} tools={categoryTools} />;
}
