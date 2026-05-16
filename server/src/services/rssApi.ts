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

function createRssFetcher(urls: string[], source: SourceName): () => Promise<NewsItem[]> {
  return async () => {
    const results = await Promise.allSettled(urls.map((url) => fetchFeed(url, source)))
    return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
  }
}

export const fetchPositiveNews = createRssFetcher(
  ['https://www.positive.news/feed/'],
  SourceName.PositiveNews,
)
export const fetchReasonsToBeCheerful = createRssFetcher(
  ['https://reasonstobecheerful.world/feed/'],
  SourceName.ReasonsToBeCheerful,
)
export const fetchUpworthy = createRssFetcher(
  ['https://www.upworthy.com/rss'],
  SourceName.Upworthy,
)
export const fetchMongabay = createRssFetcher(
  ['https://news.mongabay.com/feed/'],
  SourceName.Mongabay,
)
export const fetchTheConversation = createRssFetcher(
  [
    'https://theconversation.com/us/science/articles.atom',
    'https://theconversation.com/us/environment/articles.atom',
  ],
  SourceName.TheConversation,
)
export const fetchAtlasObscura = createRssFetcher(
  ['https://www.atlasobscura.com/feeds/latest'],
  SourceName.AtlasObscura,
)
export const fetchScienceAlert = createRssFetcher(
  ['https://www.sciencealert.com/feed'],
  SourceName.ScienceAlert,
)

async function fetchFeed(feedUrl: string, source: SourceName): Promise<NewsItem[]> {
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
        tag: item.categories?.[0] ?? feed.title ?? '',
        source,
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
