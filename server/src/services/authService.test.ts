import jwt from 'jsonwebtoken'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type Database from 'better-sqlite3'
import { AuthError, createAuthService, type AuthService } from './authService'
import { createTestDb } from '../../test/helpers/testDb'

const VALID_EMAIL = 'test@example.com'
const VALID_PASSWORD = 'Secret1pass'

describe('authService.register', () => {
  let db: Database.Database
  let auth: AuthService

  beforeEach(() => {
    db = createTestDb()
    auth = createAuthService(db)
  })

  afterEach(() => {
    db.close()
  })

  it('returns accessToken and stores refresh in db', async () => {
    const result = await auth.register(VALID_EMAIL, VALID_PASSWORD)

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()

    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(VALID_EMAIL) as
      | { id: string; email: string }
      | undefined
    expect(user).toBeDefined()

    const tokenRow = db
      .prepare('SELECT token FROM refresh_tokens WHERE token = ?')
      .get(result.refreshToken)
    expect(tokenRow).toBeDefined()

    const payload = jwt.verify(result.accessToken, process.env.JWT_ACCESS_SECRET!) as {
      sub: string
      email: string
    }
    expect(payload.email).toBe(VALID_EMAIL)
    expect(payload.sub).toBe(user!.id)
  })

  it('throws conflict when email already exists', async () => {
    await auth.register(VALID_EMAIL, VALID_PASSWORD)

    await expect(auth.register(VALID_EMAIL, VALID_PASSWORD)).rejects.toMatchObject({
      message: 'Email already registered',
      statusCode: 409,
    } satisfies Partial<AuthError>)
  })
})

describe('authService.login', () => {
  let db: Database.Database
  let auth: AuthService

  beforeEach(() => {
    db = createTestDb()
    auth = createAuthService(db)
  })

  afterEach(() => {
    db.close()
  })

  it('returns tokens after successful login', async () => {
    await auth.register(VALID_EMAIL, VALID_PASSWORD)

    const result = await auth.login(VALID_EMAIL, VALID_PASSWORD)

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
  })

  it('returns same 401 for unknown email and wrong password', async () => {
    await auth.register(VALID_EMAIL, VALID_PASSWORD)

    let unknownEmailError: AuthError | undefined
    try {
      await auth.login('unknown@example.com', VALID_PASSWORD)
    } catch (err) {
      unknownEmailError = err as AuthError
    }

    let wrongPasswordError: AuthError | undefined
    try {
      await auth.login(VALID_EMAIL, 'WrongPassword1')
    } catch (err) {
      wrongPasswordError = err as AuthError
    }

    expect(unknownEmailError?.statusCode).toBe(401)
    expect(wrongPasswordError?.statusCode).toBe(401)
    expect(unknownEmailError?.message).toBe('Invalid credentials')
    expect(wrongPasswordError?.message).toBe('Invalid credentials')
  })
})

describe('authService.refresh', () => {
  let db: Database.Database
  let auth: AuthService

  beforeEach(() => {
    db = createTestDb()
    auth = createAuthService(db)
  })

  afterEach(() => {
    db.close()
  })

  it('rotates refresh token and returns new access token', async () => {
    const { refreshToken: oldRefresh } = await auth.register(
      VALID_EMAIL,
      VALID_PASSWORD,
    )

    const tokensBefore = db.prepare('SELECT token FROM refresh_tokens').all() as { token: string }[]
    expect(tokensBefore).toHaveLength(1)
    expect(tokensBefore[0]!.token).toBe(oldRefresh)

    const result = auth.refresh(oldRefresh)

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toMatch(/^[a-f0-9]{64}$/)

    const payload = jwt.verify(result.accessToken, process.env.JWT_ACCESS_SECRET!) as {
      sub: string
      email: string
    }
    expect(payload.email).toBe(VALID_EMAIL)

    const oldRow = db
      .prepare('SELECT token FROM refresh_tokens WHERE token = ?')
      .get(oldRefresh)
    expect(oldRow).toBeUndefined()

    const tokensAfter = db.prepare('SELECT token FROM refresh_tokens').all() as { token: string }[]
    expect(tokensAfter).toHaveLength(1)
    expect(tokensAfter[0]!.token).toBe(result.refreshToken)
    expect(tokensAfter[0]!.token).not.toBe(oldRefresh)
  })

  it('throws 401 for invalid refresh token', () => {
    expect(() => auth.refresh('invalid-token')).toThrow(
      expect.objectContaining({ statusCode: 401, message: 'Invalid refresh token' }),
    )
  })

  it('throws 401 for expired refresh token', async () => {
    const { refreshToken } = await auth.register(VALID_EMAIL, VALID_PASSWORD)

    db.prepare('UPDATE refresh_tokens SET expires_at = ? WHERE token = ?').run(
      Date.now() - 1000,
      refreshToken,
    )

    expect(() => auth.refresh(refreshToken)).toThrow(
      expect.objectContaining({ statusCode: 401, message: 'Invalid refresh token' }),
    )
  })
})

describe('authService.logout', () => {
  let db: Database.Database
  let auth: AuthService

  beforeEach(() => {
    db = createTestDb()
    auth = createAuthService(db)
  })

  afterEach(() => {
    db.close()
  })

  it('removes refresh token from db', async () => {
    const { refreshToken } = await auth.register(VALID_EMAIL, VALID_PASSWORD)

    auth.logout(refreshToken)

    const row = db.prepare('SELECT token FROM refresh_tokens WHERE token = ?').get(refreshToken)
    expect(row).toBeUndefined()
  })

  it('refresh after logout returns 401', async () => {
    const { refreshToken } = await auth.register(VALID_EMAIL, VALID_PASSWORD)

    auth.logout(refreshToken)

    expect(() => auth.refresh(refreshToken)).toThrow(
      expect.objectContaining({ statusCode: 401, message: 'Invalid refresh token' }),
    )
  })
})
