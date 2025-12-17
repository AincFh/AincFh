import { NextResponse } from 'next/server'
import { PostService } from '@/shared/services/post-service'

export const runtime = 'edge'

export async function GET(request: Request) {
  // 从URL中获取id参数
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({
      ok: false,
      error: 'Invalid post ID'
    }, { status: 400 });
  }

  try {
    const post = await PostService.getPostById(id)

    if (!post) {
      return NextResponse.json({
        ok: false,
        error: 'Post not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: post
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch post'
    }, { status: 500 })
  }
}
