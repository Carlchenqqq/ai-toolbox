import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 危险路径黑名单 - 防止路径遍历和探测
const BLOCKED_PATHS = [
  '/.env',
  '/.env.local',
  '/.env.production',
  '/.git',
  '/.git/',
  '/.gitconfig',
  '/.htaccess',
  '/wp-admin',
  '/wp-login',
  '/wp-config',
  '/admin',
  '/phpmyadmin',
  '/phpmyadmin/',
  '/mysql',
  '/server-status',
  '/server-info',
  '/.well-known/security.txt',
  '/config.json',
  '/package.json',
  '/tsconfig.json',
  '/next.config.js',
  '/next.config.ts',
  '/.next/',
  '/api/',
];

// 可疑查询参数 - 常见攻击特征
const SUSPICIOUS_PARAMS = [
  'exec',
  'system',
  'passthru',
  'shell_exec',
  'eval',
  'assert',
  'preg_replace',
  'create_function',
  'call_user_func',
  'base64_decode',
  'rawurldecode',
  'gzinflate',
  'str_rot13',
  'file_get_contents',
  'fopen',
  'fwrite',
  'include',
  'require',
  '../',
  '..\\',
  '%00',
  '<script',
  'javascript:',
  'onerror=',
  'onload=',
  'onclick=',
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const response = NextResponse.next();

  // 1. 阻止危险路径访问
  const normalizedPath = pathname.toLowerCase();
  for (const blocked of BLOCKED_PATHS) {
    if (normalizedPath === blocked || normalizedPath.startsWith(blocked + '/') || normalizedPath.includes(blocked)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // 2. 检测可疑查询参数
  const searchLower = search.toLowerCase();
  for (const suspicious of SUSPICIOUS_PARAMS) {
    if (searchLower.includes(suspicious.toLowerCase())) {
      return new NextResponse(null, { status: 400 });
    }
  }

  // 3. 阻止非标准 HTTP 方法（仅允许 GET/HEAD）
  const method = request.method.toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // 4. 阻止路径遍历尝试
  if (pathname.includes('..') || pathname.includes('%2e%2e') || pathname.includes('%252e')) {
    return new NextResponse(null, { status: 400 });
  }

  // 5. 阻止空字节注入
  if (pathname.includes('%00') || pathname.includes('\0')) {
    return new NextResponse(null, { status: 400 });
  }

  // 6. 阻止目录列举请求（以 / 结尾的非页面路径）
  if (pathname.endsWith('/') && pathname !== '/') {
    // 允许分类路径等正常路由
    const validPrefixes = ['/category/', '/tool/'];
    const isValidRoute = validPrefixes.some(p => pathname.startsWith(p));
    if (!isValidRoute) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    // 匹配所有路径，排除静态文件和 _next 内部路由
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
