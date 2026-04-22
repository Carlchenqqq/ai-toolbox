import Link from 'next/link';
import { Star, ExternalLink, Sparkles } from 'lucide-react';
import { AITool } from '@/types';

interface ToolCardProps {
  tool: AITool;
  index?: number;
}

const pricingLabels: Record<string, { label: string; color: string }> = {
  'Free': { label: '免费', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  'Freemium': { label: '免费增值', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'Paid': { label: '付费', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  'Open Source': { label: '开源', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
};

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const pricing = pricingLabels[tool.pricing] || pricingLabels['Free'];
  const staggerClass = index < 8 ? `stagger-${index + 1}` : '';

  return (
    <Link
      href={`/tool/${tool.id}`}
      className={`
        group relative flex flex-col p-5 rounded-2xl border border-border
        bg-card hover:border-primary/30 hover:shadow-lg
        transition-all duration-300 hover:-translate-y-1
        opacity-0 animate-fade-in ${staggerClass}
      `}
    >
      {/* Featured badge */}
      {tool.featured && (
        <div className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-md">
          精选
        </div>
      )}

      {/* New badge */}
      {tool.isNew && !tool.featured && (
        <div className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-semibold shadow-md flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          新收录
        </div>
      )}

      {/* Top row: Logo + Name + Pricing */}
      <div className="flex items-start gap-3.5 mb-3">
        <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
          {/* Fallback to first letter if no logo */}
          <span className="text-lg font-bold text-primary">
            {tool.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {tool.nameCN || tool.name}
            </h3>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground truncate">{tool.name}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1">
        {tool.descriptionCN}
      </p>

      {/* Bottom row: Tags + Rating + Pricing */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {tool.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{tool.rating}</span>
          </div>
          {/* Pricing */}
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${pricing.color}`}>
            {pricing.label}
          </span>
        </div>
      </div>
    </Link>
  );
}
