import './swagger/setup'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { registry } from './swagger/registry'
import { newsRouter } from './routes/news.routes'
import { feedbackRouter } from './routes/feedback.routes'
import { errorHandler } from './middleware/errorHandler'
import { packageVersion } from './packageInfo'

// Импорты роутов выше уже зарегистрировали пути в registry — теперь генерируем spec
const openApiSpec = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'React Happy News API',
    version: packageVersion,
    description: 'Aggregates positive news from Guardian, NewsAPI, HackerNews',
  },
  servers: [{ url: 'http://localhost:3001' }],
})

export function createApp() {
  const app = express()

  app.use(morgan('dev'))
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173').split(',')
  app.use(cors({ origin: allowedOrigins }))
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))
  app.get('/api/docs.json', (_req, res) => res.json(openApiSpec))

  app.use('/api/news', newsRouter)
  app.use('/api/feedback', feedbackRouter)

  app.use(errorHandler)

  return app
}
