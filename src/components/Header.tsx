import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { tools } from '@/data/tools';

export function Header() {
  const totalTools = tools.length;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              AI <span className="gradient-text">Toolbox</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              首页
            </Link>
            <Link
              href="/#categories"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              分类浏览
            </Link>
            <Link
              href="/#featured"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              精选推荐
            </Link>
          </nav>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{totalTools}+ AI 工具已收录</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
