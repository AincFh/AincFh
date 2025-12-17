import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/shared/services/post-service'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''

  try {
    const results = await PostService.searchPosts(query)

    return NextResponse.json({
      ok: true,
      data: results,
      query
    })
  } catch (error) {
    console.error('Error searching posts:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to search posts'
    }, { status: 500 })
  }
}
