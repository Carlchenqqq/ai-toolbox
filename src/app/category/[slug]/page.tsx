import { tools, categories } from '@/data/tools';
import { CategoryPageClient } from './CategoryPageClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// 允许的 slug 格式：仅小写字母、数字、连字符
const SLUG_PATTERN = /^[a-z0-9-]+$/;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map(cat => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // 格式验证
  if (!SLUG_PATTERN.test(slug)) return {};

  const category = categories.find(c => c.slug === slug);
  if (!category) return {};

  return {
    title: `${category.name} AI 工具 - AI Toolbox`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  // 格式验证：阻止路径遍历等攻击
  if (!SLUG_PATTERN.test(slug)) {
    notFound();
  }

  const category = categories.find(c => c.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryTools = tools.filter(t => t.category === slug);

  return <CategoryPageClient category={category} tools={categoryTools} />;
}
