import type express from 'express'
import { sseManager } from './sseManager'

// rooms: Map<articleId, Set<clientId>>
const rooms = new Map<string, Set<string>>()

export const readersTracker = {
  join(articleId: string, clientId: string, res: express.Response) {
    sseManager.addClient(clientId, res)
    const room = rooms.get(articleId) ?? new Set<string>()
    room.add(clientId)
    rooms.set(articleId, room)
    this.broadcastCount(articleId)
  },

  leave(articleId: string, clientId: string) {
    sseManager.removeClient(clientId)
    const room = rooms.get(articleId)
    if (!room) return
    room.delete(clientId)
    if (room.size > 0) {
      this.broadcastCount(articleId)
    } else {
      rooms.delete(articleId)
    }
  },

  broadcastCount(articleId: string) {
    const room = rooms.get(articleId)
    if (!room) return
    const count = room.size
    for (const clientId of room) {
      sseManager.send(clientId, JSON.stringify({ articleId, count }))
    }
  },
}
