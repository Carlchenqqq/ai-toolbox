'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { ToolCard } from '@/components/ToolCard';
import { SearchBar } from '@/components/SearchBar';
import { Category } from '@/types';
import { AITool } from '@/types';

interface Props {
  category: Category;
  tools: AITool[];
}

export function CategoryPageClient({ category, tools: initialTools }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = searchQuery.trim()
    ? initialTools.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nameCN.includes(searchQuery) ||
        t.tags.some(tag => tag.includes(searchQuery)) ||
        t.descriptionCN.includes(searchQuery)
      )
    : initialTools;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          首页
        </Link>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="text-4xl mb-3">{category.icon}</div>
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-muted-foreground">{category.description}</p>
        <p className="text-sm text-muted-foreground mt-2">共 {initialTools.length} 个工具</p>
      </div>

      {/* Search within category */}
      <div className="mb-8">
        <SearchBar onSearch={setSearchQuery} placeholder={`在 ${category.name} 中搜索...`} />
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
            试试其他关键词
          </p>
        </div>
      )}
    </div>
  );
}
