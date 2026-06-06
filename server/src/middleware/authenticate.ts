import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = authHeader.slice('Bearer '.length).trim()
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) {
    return next(new Error('JWT_ACCESS_SECRET is not set')) // или 500
  }
  try {
    const payload = jwt.verify(token, secret) as { sub: string; email: string }
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
