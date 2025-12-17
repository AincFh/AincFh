export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { searchLexicon } from '@/shared/services/ai/lexicon'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const query = (body?.query || '').toString()
  const context = (body?.context || '').toString()
  const text = [query, context].filter(Boolean).join(' ').trim()
  const matches = text ? await searchLexicon(text) : []
  return NextResponse.json({ ok: true, query: text, matches })
}
