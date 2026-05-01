import { Router } from 'express'
import { sseManager } from '../utils/sseManager'

export const newsStreamRouter = Router()

newsStreamRouter.get('/', (req, res) => {
  const clientId = crypto.randomUUID()
  sseManager.addClient(clientId, res)
  req.on('close', () => {
    sseManager.removeClient(clientId)
  })
})
