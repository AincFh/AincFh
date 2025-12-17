import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/shared/services/post-service'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const categories = await PostService.getAllCategories()
  return NextResponse.json({ ok: true, categories })
}