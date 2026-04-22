'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, Star, Tag, Globe, ChevronRight } from 'lucide-react';
import { ToolCard } from '@/components/ToolCard';
import { AITool, Category } from '@/types';

interface Props {
  tool: AITool;
  category: Category | undefined;
  relatedTools: AITool[];
}

const pricingConfig: Record<string, { label: string; description: string; color: string }> = {
  'Free': { label: '免费', description: '完全免费使用', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  'Freemium': { label: '免费增值', description: '基础功能免费，高级功能付费', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'Paid': { label: '付费', description: '需要付费订阅或购买', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  'Open Source': { label: '开源', description: '开源项目，可自由使用和修改', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
};

export function ToolDetailClient({ tool, category, relatedTools }: Props) {
  const pricing = pricingConfig[tool.pricing] || pricingConfig['Free'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 animate-fade-in">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          首页
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {category && (
          <>
            <Link href={`/category/${category.slug}`} className="hover:text-foreground transition-colors">
              {category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-foreground">{tool.nameCN}</span>
      </div>

      {/* Main content */}
      <div className="animate-slide-up">
        {/* Header card */}
        <div className="p-8 rounded-2xl border border-border bg-card mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-primary">{tool.name.charAt(0)}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{tool.nameCN}</h1>
                {tool.featured && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    精选
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mb-1">{tool.name}</p>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                {tool.descriptionCN}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Rating */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{tool.rating}</span>
                  <span className="text-xs text-muted-foreground">/ 5</span>
                </div>

                {/* Pricing */}
                <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${pricing.color}`}>
                  {pricing.label}
                </div>

                {/* Category */}
                {category && (
                  <Link
                    href={`/category/${category.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category.icon} {category.name}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Globe className="w-4 h-4" />
              访问官网
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tags */}
        <div className="p-6 rounded-2xl border border-border bg-card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">标签</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tool.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing info */}
        <div className="p-6 rounded-2xl border border-border bg-card mb-8">
          <h2 className="text-sm font-semibold mb-3">定价信息</h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${pricing.color}`}>
              {pricing.label}
            </span>
            <span className="text-sm text-muted-foreground">{pricing.description}</span>
          </div>
        </div>
      </div>

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">同分类推荐</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((t, i) => (
              <ToolCard key={t.id} tool={t} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
