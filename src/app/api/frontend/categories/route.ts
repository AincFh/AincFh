import { NextResponse } from 'next/server'
import { PostService } from '@/shared/services/post-service'

export const runtime = 'edge'

export async function GET() {
  try {
    const categories = await PostService.getAllCategories()

    return NextResponse.json({
      ok: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch categories'
    }, { status: 500 })
  }
}
