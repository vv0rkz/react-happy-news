import 'dotenv/config'
import { createApp } from './app'
import { startNewsCron } from './services/newsCron'

const PORT = process.env.PORT ?? 3001

const app = createApp()

app.listen(PORT, () => {
  startNewsCron()
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health: http://localhost:${PORT}/api/health`)
  console.log(`News:   http://localhost:${PORT}/api/news`)
}).on('error', (err: NodeJS.ErrnoException) => {
  console.error('[server] listen error:', err.code, err.message)
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[server] Порт ${PORT} уже занят.\n` +
        `  Найти PID: netstat -ano | findstr :${PORT}\n` +
        `  Убить:     taskkill /PID <PID> /F\n`,
    )
  }
  process.exit(1)
})
