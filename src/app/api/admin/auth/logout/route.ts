import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// 登出接口（JWT 是无状态的，主要在客户端清除 Token）
export async function POST(request: NextRequest) {
    try {
        // 如果使用了 KV 存储 Token 黑名单，可以在这里将 Token 加入黑名单
        // 目前采用客户端清除 Token 的方式

        return NextResponse.json({
            success: true,
            message: '登出成功',
        });

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: '登出失败' },
            { status: 500 }
        );
    }
}
