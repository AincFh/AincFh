import { NextRequest, NextResponse } from 'next/server';
import { CommentModel } from '@/backend/models/comment';
import { verifyToken } from '@/backend/utils/jwt';

export const runtime = 'edge';

// 使用Next.js内置的Params类型
type Params = {
  params: {
    id: string;
  };
};

// 更新评论状态（审核/拒绝）
export async function PUT(request: NextRequest) {
    try {
        // 从URL中获取id参数
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return NextResponse.json(
                { error: '无效的评论 ID' },
                { status: 400 }
            );
        }

        const commentId = parseInt(id);

        if (isNaN(commentId)) {
            return NextResponse.json(
                { error: '无效的评论 ID' },
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
        const { status } = body;

        if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { error: '无效的状态值' },
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

        // 创建CommentModel实例
        // @ts-ignore
        const commentModel = new CommentModel(db);
        const updatedComment = await commentModel.update(commentId, { status });

        if (!updatedComment) {
            return NextResponse.json(
                { error: '评论不存在' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '评论状态已更新',
        });

    } catch (error) {
        console.error('Update comment error:', error);
        return NextResponse.json(
            { error: '更新评论失败' },
            { status: 500 }
        );
    }
}

// 删除评论
export async function DELETE(request: NextRequest) {
    try {
        // 从URL中获取id参数
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return NextResponse.json(
                { error: '无效的评论 ID' },
                { status: 400 }
            );
        }

        const commentId = parseInt(id);

        if (isNaN(commentId)) {
            return NextResponse.json(
                { error: '无效的评论 ID' },
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

        // 创建CommentModel实例
        // @ts-ignore
        const commentModel = new CommentModel(db);
        await commentModel.delete(commentId);

        return NextResponse.json({
            success: true,
            message: '评论已删除',
        });

    } catch (error) {
        console.error('Delete comment error:', error);
        return NextResponse.json(
            { error: '删除评论失败' },
            { status: 500 }
        );
    }
}
