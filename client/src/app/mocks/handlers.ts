import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import mockNewsData from '@model/news/api/apiNews/mocks/newsData.json'
import mockNewsDetailsData from '@model/news/api/apiNews/mocks/newsDetailsData.json'
import { SourceName } from '@model/news/api/apiNews/utils/transforms.types'
import type { NewsItem } from '@model/news/api/apiNews/utils/transforms.types'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL

export const MOCK_ACCESS_TOKEN = 'mock-access'
export const MOCK_USER = { id: 'mock-id', email: 'mock@example.com' } as const
const MOCK_REFRESH_COOKIE = 'refreshToken'

function isValidBearer(request: Request): boolean {
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${MOCK_ACCESS_TOKEN}`
}

// --- Zod-схема для валидации JSON-моков при инициализации ---

const newsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
  published: z.string(),
  author: z.string(),
  tag: z.string(),
  source: z.nativeEnum(SourceName),
  url: z.string(),
  body: z.string().nullable().optional(),
  hasFullContent: z.boolean(),
})

const validatedMockNewsData = z.array(newsItemSchema).parse(mockNewsData) as NewsItem[]

// --- Seed-генератор для демонстрации виртуализации ---

const SEED_TOTAL = 500

const TITLES = [
  'Scientists discover new way to remove carbon from atmosphere',
  'Community-led reforestation project plants 10 million trees',
  'Breakthrough battery technology could power cities on wind alone',
  'Ocean plastic collection reaches record 100 tonnes in a single month',
  'Renewable energy now cheaper than coal in 90% of the world',
  'New medical treatment eliminates antibiotic-resistant infections',
  'Urban farming initiative feeds 50,000 families across the city',
  'Coral reef recovery program sees strongest growth in decades',
  'Electric vehicle adoption hits historic milestone in 12 countries',
  'Volunteers restore 200km of river habitat over one weekend',
  'Scientists grow functional human tissue using 3D bioprinting',
  'Solar-powered desalination brings clean water to remote villages',
  'Record-breaking year for species returning from near extinction',
  'Youth climate movement wins landmark ruling against major emitter',
  'Gene therapy trial successfully reverses inherited blindness',
  'Wildfire-resistant forest model cuts burn risk by 70%',
  'Global vaccine campaign eradicates third disease in history',
  'Microplastic-eating enzyme scaled to industrial use',
  'New bird species discovered in previously unmapped rainforest',
  'Ancient farming techniques revived to boost soil health worldwide',
]

const DESCRIPTIONS = [
  'Researchers at leading universities have published findings that could reshape our understanding of sustainable development.',
  'A coalition of volunteers and scientists achieved results that experts called unprecedented in the field.',
  'The initiative, backed by community funding, demonstrated that grassroots action can drive systemic change.',
  'Long-term monitoring data reveals consistent improvements across key ecological indicators.',
  'The project exceeded its original targets by more than 200%, setting a new benchmark for future efforts.',
  'An international team collaborated across 14 countries to produce results with global implications.',
  'Early trials showed a 95% success rate, raising hopes for wider adoption within the next five years.',
  'Local governments and NGOs partnered to implement the solution at scale, reaching underserved communities first.',
  'Data collected over three years confirms the intervention has a lasting positive effect on ecosystems.',
  'The discovery was made possible by new sensor technology that can detect changes invisible to the naked eye.',
]

const TAGS = ['Science', 'Environment', 'Health', 'Technology', 'Community', 'Climate', 'Wildlife', 'Energy']

const SOURCES: NewsItem['source'][] = [
  SourceName.Guardian,
  SourceName.PositiveNews,
  SourceName.ReasonsToBeCheerful,
  SourceName.Upworthy,
  SourceName.Mongabay,
  SourceName.TheConversation,
  SourceName.AtlasObscura,
  SourceName.ScienceAlert,
]

const AUTHORS = [
  'Emma Clarke', 'David Osei', 'Yuki Tanaka', 'Sofia Martínez',
  'James Okafor', 'Priya Nair', 'Lena Hoffmann', 'Noah Williams',
  'Amara Diallo', 'Rui Santos',
]

const IMAGES = [
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500',
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=500',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=500',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500',
]

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length] as T
}

function generateSeedNews(count: number): NewsItem[] {
  const now = Date.now()
  const DAY_MS = 86_400_000

  return Array.from({ length: count }, (_, i) => {
    const source = pick(SOURCES, i)
    const published = new Date(now - (i * DAY_MS) / 10).toISOString()
    return {
      id: `seed-${i}`,
      title: `${pick(TITLES, i)} (#${i + 1})`,
      description: pick(DESCRIPTIONS, i),
      image: pick(IMAGES, i),
      published,
      author: pick(AUTHORS, i),
      tag: pick(TAGS, i),
      source,
      url: `https://example.com/news/seed-${i}`,
      body: `<p>${pick(DESCRIPTIONS, i)}</p>`,
      hasFullContent: true,
    }
  })
}

const seedNews: NewsItem[] = [
  ...validatedMockNewsData,
  ...generateSeedNews(SEED_TOTAL - validatedMockNewsData.length),
]

// --- MSW handlers ---

export const handlers = [
  http.get(`${BASE_URL}/api/news`, () => {
    return HttpResponse.json({
      news: seedNews,
      sources: {
        [SourceName.Guardian]: 'ok',
        [SourceName.PositiveNews]: 'ok',
        [SourceName.ReasonsToBeCheerful]: 'ok',
        [SourceName.Upworthy]: 'ok',
        [SourceName.Mongabay]: 'ok',
        [SourceName.TheConversation]: 'ok',
        [SourceName.AtlasObscura]: 'ok',
        [SourceName.ScienceAlert]: 'ok',
      },
      cached: false,
    })
  }),

  http.get(`${BASE_URL}/api/news/:id`, () => {
    return HttpResponse.json(mockNewsDetailsData)
  }),

  http.post(`${BASE_URL}/api/feedback`, async ({ request }) => {
    const body = (await request.json()) as { message?: string; email?: string }
    if (!body.message || body.message.length < 10) {
      return HttpResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
    }
    return HttpResponse.json({ ok: true, message: 'Спасибо за отзыв!' }, { status: 201 })
  }),

  http.post(`${BASE_URL}/api/auth/refresh`, ({ cookies }) => {
    if (!cookies[MOCK_REFRESH_COOKIE]) {
      return HttpResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }
    return HttpResponse.json({ accessToken: MOCK_ACCESS_TOKEN })
  }),

  http.get(`${BASE_URL}/api/auth/me`, ({ request }) => {
    if (!isValidBearer(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(MOCK_USER)
  }),

  http.post(`${BASE_URL}/api/auth/login`, () => {
    return HttpResponse.json(
      { accessToken: MOCK_ACCESS_TOKEN },
      {
        headers: {
          'Set-Cookie': `${MOCK_REFRESH_COOKIE}=mock-refresh; Path=/; HttpOnly; SameSite=Strict`,
        },
      },
    )
  }),

  http.post(`${BASE_URL}/api/auth/logout`, () => {
    return HttpResponse.json({ ok: true })
  }),
]
