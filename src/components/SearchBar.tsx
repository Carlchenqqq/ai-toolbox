'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = '搜索 AI 工具...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={`relative w-full max-w-2xl mx-auto transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
      <div className={`
        relative flex items-center rounded-2xl border transition-all duration-200
        ${isFocused
          ? 'border-primary/50 shadow-[0_0_0_3px_rgba(109,40,217,0.1)] bg-card'
          : 'border-border bg-card/80 hover:border-border'
        }
      `}>
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-transparent text-foreground placeholder:text-muted-foreground text-base outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      {isFocused && !query && (
        <div className="absolute top-full mt-2 left-0 right-0 text-xs text-muted-foreground text-center animate-fade-in">
          试试搜索「写作」「绘画」「编程」等关键词
        </div>
      )}
    </div>
  );
}
