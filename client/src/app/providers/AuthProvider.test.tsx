import { server } from '@app/mocks/server'
import { MOCK_ACCESS_TOKEN, MOCK_USER } from '@app/mocks/handlers'
import { useAuth } from '@pages/Auth/lib/useAuth'
import { clearAccessToken, getAccessToken } from '@shared/api/tokenMemory'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthProvider'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

function Probe() {
  const { user, isLoading, isAuthenticated } = useAuth()

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user?.email ?? 'none'}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
    </div>
  )
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('restores session on bootstrap when refresh succeeds', async () => {
    server.use(
      http.post(`${BASE_URL}/api/auth/refresh`, () => {
        return HttpResponse.json({ accessToken: MOCK_ACCESS_TOKEN })
      }),
      http.get(`${BASE_URL}/api/auth/me`, ({ request }) => {
        const auth = request.headers.get('Authorization')
        if (auth !== `Bearer ${MOCK_ACCESS_TOKEN}`) {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return HttpResponse.json(MOCK_USER)
      }),
    )

    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('user')).toHaveTextContent(MOCK_USER.email)
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(getAccessToken()).toBe(MOCK_ACCESS_TOKEN)
  })

  it('stays guest when refresh returns 401', async () => {
    server.use(
      http.post(`${BASE_URL}/api/auth/refresh`, () => {
        return HttpResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
      }),
    )

    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(getAccessToken()).toBeNull()
  })
})
