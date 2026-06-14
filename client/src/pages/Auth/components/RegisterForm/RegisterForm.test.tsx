import { AuthProvider } from '@app/providers/AuthProvider'
import { MOCK_USER } from '@app/mocks/handlers'
import { server } from '@app/mocks/server'
import { MantineProvider } from '@mantine/core'
import { clearAccessToken, getAccessToken } from '@shared/api/tokenMemory'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { RegisterForm } from './RegisterForm'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

function renderRegisterForm() {
  return render(
    <MantineProvider>
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    </MantineProvider>,
  )
}

describe('RegisterForm', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('shows Zod error for weak password', async () => {
    const user = userEvent.setup()
    renderRegisterForm()

    await user.type(screen.getByLabelText('Email'), 'new-user@example.com')
    await user.type(screen.getByLabelText('Password'), 'weak')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('Min 8 characters')).toBeInTheDocument()
    expect(getAccessToken()).toBeNull()
  })

  it('shows field error on 409 duplicate email', async () => {
    const user = userEvent.setup()

    server.use(
      http.post(`${BASE_URL}/api/auth/register`, () => {
        return HttpResponse.json({ error: 'Email already registered' }, { status: 409 })
      }),
    )

    renderRegisterForm()

    await user.type(screen.getByLabelText('Email'), MOCK_USER.email)
    await user.type(screen.getByLabelText('Password'), 'Password1')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('Email already registered')).toBeInTheDocument()
    expect(getAccessToken()).toBeNull()
  })
})
