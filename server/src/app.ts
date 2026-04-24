import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { newsRouter } from './routes/news.routes'
// TODO: импортировать feedbackRouter из './routes/feedback.routes'
// TODO: импортировать errorHandler из './middleware/errorHandler'

export function createApp() {
  const app = express()

  app.use(morgan('dev'))
  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/news', newsRouter)
  // TODO: app.use('/api/feedback', feedbackRouter)

  // TODO: app.use(errorHandler)
  // ⚠️  errorHandler должен быть последним app.use() — он ловит всё, что не поймали раньше

  return app
}
