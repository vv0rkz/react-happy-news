import type { NewsItem } from '../types/news.types'

const BASE_URL = process.env.GUARDIAN_BASE_URL!
const API_KEY = process.env.GUARDIAN_API_KEY!

interface GuardianFields {
  thumbnail?: string
  trailText?: string
  byline?: string
}

interface GuardianResult {
  id: string
  webTitle: string
  webPublicationDate: string
  sectionName: string
  fields?: GuardianFields | null
}

interface GuardianResponse {
  response: {
    results: GuardianResult[]
  }
}

export async function fetchGuardianNews(): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    'api-key': API_KEY,
    'show-fields': 'thumbnail,trailText,byline',
    section: 'science|environment|culture|technology|lifeandstyle',
    'page-size': '50',
  })

  const res = await fetch(`${BASE_URL}/search?${params}`)

  if (!res.ok) {
    throw new Error(`Guardian API error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as GuardianResponse

  return data.response.results.map((item) => ({
    id: `guardian-${item.id}`,
    title: item.webTitle,
    image: item.fields?.thumbnail ?? '',
    description: item.fields?.trailText ?? '',
    published: item.webPublicationDate,
    author: item.fields?.byline ?? 'Unknown',
    tag: item.sectionName,
    source: 'guardian' as const,
  }))
}
