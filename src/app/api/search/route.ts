export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/shared/services/post-service'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').toString()
  const result = q ? await PostService.searchPosts(q) : []
  return NextResponse.json({ ok: true, q, result })
}
