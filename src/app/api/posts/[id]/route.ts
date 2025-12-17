export const runtime = 'edge';

import { NextResponse } from 'next/server'
import { PostService } from '@/shared/services/post-service'

export async function GET(request: Request, { params }: any) {
  const post = await PostService.getPostById(params.id)
  if (!post) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  return NextResponse.json({ ok: true, post })
}