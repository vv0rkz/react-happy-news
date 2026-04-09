import { describe, expect, it } from 'vitest'
import { SourceName } from '@entities/news/api/apiNews/utils/transforms.types'

// Если хэндлер перехватывает неправильный URL, setup.ts бросит ошибку:
// "onUnhandledRequest: 'error'" — запрос не перехвачен → тест упадёт автоматически
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

describe('MSW handlers — регрессия URL и формат ответа', () => {
  describe('GET /api/news', () => {
    it('перехватывает правильный URL и возвращает обёртку { news, sources, cached }', async () => {
      const res = await fetch(`${BASE_URL}/api/news`)
      const data = await res.json()

      expect(res.ok).toBe(true)
      expect(data).toHaveProperty('news')
      expect(data).toHaveProperty('sources')
      expect(data).toHaveProperty('cached', false)
    })

    it('news — массив элементов с полями NewsDetailsData', async () => {
      const res = await fetch(`${BASE_URL}/api/news`)
      const { news } = await res.json()

      expect(Array.isArray(news)).toBe(true)
      expect(news.length).toBeGreaterThan(0)

      const item = news[0]
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('image')
      expect(item).toHaveProperty('description')
      expect(item).toHaveProperty('published')
      expect(item).toHaveProperty('author')
      expect(item).toHaveProperty('tag')
    })

    it('sources содержит статус для каждого из трёх источников', async () => {
      const res = await fetch(`${BASE_URL}/api/news`)
      const { sources } = await res.json()

      expect(sources).toHaveProperty(SourceName.Guardian)
      expect(sources).toHaveProperty(SourceName.NewsApi)
      expect(sources).toHaveProperty(SourceName.HackerNews)
    })

    it('принимает query-параметр ?sources= без ошибки', async () => {
      const res = await fetch(`${BASE_URL}/api/news?sources=guardian,newsapi`)
      expect(res.ok).toBe(true)
    })
  })

  describe('GET /api/news/:id', () => {
    it('перехватывает /api/news/:id и возвращает одиночный NewsDetailsData', async () => {
      const res = await fetch(`${BASE_URL}/api/news/some-article-id`)
      const item = await res.json()

      expect(res.ok).toBe(true)
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('image')
      expect(item).toHaveProperty('description')
    })
  })
})
