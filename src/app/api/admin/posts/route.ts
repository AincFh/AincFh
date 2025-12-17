import { NextRequest, NextResponse } from 'next/server';
import { PostModel } from '@/backend/models/post';
import { verifyToken } from '@/backend/utils/jwt';

export const runtime = 'edge';

// 获取文章列表
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

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
    // 获取文章列表（带分页）
    const result = await postModel.findAll(
      {
        status: status as 'draft' | 'published' | 'archived' | undefined,
        search,
      },
      { page, pageSize: limit }
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
    });

  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: '获取文章列表失败' },
      { status: 500 }
    );
  }
}

// 创建新文章
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

    if (!payload) {
      return NextResponse.json(
        { error: 'Token 无效或已过期' },
        { status: 401 }
      );
    }

    // 检查是否为管理员
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 获取请求体
    const body = await request.json();
    const { title, slug, content, excerpt, cover_image_url, category_id, status = 'draft' } = body;

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
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
    // 创建文章
    const post = await postModel.create({
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      content,
      excerpt: excerpt || content.substring(0, 200),
      cover_image_url,
      author_id: payload.userId,
      category_id: category_id || null,
      status,
    });

    return NextResponse.json({
      success: true,
      data: post,
    }, { status: 201 });

  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: '创建文章失败' },
      { status: 500 }
    );
  }
}
