import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/backend/models/user';
import { verifyToken } from '@/backend/utils/jwt';
import { hashPassword } from '@/backend/utils/hash';

export const runtime = 'edge';

// 获取用户列表
export async function GET(request: NextRequest) {
    try {
        // 验证 Token
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: '未授权，请先登录' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        const payload = await verifyToken(token, jwtSecret);

        if (!payload || payload.role !== 'admin') {
            return NextResponse.json(
                { error: '权限不足' },
                { status: 403 }
            );
        }

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
        const users = await userModel.findAll();

        // 移除密码哈希
        const sanitizedUsers = users.map(user => {
            const { password_hash, ...rest } = user;
            return rest;
        });

        return NextResponse.json({
            success: true,
            data: sanitizedUsers,
        });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: '获取用户列表失败' },
            { status: 500 }
        );
    }
}

// 创建新用户
export async function POST(request: NextRequest) {
    try {
        // 验证 Token
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: '未授权，请先登录' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        const payload = await verifyToken(token, jwtSecret);

        if (!payload || payload.role !== 'admin') {
            return NextResponse.json(
                { error: '权限不足' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { email, password, name, role = 'user', bio, avatar_url } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: '邮箱和密码不能为空' },
                { status: 400 }
            );
        }

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

        // 检查邮箱是否已存在
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: '邮箱已被使用' },
                { status: 400 }
            );
        }

        // 哈希密码
        const passwordHash = await hashPassword(password);

        // 创建用户
        const user = await userModel.create({
            email,
            password,
            name: name || email.split('@')[0],
            role,
        });

        if (!user) {
            return NextResponse.json(
                { error: '创建用户失败' },
                { status: 500 }
            );
        }

        // 移除密码哈希
        const { password_hash, ...sanitizedUser } = user;

        return NextResponse.json({
            success: true,
            data: sanitizedUser,
        }, { status: 201 });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: '创建用户失败' },
            { status: 500 }
        );
    }
}
