import { SourceName, type NewsItem } from '../types/news.types'

const BASE_URL = process.env.HACKERNEWS_BASE_URL!

interface HnItem {
  id: number
  title?: string
  url?: string
  by?: string
  time?: number
  type?: string
}

async function fetchItem(id: number): Promise<HnItem | null> {
  try {
    const res = await fetch(`${BASE_URL}/item/${id}.json`)
    if (!res.ok) return null
    return (await res.json()) as HnItem
  } catch {
    return null
  }
}

export async function fetchHackerNews(): Promise<NewsItem[]> {
  const res = await fetch(`${BASE_URL}/topstories.json`)

  if (!res.ok) {
    throw new Error(`HackerNews API error: ${res.status} ${res.statusText}`)
  }

  const ids = (await res.json()) as number[]

  const items = await Promise.all(ids.slice(0, 30).map(fetchItem))

  return items
    .filter((item): item is HnItem => item !== null && item.type === 'story' && !!item.title)
    .map((item) => ({
      id: `hackernews-${item.id}`,
      title: item.title!,
      image: '',
      description: '',
      published: item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString(),
      author: item.by ?? 'Unknown',
      tag: 'Technology',
      source: SourceName.HackerNews,
    }))
}
