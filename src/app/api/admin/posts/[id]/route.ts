import { NextRequest, NextResponse } from 'next/server';
import { PostModel } from '@/backend/models/post';
import { verifyToken } from '@/backend/utils/jwt';

export const runtime = 'edge';

// 使用Next.js内置的Params类型
type Params = {
  params: {
    id: string;
  };
};

// 获取单篇文章详情
export async function GET(request: NextRequest) {
  try {
    // 从URL中获取id参数
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: '无效的文章 ID' },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '无效的文章 ID' },
        { status: 400 }
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

    // 创建PostModel实例
    // @ts-ignore
    const postModel = new PostModel(db);
    const post = await postModel.findById(postId);

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });

  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(request: NextRequest) {
  try {
    // 从URL中获取id参数
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: '无效的文章 ID' },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '无效的文章 ID' },
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

    // 获取 D1 数据库实例
    // @ts-ignore
    const db = process.env.DB;

    if (!db) {
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      );
    }

    // 创建PostModel实例
    // @ts-ignore
    const postModel = new PostModel(db);
    // 更新文章
    const updatedPost = await postModel.update(postId, body);

    if (!updatedPost) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPost,
    });

  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: '更新文章失败' },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(request: NextRequest) {
  try {
    // 从URL中获取id参数
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: '无效的文章 ID' },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '无效的文章 ID' },
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

    // 获取 D1 数据库实例
    // @ts-ignore
    const db = process.env.DB;

    if (!db) {
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      );
    }

    // 创建PostModel实例
    // @ts-ignore
    const postModel = new PostModel(db);
    // 删除文章
    await postModel.delete(postId);

    return NextResponse.json({
      success: true,
      message: '文章已删除',
    });

  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    );
  }
}
