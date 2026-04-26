import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { newsRouter } from './routes/news.routes'
import { feedbackRouter } from './routes/feedback.routes'
import { errorHandler } from './middleware/errorHandler'

export function createApp() {
  const app = express()

  app.use(morgan('dev'))
  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/news', newsRouter)
  app.use('/api/feedback', feedbackRouter)

  app.use(errorHandler)

  return app
}
