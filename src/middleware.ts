import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 速率限制存储（生产环境应使用Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// 清理过期记录
function cleanupExpiredRecords() {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

// 检查速率限制
function checkRateLimit(identifier: string, maxAttempts: number, windowMs: number): boolean {
    cleanupExpiredRecords();

    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
        // 创建新记录
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return true;
    }

    if (record.count >= maxAttempts) {
        return false; // 超过限制
    }

    // 增加计数
    record.count++;
    return true;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 只对管理员登录API进行速率限制
    if (pathname === '/api/admin/login') {
        // 获取客户端IP
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // 速率限制：每个IP 5次/15分钟
        const allowed = checkRateLimit(ip, 5, 15 * 60 * 1000);

        if (!allowed) {
            return NextResponse.json(
                {
                    error: '请求过于频繁，请15分钟后再试',
                    code: 'RATE_LIMIT_EXCEEDED'
                },
                { status: 429 }
            );
        }
    }

    // 安全头部
    const response = NextResponse.next();

    // 添加安全响应头
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 只对admin路由添加严格的CSP
    if (pathname.startsWith('/admin')) {
        response.headers.set(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';"
        );
    }

    return response;
}

export const config = {
    matcher: [
        '/api/admin/:path*',
        '/admin/:path*'
    ],
};
