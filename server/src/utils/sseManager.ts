import type express from 'express'

type SseClient = {
  id: string
  response: express.Response
}

// Что должен уметь sseManager:
// - clients: Map<string, SseClient> — все активные подключения
// - addClient(id, res): установить SSE-заголовки, добавить в Map
// - removeClient(id): удалить из Map
// - broadcast(data): отправить всем клиентам строку в формате SSE
// - startHeartbeat(): setInterval → каждые 30с send ":\n\n" (keep-alive)
const clients = new Map<string, SseClient>()

export const sseManager = {
  addClient(id: string, res: express.Response) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders() // важно — отправляет заголовки сразу
    clients.set(id, { id, response: res })
  },
  removeClient(id: string) {
    clients.delete(id)
  },
  broadcast(data: string) {
    for (const [, client] of clients) {
      client.response.write(`data: ${data}\n\n`)
    }
  },
  startHeartbeat() {
    setInterval(() => {
      for (const [, client] of clients) {
        client.response.write(':\n\n')
      }
    }, 30_000) // 30 секунд, не 30 миллисекунд
  },
}
