'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const MAX_SEARCH_LENGTH = 100; // 搜索输入最大长度
const DEBOUNCE_MS = 300; // 防抖延迟

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = '搜索 AI 工具...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = useCallback((value: string) => {
    // 输入长度限制，防止超长输入
    const sanitized = value.slice(0, MAX_SEARCH_LENGTH);
    setQuery(sanitized);

    // 防抖：避免每次按键都触发搜索
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(sanitized);
    }, DEBOUNCE_MS);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
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
          maxLength={MAX_SEARCH_LENGTH}
          autoComplete="off"
          spellCheck={false}
          aria-label="搜索 AI 工具"
          className="w-full pl-12 pr-12 py-4 bg-transparent text-foreground placeholder:text-muted-foreground text-base outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="清除搜索"
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
