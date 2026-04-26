import { Router } from 'express'
import { z } from 'zod'

export const feedbackRouter = Router()

const feedbackSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must not exceed 1000 characters'),
  email: z.string().email('Invalid email').optional(),
})

feedbackRouter.post('/', (req, res) => {
  const parsed = feedbackSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  console.log('[Feedback]', parsed.data)
  res.status(201).json({ ok: true, message: 'Спасибо за отзыв!' })
})
