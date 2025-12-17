import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/backend/models/user';
import { verifyPassword } from '@/backend/utils/hash';
import { generateToken } from '@/backend/utils/jwt';
import { D1Database } from '@cloudflare/workers-types';

export const runtime = 'edge';

interface LoginRequest {
    email: string;
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json();
        const { email, password } = body;

        // 验证必填字段
        if (!email || !password) {
            return NextResponse.json(
                { error: '邮箱和密码不能为空' },
                { status: 400 }
            );
        }

        // 获取 D1 数据库实例
        // @ts-ignore - Cloudflare Workers 环境变量
        const db = (globalThis as any).DB as D1Database;

        if (!db) {
            return NextResponse.json(
                { error: '数据库连接失败' },
                { status: 500 }
            );
        }

        // 创建UserModel实例
        const userModel = new UserModel(db);

        // 查找用户
        const user = await userModel.findByEmail(email);

        if (!user) {
            return NextResponse.json(
                { error: '邮箱或密码错误' },
                { status: 401 }
            );
        }

        // 验证用户状态
        if (!user.is_active) {
            return NextResponse.json(
                { error: '账户已被禁用' },
                { status: 403 }
            );
        }

        // 验证密码
        const isPasswordValid = await verifyPassword(password, user.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: '邮箱或密码错误' },
                { status: 401 }
            );
        }

        // 检查是否为管理员
        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: '权限不足，仅管理员可登录' },
                { status: 403 }
            );
        }

        // 生成 JWT Token
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        const token = await generateToken(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            jwtSecret,
            '7d' // 7天有效期
        );

        // 返回用户信息和 Token
        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar_url: user.avatar_url,
                },
                token,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            error: '登录失败，请稍后重试',
            details: error instanceof Error ? error.message : String(error)
        }, {
            status: 500
        });
    }
}
