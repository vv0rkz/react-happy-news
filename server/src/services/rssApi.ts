import { createHash } from 'crypto'
import Parser from 'rss-parser'
import { SourceName, type NewsItem } from '../types/news.types'

type CustomItem = {
  'content:encoded'?: string
  'media:content'?: { $?: { url?: string } }
}

const parser = new Parser<Record<string, never>, CustomItem>({
  customFields: { item: ['content:encoded', 'media:content'] },
})

// Минимальная длина тела — отсеивает attribution-footers (~80-100 символов)
const MIN_BODY_LENGTH = 300

const RSS_FEEDS = [
  { url: 'https://www.positive.news/feed/', tag: 'Positive News' },
  { url: 'https://reasonstobecheerful.world/feed/', tag: 'Reasons to be Cheerful' },
  { url: 'https://www.upworthy.com/rss', tag: 'Upworthy' },
  { url: 'https://news.mongabay.com/feed/', tag: 'Mongabay' },
  { url: 'https://theconversation.com/us/science/articles.atom', tag: 'The Conversation' },
  { url: 'https://theconversation.com/us/environment/articles.atom', tag: 'The Conversation' },
  { url: 'https://www.atlasobscura.com/feeds/latest', tag: 'Atlas Obscura' },
  { url: 'https://www.sciencealert.com/feed', tag: 'ScienceAlert' },
]

export async function fetchRssNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(RSS_FEEDS.map(({ url, tag }) => fetchFeed(url, tag)))

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}

async function fetchFeed(feedUrl: string, tag: string): Promise<NewsItem[]> {
  const feed = await parser.parseURL(feedUrl)

  return (feed.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item) => {
      const fullBody = extractBody(item)
      const image = extractImage(item, fullBody)
      return {
        id: `rss-${createHash('md5').update(item.link!).digest('hex').slice(0, 16)}`,
        title: item.title!,
        image,
        description: item.contentSnippet ?? item.summary ?? '',
        published: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        author: item.creator ?? feed.title ?? 'Unknown',
        tag,
        source: SourceName.Rss,
        url: item.link!,
        body: fullBody,
        hasFullContent: fullBody !== null,
      }
    })
}

function extractBody(item: Parser.Item & CustomItem): string | null {
  // content:encoded (RSS), content (Atom), summary (RSS <description> / Atom <summary>)
  const candidates = [item['content:encoded'], item.content, item.summary]
  for (const candidate of candidates) {
    if (candidate && candidate.trim().length > MIN_BODY_LENGTH) return candidate
  }
  return null
}

function extractImage(item: Parser.Item & CustomItem, body: string | null): string {
  // media:content (Nautilus, некоторые Mongabay)
  const mediaUrl = item['media:content']?.['$']?.url
  if (mediaUrl) return mediaUrl

  // enclosure (Mongabay, другие)
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) return item.enclosure.url

  // первый <img> в теле статьи
  if (body) {
    const match = body.match(/<img[^>]+src="([^"]+)"/)
    if (match?.[1]) return match[1]
  }

  // первый <img> в summary/description
  if (item.summary) {
    const match = item.summary.match(/<img[^>]+src="([^"]+)"/)
    if (match?.[1]) return match[1]
  }

  return ''
}
