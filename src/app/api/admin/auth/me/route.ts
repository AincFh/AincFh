import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/backend/models/user';
import { verifyToken } from '@/backend/utils/jwt';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    try {
        // 获取 Authorization Header
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: '未授权，请先登录' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // 移除 "Bearer " 前缀

        // 验证 Token
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        const payload = await verifyToken(token, jwtSecret);

        if (!payload) {
            return NextResponse.json(
                { error: 'Token 无效或已过期' },
                { status: 401 }
            );
        }

        // 获取 D1 数据库实例
        // @ts-ignore
        const db = process.env.DB;

        if (!db) {
            return NextResponse.json(
                { error: '数据库连接失败' },
                { status: 500 }
            );
        }

        // 创建UserModel实例
        // @ts-ignore
        const userModel = new UserModel(db);
        // 获取用户信息
        const user = await userModel.findById(payload.userId);

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            );
        }

        // 检查用户状态
        if (!user.is_active) {
            return NextResponse.json(
                { error: '账户已被禁用' },
                { status: 403 }
            );
        }

        // 返回用户信息（不包含密码）
        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
                bio: user.bio,
                created_at: user.created_at,
            },
        });

    } catch (error) {
        console.error('Get user info error:', error);
        return NextResponse.json(
            { error: '获取用户信息失败' },
            { status: 500 }
        );
    }
}
