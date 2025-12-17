import { NextRequest, NextResponse } from 'next/server';
import { CommentModel } from '@/backend/models/comment';
import { verifyToken } from '@/backend/utils/jwt';

export const runtime = 'edge';

// 获取评论列表
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

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id') ? parseInt(searchParams.get('post_id')!) : undefined;
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | undefined;

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

    let comments;
    if (postId) {
      comments = await commentModel.findByPost(postId);
    } else if (status) {
      // 使用findAll方法并传递状态过滤条件
      const result = await commentModel.findAll({ status }, { page: 1, pageSize: 100 });
      comments = result.data;
    } else {
      // 获取所有评论（可以后续添加分页）
      const result = await commentModel.findAll({}, { page: 1, pageSize: 100 });
      comments = result.data;
    }

    return NextResponse.json({
      success: true,
      data: comments,
    });

  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: '获取评论列表失败' },
      { status: 500 }
    );
  }
}

// 创建评论（一般由前台用户创建，这里保留接口）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_id, author_name, author_email, content, parent_id } = body;

    if (!post_id || !author_name || !author_email || !content) {
      return NextResponse.json(
        { error: '缺少必填字段' },
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

    const comment = await commentModel.create({
      post_id,
      author_name,
      author_email,
      content,
      parent_id: parent_id || null,
    });

    return NextResponse.json({
      success: true,
      data: comment,
    }, { status: 201 });

  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: '创建评论失败' },
      { status: 500 }
    );
  }
}
