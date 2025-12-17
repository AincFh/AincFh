import { NextRequest, NextResponse } from 'next/server';
import { TagModel } from '@/backend/models/tag';
import { verifyToken } from '@/backend/utils/jwt';

export const runtime = 'edge';

// 获取标签列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    // @ts-ignore
    const db = process.env.DB;

    if (!db) {
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      );
    }

    // 创建TagModel实例
    // @ts-ignore
    const tagModel = new TagModel(db);

    let tags;
    if (search) {
      tags = await tagModel.search(search);
    } else {
      tags = await tagModel.findAll();
    }

    return NextResponse.json({
      success: true,
      data: tags,
    });

  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json(
      { error: '获取标签列表失败' },
      { status: 500 }
    );
  }
}

// 创建新标签
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
    const { name, slug } = body;

    if (!name) {
      return NextResponse.json(
        { error: '标签名称不能为空' },
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

    // 创建TagModel实例
    // @ts-ignore
    const tagModel = new TagModel(db);

    const tag = await tagModel.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    });

    return NextResponse.json({
      success: true,
      data: tag,
    }, { status: 201 });

  } catch (error) {
    console.error('Create tag error:', error);
    return NextResponse.json(
      { error: '创建标签失败' },
      { status: 500 }
    );
  }
}
