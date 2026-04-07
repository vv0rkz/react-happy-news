import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { newsRouter } from './routes/news.routes'

export function createApp() {
  const app = express()

  app.use(morgan('dev'))
  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/news', newsRouter)

  return app
}
