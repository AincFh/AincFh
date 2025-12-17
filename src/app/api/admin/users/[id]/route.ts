import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/backend/models/user';
import { verifyToken } from '@/backend/utils/jwt';
import { hashPassword } from '@/backend/utils/hash';

export const runtime = 'edge';

interface RouteParams {
    params: {
        id: string;
    };
}

// 更新用户信息
export async function PUT(request: NextRequest) {
    try {
        // 从URL中获取id参数
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return NextResponse.json(
                { error: '无效的用户 ID' },
                { status: 400 }
            );
        }

        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: '无效的用户 ID' },
                { status: 400 }
            );
        }

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
        const { name, role, bio, avatar_url, password } = body;

        // @ts-ignore
        const db = process.env.DB;

        if (!db) {
            return NextResponse.json(
                { error: '数据库连接失败' },
                { status: 500 }
            );
        }

        // 如果包含密码，需要重新哈希
        let updateData: any = { name, role, bio, avatar_url };
        if (password) {
            updateData.password_hash = await hashPassword(password);
        }

        // 创建UserModel实例
        // @ts-ignore
        const userModel = new UserModel(db);
        const updatedUser = await userModel.update(userId, updateData);

        if (!updatedUser) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            );
        }

        // 移除密码哈希
        const { password_hash, ...sanitizedUser } = updatedUser;

        return NextResponse.json({
            success: true,
            data: sanitizedUser,
        });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: '更新用户失败' },
            { status: 500 }
        );
    }
}

// 删除用户
export async function DELETE(request: NextRequest) {
    try {
        // 从URL中获取id参数
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return NextResponse.json(
                { error: '无效的用户 ID' },
                { status: 400 }
            );
        }

        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: '无效的用户 ID' },
                { status: 400 }
            );
        }

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

        // 不允许删除自己
        if (userId === payload.userId) {
            return NextResponse.json(
                { error: '不能删除自己的账户' },
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
        await userModel.delete(userId);

        return NextResponse.json({
            success: true,
            message: '用户已删除',
        });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: '删除用户失败' },
            { status: 500 }
        );
    }
}

// 切换用户激活状态
export async function PATCH(request: NextRequest) {
    try {
        // 从URL中获取id参数
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return NextResponse.json(
                { error: '无效的用户 ID' },
                { status: 400 }
            );
        }

        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: '无效的用户 ID' },
                { status: 400 }
            );
        }

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
        const success = await userModel.toggleActive(userId);

        if (!success) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '用户状态已更新',
        });

    } catch (error) {
        console.error('Toggle user active error:', error);
        return NextResponse.json(
            { error: '更新用户状态失败' },
            { status: 500 }
        );
    }
}
