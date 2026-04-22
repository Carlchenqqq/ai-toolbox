'use client';

import { useState, useMemo } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ToolCard } from '@/components/ToolCard';
import { simpleSearch } from '@/data/tools';
import { Zap, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AITool, Category } from '@/types';

interface Props {
  initialTools: AITool[];
  featuredTools: AITool[];
  categories: Category[];
  totalTools: number;
}

export function HomeClient({ initialTools, featuredTools, categories, totalTools }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    let result = initialTools;

    if (activeCategory) {
      result = result.filter(t => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      result = simpleSearch(searchQuery, result);
    }

    return result;
  }, [searchQuery, activeCategory, initialTools]);

  const newTools = useMemo(() => {
    return initialTools.filter(t => t.isNew);
  }, [initialTools]);

  const activeCategoryName = activeCategory
    ? categories.find(c => c.slug === activeCategory)?.name
    : null;

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-3.5 h-3.5" />
              <span>已收录 {totalTools}+ 款优质 AI 工具</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
              发现最适合你的
              <br />
              <span className="gradient-text">AI 工具</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto animate-slide-up stagger-2">
              精选全球优质 AI 产品，涵盖写作、绘画、视频、编程等多个领域，一站式找到你的 AI 伙伴
            </p>

            {/* Search */}
            <div className="animate-slide-up stagger-3">
              <SearchBar onSearch={setSearchQuery} />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Categories Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </section>

      {/* Featured Section (only show when no filter) */}
      {!searchQuery && !activeCategory && (
        <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">精选推荐</h2>
            </div>
            <Link
              href="/#all-tools"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredTools.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* New Tools Section (only show when no filter and there are new tools) */}
      {!searchQuery && !activeCategory && newTools.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold">🆕 新收录</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {newTools.length} 个新工具
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {newTools.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* All Tools Section */}
      <section id="all-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {searchQuery
              ? `搜索 "${searchQuery}" 的结果`
              : activeCategoryName
                ? `${activeCategoryName} 工具`
                : '全部工具'
            }
          </h2>
          <span className="text-sm text-muted-foreground">
            共 {filteredTools.length} 个工具
          </span>
        </div>

        {/* Tools grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">没有找到匹配的工具</h3>
            <p className="text-sm text-muted-foreground">
              试试其他关键词或浏览全部分类
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
