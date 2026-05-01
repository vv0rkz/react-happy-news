import cron from 'node-cron'
import { aggregateNews } from './newsAggregator'
import { sseManager } from '../utils/sseManager'

const lastSeenIds = new Set<string>()

async function fetchAndBroadcast() {
  try {
    const { news } = await aggregateNews()

    const newItems = news.filter((item) => !lastSeenIds.has(item.id))

    newItems.forEach((item) => {
      lastSeenIds.add(item.id)
      sseManager.broadcast(JSON.stringify(item))
    })

    if (newItems.length > 0) {
      console.log(`[Cron] Broadcast ${newItems.length} new item(s)`)
    }
  } catch (error) {
    console.error('[Cron] fetchAndBroadcast error:', error)
  }
}

export function startNewsCron() {
  // Первый вызов сразу при старте — заполняем lastSeenIds без broadcast
  aggregateNews()
    .then(({ news }) => news.forEach((item) => lastSeenIds.add(item.id)))
    .catch((err) => console.error('[Cron] initial seed error:', err))

  cron.schedule('*/5 * * * *', fetchAndBroadcast)
  console.log('[Cron] News cron started (every 5 minutes)')
}
