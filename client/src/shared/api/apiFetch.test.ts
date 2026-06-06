import { server } from '@app/mocks/server'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearAccessToken, getAccessToken, setAccessToken } from '@shared/api/tokenMemory'
import { apiFetch } from './apiFetch'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

describe('apiFetch', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('retries after refresh on 401', async () => {
    setAccessToken('stale-token')

    let newsCallCount = 0

    server.use(
      http.get(`${BASE_URL}/api/news`, () => {
        newsCallCount += 1
        if (newsCallCount === 1) {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return HttpResponse.json({ news: [], sources: {}, cached: false })
      }),
      http.post(`${BASE_URL}/api/auth/refresh`, () => {
        return HttpResponse.json({ accessToken: 'new-token' })
      }),
    )

    const data = await apiFetch<{ news: unknown[] }>('/api/news')

    expect(data.news).toEqual([])
    expect(newsCallCount).toBe(2)
    expect(getAccessToken()).toBe('new-token')
  })
})
