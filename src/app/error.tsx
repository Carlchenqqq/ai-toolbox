'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold mb-3">页面出了点问题</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          抱歉，页面加载时遇到了一个错误。请稍后重试。
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            重新加载
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-xl border border-border font-medium hover:bg-muted transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
