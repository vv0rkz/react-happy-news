import { AuthProvider } from '@app/providers/AuthProvider'
import { MOCK_ACCESS_TOKEN, MOCK_USER } from '@app/mocks/handlers'
import { server } from '@app/mocks/server'
import { MantineProvider } from '@mantine/core'
import { useAuth } from '@pages/Auth/lib/useAuth'
import { clearAccessToken, getAccessToken } from '@shared/api/tokenMemory'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { LoginForm } from './LoginForm'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

function AuthProbe() {
  const { isAuthenticated, user } = useAuth()
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.email ?? 'none'}</span>
    </div>
  )
}

function renderLoginForm() {
  return render(
    <MantineProvider>
      <AuthProvider>
        <LoginForm />
        <AuthProbe />
      </AuthProvider>
    </MantineProvider>,
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Invalid email')).toBeInTheDocument()
    expect(getAccessToken()).toBeNull()
  })

  it('calls login on valid submit', async () => {
    const user = userEvent.setup()

    server.use(
      http.post(`${BASE_URL}/api/auth/login`, () => {
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

    renderLoginForm()

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })

    await user.type(screen.getByLabelText('Email'), MOCK_USER.email)
    await user.type(screen.getByLabelText('Password'), 'Password1')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    expect(screen.getByTestId('user')).toHaveTextContent(MOCK_USER.email)
    expect(getAccessToken()).toBe(MOCK_ACCESS_TOKEN)
  })
})
