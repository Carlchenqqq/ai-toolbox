import type { NextConfig } from "next";

const securityHeaders = [
  // Content Security Policy - 防止 XSS 和数据注入
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  // 防止点击劫持
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // 启用 HSTS - 强制 HTTPS
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // 防止 MIME 类型嗅探
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // XSS 保护（旧浏览器兼容）
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // 控制 Referrer 信息泄露
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 限制浏览器功能
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // 安全响应头
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // 生产环境不暴露源码映射
  productionBrowserSourceMaps: false,
  // 禁用 powered-by 头，隐藏 Next.js 版本
  poweredByHeader: false,
  // 静态页面图片优化域名限制
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
