import Link from 'next/link';
import { Sparkles, GitFork, Mail } from 'lucide-react';
import { categories } from '@/data/tools';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                AI <span className="gradient-text">Toolbox</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              精选全球优质 AI 工具，帮你快速找到最适合的 AI 伙伴。
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-4">热门分类</h3>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-4">更多分类</h3>
            <ul className="space-y-2.5">
              {categories.slice(6, 12).map(cat => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">关于</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/submit"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  📝 提交工具
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <GitFork className="w-3.5 h-3.5" /> GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@aitoolbox.com"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> 联系我们
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 AI Toolbox. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            用 ❤️ 和 AI 构建
          </p>
        </div>
      </div>
    </footer>
  );
}
