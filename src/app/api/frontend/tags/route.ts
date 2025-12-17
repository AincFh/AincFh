import { NextResponse } from 'next/server'
import { PostService } from '@/shared/services/post-service'

export const runtime = 'edge'

export async function GET() {
  try {
    const tags = await PostService.getAllTags()

    return NextResponse.json({
      ok: true,
      data: tags
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch tags'
    }, { status: 500 })
  }
}
