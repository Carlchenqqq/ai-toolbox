'use client';

import { useState } from 'react';
import { Category } from '@/types';

interface CategoryFilterProps {
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  categories: Category[];
}

export function CategoryFilter({ activeCategory, onCategoryChange, categories }: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayCategories = isExpanded ? categories : categories.slice(0, 8);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 justify-center">
        {/* All */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${activeCategory === null
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }
          `}
        >
          全部工具
        </button>

        {/* Categories */}
        {displayCategories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => onCategoryChange(activeCategory === cat.slug ? null : cat.slug)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${activeCategory === cat.slug
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }
            `}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.name}
            <span className="ml-1.5 text-xs opacity-60">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Expand/Collapse */}
      {categories.length > 8 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mx-auto mt-3 block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? '收起 ↑' : `查看更多 (${categories.length - 8}) ↓`}
        </button>
      )}
    </div>
  );
}
