import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { registry } from './registry'
import { SourceName } from '../types/news.types'

extendZodWithOpenApi(z)

export const NewsItemSchema = registry.register(
  'NewsItem',
  z.object({
    id:          z.string().openapi({ example: 'technology/2025/jan/01/news-title' }),
    title:       z.string().openapi({ example: 'Scientists discover new renewable energy source' }),
    description: z.string().openapi({ example: 'A breakthrough in solar panel efficiency...' }),
    image:       z.string().openapi({ example: 'https://media.guardian.co.uk/image.jpg' }),
    published:   z.string().openapi({ example: '2025-01-01T12:00:00Z' }),
    author:      z.string().openapi({ example: 'Jane Smith' }),
    tag:         z.string().openapi({ example: 'Technology' }),
    source:      z.nativeEnum(SourceName).openapi({ example: SourceName.Guardian }),
  }),
)

export const NewsListResponseSchema = registry.register(
  'NewsListResponse',
  z.object({
    news:    z.array(NewsItemSchema),
    sources: z.record(z.enum(['ok', 'error', 'skipped'])).openapi({
      example: { guardian: 'ok', newsapi: 'skipped', hackernews: 'ok' },
    }),
    cached: z.boolean().openapi({ example: false }),
  }),
)

export const FeedbackPayloadSchema = registry.register(
  'FeedbackPayload',
  z.object({
    message: z.string().min(10).max(1000).openapi({ example: 'Отличный сайт, очень позитивно!' }),
    email:   z.string().email().optional().openapi({ example: 'user@example.com' }),
  }),
)

export const FeedbackResponseSchema = registry.register(
  'FeedbackResponse',
  z.object({
    ok:      z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Спасибо за отзыв!' }),
  }),
)
