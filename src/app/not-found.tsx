import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold mb-3">页面不存在</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          你访问的页面不存在或已被移除。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
