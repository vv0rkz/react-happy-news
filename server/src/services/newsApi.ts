import { SourceName, type NewsItem } from '../types/news.types'

const BASE_URL = process.env.NEWSAPI_BASE_URL!
const API_KEY = process.env.NEWSAPI_KEY!

interface NewsApiArticle {
  title: string | null
  description: string | null
  urlToImage: string | null
  publishedAt: string
  author: string | null
  source: { name: string }
  url: string
}

interface NewsApiResponse {
  status: string
  articles: NewsApiArticle[]
}

export async function fetchNewsApiNews(): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    language: 'en',
    pageSize: '50',
    category: 'science',
  })

  const res = await fetch(`${BASE_URL}/top-headlines?${params}`)

  if (!res.ok) {
    throw new Error(`NewsAPI error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as NewsApiResponse

  return data.articles
    .filter((a) => a.title && a.title !== '[Removed]')
    .map((article, i) => ({
      id: `newsapi-${i}-${article.url.slice(-20)}`,
      title: article.title ?? '',
      image: article.urlToImage ?? '',
      description: article.description ?? '',
      published: article.publishedAt,
      author: article.author ?? article.source.name,
      tag: article.source.name,
      source: SourceName.NewsApi,
    }))
}
