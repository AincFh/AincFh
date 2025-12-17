import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/shared/services/post-service'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const posts = await PostService.getAllPosts()
  return NextResponse.json({ ok: true, posts })
}