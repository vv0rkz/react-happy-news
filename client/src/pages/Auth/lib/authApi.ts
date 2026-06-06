import { setAccessToken } from '@shared/api/tokenMemory'
import { apiFetch } from '@shared/api/apiFetch'
import { AUTH_API_PATHS } from '@shared/api/authPaths'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export type AuthUser = { id: string; email: string }

type AccessTokenResponse = { accessToken: string }

export async function postRefresh(): Promise<AccessTokenResponse | null> {
  const res = await fetch(`${BASE_URL}${AUTH_API_PATHS.refresh}`, {
    method: 'POST',
    credentials: 'include',
  })

  if (res.status === 401) {
    return null
  }

  if (!res.ok) {
    throw new Error('Refresh failed')
  }

  return res.json() as Promise<AccessTokenResponse>
}

export async function postLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}${AUTH_API_PATHS.login}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const body = (await res.json().catch(() => ({}))) as { accessToken?: string; error?: string }

  if (!res.ok) {
    throw new Error(body.error ?? 'Login failed')
  }

  if (!body.accessToken) {
    throw new Error('Login failed')
  }

  return body.accessToken
}

export async function postLogout(): Promise<void> {
  await fetch(`${BASE_URL}${AUTH_API_PATHS.logout}`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function establishSession(accessToken: string): Promise<AuthUser> {
  setAccessToken(accessToken)
  return apiFetch<AuthUser>(AUTH_API_PATHS.me)
}
