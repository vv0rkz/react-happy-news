import { Router, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { registry } from '../swagger/registry'
import {
  AuthLoginResponseSchema,
  AuthLogoutResponseSchema,
  AuthPayloadSchema,
} from '../swagger/schemas'
import { AuthError } from '../services/authService'
import { authService } from '../services/authService.instance'

const REFRESH_COOKIE = 'refreshToken'
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  maxAge: REFRESH_MAX_AGE_MS,
  secure: process.env.NODE_ENV === 'production',
}

function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions)
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
}

const authBodySchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Auth'],
  summary: 'Регистрация',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: AuthPayloadSchema } },
    },
  },
  responses: {
    201: {
      description: 'Аккаунт создан',
      content: { 'application/json': { schema: AuthLoginResponseSchema } },
    },
    400: { description: 'Ошибка валидации' },
    409: { description: 'Email уже занят' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  summary: 'Вход',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: AuthPayloadSchema } },
    },
  },
  responses: {
    200: {
      description: 'Успешный вход',
      content: { 'application/json': { schema: AuthLoginResponseSchema } },
    },
    400: { description: 'Ошибка валидации' },
    401: { description: 'Неверные credentials' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/auth/refresh',
  tags: ['Auth'],
  summary: 'Обновить access token (rotation refresh)',
  responses: {
    200: {
      description: 'Новый access token',
      content: { 'application/json': { schema: AuthLoginResponseSchema } },
    },
    401: { description: 'Невалидный или отсутствующий refresh cookie' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  tags: ['Auth'],
  summary: 'Выход',
  responses: {
    200: {
      description: 'Сессия завершена',
      content: { 'application/json': { schema: AuthLogoutResponseSchema } },
    },
  },
})

export const authRouter = Router()

authRouter.use(
  rateLimit({
    windowMs: 60_000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  }),
)

authRouter.post('/register', async (req, res, next) => {
  const parsed = authBodySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  try {
    const { accessToken, refreshToken } = await authService.register(
      parsed.data.email,
      parsed.data.password,
    )
    setRefreshCookie(res, refreshToken)
    res.status(201).json({ accessToken })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    next(err)
  }
})

authRouter.post('/login', async (req, res, next) => {
  const parsed = authBodySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  try {
    const { accessToken, refreshToken } = await authService.login(
      parsed.data.email,
      parsed.data.password,
    )
    setRefreshCookie(res, refreshToken)
    res.status(200).json({ accessToken })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    next(err)
  }
})

authRouter.post('/refresh', (req, res, next) => {
  const oldRefreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined
  if (!oldRefreshToken) {
    res.status(401).json({ error: 'Invalid refresh token' })
    return
  }

  try {
    const { accessToken, refreshToken } = authService.refresh(oldRefreshToken)
    setRefreshCookie(res, refreshToken)
    res.status(200).json({ accessToken })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    next(err)
  }
})

authRouter.post('/logout', (req, res, next) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined

  try {
    if (refreshToken) {
      authService.logout(refreshToken)
    }
    clearRefreshCookie(res)
    res.status(200).json({ ok: true })
  } catch (err) {
    next(err)
  }
})
