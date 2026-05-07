import { Router } from 'express'
import type { RequestHandler } from 'express'
import { z } from 'zod'
import { registry } from '../../swagger/registry'
import { NewsItemSchema, NewsListResponseSchema } from '../../swagger/schemas'
import { ok, err } from '../../swagger/helpers'
import { getNewsList, getReadersSSE, getNewsDetail, newsListQueryOpenApiSchema } from './handlers'

export const newsRouter = Router()

type OpenApiConfig = Omit<Parameters<typeof registry.registerPath>[0], 'method' | 'path'>

type RouteDefinition =
  | { routerPath: string; openApiPath: string; openapi: OpenApiConfig; handler: RequestHandler }
  | { routerPath: string; handler: RequestHandler }

// ─── Route map ───────────────────────────────────────────────────────────────
// Порядок важен: /readers должен быть до /*, иначе Express примет "readers" как articleId

const ROUTES: RouteDefinition[] = [
  {
    routerPath: '/',
    openApiPath: '/api/news',
    openapi: {
      tags: ['News'],
      summary: 'Получить агрегированные позитивные новости',
      request: { query: newsListQueryOpenApiSchema },
      responses: {
        200: ok('Список позитивных новостей', NewsListResponseSchema),
        400: err('Невалидный параметр sources'),
      },
    },
    handler: getNewsList,
  },
  {
    routerPath: '/readers',
    handler: getReadersSSE,
  },
  {
    routerPath: '/*',
    openApiPath: '/api/news/{id}',
    openapi: {
      tags: ['News'],
      summary: 'Получить новость по id',
      request: {
        params: z.object({
          id: z.string().openapi({ example: 'technology/2025/jan/01/title' }),
        }),
      },
      responses: {
        200: ok('Данные новости', NewsItemSchema),
        404: err('Новость не найдена'),
      },
    },
    handler: getNewsDetail,
  },
]

// ─── Bootstrap ───────────────────────────────────────────────────────────────

for (const route of ROUTES) {
  if ('openApiPath' in route) {
    registry.registerPath({ method: 'get', path: route.openApiPath, ...route.openapi })
  }
  newsRouter.get(route.routerPath, route.handler)
}
