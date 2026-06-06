// client/src/shared/api/apiFetch.ts

import { clearAccessToken, getAccessToken, setAccessToken } from './tokenMemory'
import { AUTH_API_PATHS } from './authPaths'

// Сигнатура как в newsQueries — без лишних типов
const BASE_URL = import.meta.env.VITE_API_BASE_URL

let refreshInFlight: Promise<string> | null = null // single-flight

function doFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getAccessToken()

  const headers = new Headers(init?.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })
}

async function refreshAccessToken(): Promise<string> {
  // если refreshInFlight уже есть — return тот же Promise (не два POST /refresh)
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const res = await fetch(`${BASE_URL}${AUTH_API_PATHS.refresh}`, {
        method: 'POST',
        credentials: 'include',
        // без Authorization!
      })
      if (!res.ok) {
        clearAccessToken()
        throw new Error('Refresh failed')
      }
      const body = (await res.json()) as { accessToken: string }
      setAccessToken(body.accessToken)
      return body.accessToken
    })().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

async function requestWithAuth(path: string, init?: RequestInit, isRetry = false): Promise<Response> {
  const res = await doFetch(path, init)

  if (res.status !== 401) {
    return res
  }

  // уже retry — не зацикливаться
  if (isRetry) {
    clearAccessToken()
    return res // или throw — apiFetch увидит !ok
  }

  await refreshAccessToken()
  return requestWithAuth(path, init, true)
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await requestWithAuth(path, init)

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`)
  }

  return res.json() as Promise<T>
}
