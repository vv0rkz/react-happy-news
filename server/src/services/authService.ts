import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type Database from 'better-sqlite3'
import { randomBytes, randomUUID } from 'node:crypto'

const BCRYPT_ROUNDS = 12
const ACCESS_EXPIRES_IN = '15m' as const
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

export class AuthError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

function requireAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not set')
  }
  return secret
}

type UserRow = { id: string; email: string; password_hash: string }

export function createAuthService(database: Database.Database) {
  let dummyPasswordHash: string | undefined

  function getDummyPasswordHash(): string {
    if (!dummyPasswordHash) {
      dummyPasswordHash = bcrypt.hashSync('__anti_enumeration_dummy__', BCRYPT_ROUNDS)
    }
    return dummyPasswordHash
  }

  function createAccessToken(userId: string, email: string): string {
    return jwt.sign({ sub: userId, email }, requireAccessSecret(), {
      expiresIn: ACCESS_EXPIRES_IN,
    })
  }

  function createOpaqueRefreshToken(): string {
    return randomBytes(32).toString('hex')
  }

  function storeRefreshToken(token: string, userId: string): void {
    const expiresAt = Date.now() + REFRESH_TTL_MS
    database
      .prepare('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)')
      .run(token, userId, expiresAt)
  }

  function issueTokens(userId: string, email: string): { accessToken: string; refreshToken: string } {
    const accessToken = createAccessToken(userId, email)
    const refreshToken = createOpaqueRefreshToken()
    storeRefreshToken(refreshToken, userId)
    return { accessToken, refreshToken }
  }

  async function register(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      throw new AuthError('Email already registered', 409)
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const userId = randomUUID()
    const createdAt = Date.now()

    try {
      database
        .prepare(
          'INSERT INTO users (id, email, password_hash, email_verified, created_at) VALUES (?, ?, ?, 0, ?)',
        )
        .run(userId, email, passwordHash, createdAt)
    } catch (err: unknown) {
      const sqliteErr = err as { code?: string }
      if (sqliteErr.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new AuthError('Email already registered', 409)
      }
      throw err
    }

    return issueTokens(userId, email)
  }

  async function login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = database
      .prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
      .get(email) as UserRow | undefined

    const hashToCompare = user?.password_hash ?? getDummyPasswordHash()
    const passwordMatches = await bcrypt.compare(password, hashToCompare)

    if (!user || !passwordMatches) {
      throw new AuthError('Invalid credentials', 401)
    }

    return issueTokens(user.id, user.email)
  }

  function refresh(oldRefreshToken: string): { accessToken: string; refreshToken: string } {
    const row = database
      .prepare('SELECT token, user_id, expires_at FROM refresh_tokens WHERE token = ?')
      .get(oldRefreshToken) as { token: string; user_id: string; expires_at: number } | undefined

    if (!row || row.expires_at < Date.now()) {
      throw new AuthError('Invalid refresh token', 401)
    }

    const user = database
      .prepare('SELECT id, email FROM users WHERE id = ?')
      .get(row.user_id) as { id: string; email: string } | undefined

    if (!user) {
      database.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(oldRefreshToken)
      throw new AuthError('Invalid refresh token', 401)
    }

    database.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(oldRefreshToken)
    return issueTokens(user.id, user.email)
  }

  function logout(refreshToken: string): void {
    if (!refreshToken) {
      return
    }
    database.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken)
  }

  return { register, login, refresh, logout }
}

export type AuthService = ReturnType<typeof createAuthService>
