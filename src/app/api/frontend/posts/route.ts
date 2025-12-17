import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/shared/services/post-service'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // 获取查询参数
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const category = searchParams.get('category') || undefined
  const tag = searchParams.get('tag') || undefined

  try {
    const result = await PostService.getPaginatedPosts({
      page,
      limit,
      category,
      tag
    })

    return NextResponse.json({
      ok: true,
      data: result.posts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch posts'
    }, { status: 500 })
  }
}
