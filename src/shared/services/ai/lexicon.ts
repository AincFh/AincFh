import { Post } from '@/shared/types/post'
import { PostService } from '@/shared/services/post-service'

let indexBuilt = false
let tokenMap: Map<string, Set<string>> = new Map()
let postMap: Map<string, Post> = new Map()

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

async function buildIndex() {
  if (indexBuilt) return
  const posts = await PostService.getAllPosts()
  posts.forEach(p => {
    postMap.set(p.id, p)
    const bag = new Set<string>([
      ...normalize(p.title || ''),
      ...normalize(p.excerpt || ''),
      ...normalize((p.tags || []).join(' ')),
      ...normalize(p.content || '')
    ])
    bag.forEach(tok => {
      if (!tokenMap.has(tok)) tokenMap.set(tok, new Set())
      tokenMap.get(tok)!.add(p.id)
    })
  })
  indexBuilt = true
}

export async function searchLexicon(query: string) {
  await buildIndex()
  const tokens = normalize(query)
  const score: Map<string, number> = new Map()
  tokens.forEach(tok => {
    const ids = tokenMap.get(tok)
    if (!ids) return
    ids.forEach(id => {
      score.set(id, (score.get(id) || 0) + 1)
    })
  })
  const ranked = Array.from(score.entries()).sort((a, b) => b[1] - a[1])
  return ranked.map(([id, s]) => {
    const p = postMap.get(id)!
    const base = (p.excerpt || p.content || '').slice(0, 240)
    return { id: p.id, title: p.title, excerpt: p.excerpt, snippet: base, score: s }
  })
}