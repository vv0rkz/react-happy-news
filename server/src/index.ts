import 'dotenv/config'
import { createApp } from './app'

const PORT = process.env.PORT ?? 3001

const app = createApp()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health: http://localhost:${PORT}/api/health`)
  console.log(`News:   http://localhost:${PORT}/api/news`)
})
