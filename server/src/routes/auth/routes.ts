import type { RequestHandler } from 'express'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate } from '../../middleware/authenticate'
import { err, ok } from '../../swagger/helpers'
import { registry } from '../../swagger/registry'
import { AuthLoginResponseSchema, AuthLogoutResponseSchema, AuthPayloadSchema } from '../../swagger/schemas'
import { getMe, postLogin, postLogout, postRefresh, postRegister } from './handlers'

export const authRouter = Router()

type OpenApiConfig = Omit<Parameters<typeof registry.registerPath>[0], 'method' | 'path'>

type AuthRouteDefinition = {
  routerPath: string
  openApiPath: string
  openapi: OpenApiConfig
  handler: RequestHandler
}

const authBodyRequest = {
  body: {
    required: true,
    content: { 'application/json': { schema: AuthPayloadSchema } },
  },
} as const

// ─── Route map ───────────────────────────────────────────────────────────────

const ROUTES: AuthRouteDefinition[] = [
  {
    routerPath: '/register',
    openApiPath: '/api/auth/register',
    openapi: {
      tags: ['Auth'],
      summary: 'Регистрация',
      request: authBodyRequest,
      responses: {
        201: ok('Аккаунт создан', AuthLoginResponseSchema),
        400: err('Ошибка валидации'),
        409: err('Email уже занят'),
      },
    },
    handler: postRegister,
  },
  {
    routerPath: '/login',
    openApiPath: '/api/auth/login',
    openapi: {
      tags: ['Auth'],
      summary: 'Вход',
      request: authBodyRequest,
      responses: {
        200: ok('Успешный вход', AuthLoginResponseSchema),
        400: err('Ошибка валидации'),
        401: err('Неверные credentials'),
      },
    },
    handler: postLogin,
  },
  {
    routerPath: '/refresh',
    openApiPath: '/api/auth/refresh',
    openapi: {
      tags: ['Auth'],
      summary: 'Обновить access token (rotation refresh)',
      responses: {
        200: ok('Новый access token', AuthLoginResponseSchema),
        401: err('Невалидный или отсутствующий refresh cookie'),
      },
    },
    handler: postRefresh,
  },
  {
    routerPath: '/logout',
    openApiPath: '/api/auth/logout',
    openapi: {
      tags: ['Auth'],
      summary: 'Выход',
      responses: {
        200: ok('Сессия завершена', AuthLogoutResponseSchema),
      },
    },
    handler: postLogout,
  },
]

// ─── Bootstrap ───────────────────────────────────────────────────────────────

authRouter.use(
  rateLimit({
    windowMs: 60_000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  }),
)

for (const route of ROUTES) {
  registry.registerPath({ method: 'post', path: route.openApiPath, ...route.openapi })
  authRouter.post(route.routerPath, route.handler)
}
authRouter.get('/me', authenticate, getMe)
