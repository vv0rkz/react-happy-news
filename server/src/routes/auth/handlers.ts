import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { z } from 'zod'
import { AuthError } from '../../services/authService'
import { authService } from '../../services/authService.instance'

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

type AuthTokens = { accessToken: string; refreshToken: string }

async function handleEmailPasswordAuth(
  req: Request,
  res: Response,
  next: NextFunction,
  action: (email: string, password: string) => Promise<AuthTokens>,
  successStatus: 201 | 200,
): Promise<void> {
  const parsed = authBodySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  try {
    const { accessToken, refreshToken } = await action(parsed.data.email, parsed.data.password)
    setRefreshCookie(res, refreshToken)
    res.status(successStatus).json({ accessToken })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    next(err)
  }
}

export const postRegister: RequestHandler = (req, res, next) =>
  handleEmailPasswordAuth(req, res, next, (email, password) => authService.register(email, password), 201)

export const postLogin: RequestHandler = (req, res, next) =>
  handleEmailPasswordAuth(req, res, next, (email, password) => authService.login(email, password), 200)

export const postRefresh: RequestHandler = (req, res, next) => {
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
}

export const postLogout: RequestHandler = (req, res, next) => {
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
}

export const getMe: RequestHandler = (req, res) => {
  res.json({ id: req.user!.id, email: req.user!.email })
}
