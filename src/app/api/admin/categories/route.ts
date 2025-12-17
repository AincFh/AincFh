import { NextRequest, NextResponse } from 'next/server';
import { CategoryModel } from '@/backend/models/category';
import { verifyToken } from '@/backend/utils/jwt';

export const runtime = 'edge';

// 获取分类列表
export async function GET(request: NextRequest) {
  try {
    // @ts-ignore
    const db = process.env.DB;

    if (!db) {
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      );
    }

    // 创建CategoryModel实例
    // @ts-ignore
    const categoryModel = new CategoryModel(db);
    const categories = await categoryModel.findAll();

    return NextResponse.json({
      success: true,
      data: categories,
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: '获取分类列表失败' },
      { status: 500 }
    );
  }
}

// 创建新分类
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
    const { name, slug, description, parent_id } = body;

    if (!name) {
      return NextResponse.json(
        { error: '分类名称不能为空' },
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

    // 创建CategoryModel实例
    // @ts-ignore
    const categoryModel = new CategoryModel(db);
    const category = await categoryModel.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      parent_id: parent_id || null,
    });

    return NextResponse.json({
      success: true,
      data: category,
    }, { status: 201 });

  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    );
  }
}
