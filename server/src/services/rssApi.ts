import { createHash } from 'crypto'
import Parser from 'rss-parser'
import { SourceName, type NewsItem } from '../types/news.types'

type CustomItem = { 'content:encoded'?: string; 'media:content'?: { $?: { url?: string } } }

const parser = new Parser<Record<string, never>, CustomItem>({
  customFields: { item: ['content:encoded', 'media:content'] },
})

const RSS_FEEDS = [
  { url: 'https://www.positive.news/feed/', tag: 'Positive' },
  { url: 'https://www.goodnewsnetwork.org/feed/', tag: 'Good News' },
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
      const fullBody = item['content:encoded'] ?? null
      const image =
        item['media:content']?.['$']?.url ??
        (fullBody ? (fullBody.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? '') : '') ??
        ''
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
        hasFullContent: Boolean(fullBody && fullBody.trim().length > 0),
      }
    })
}
