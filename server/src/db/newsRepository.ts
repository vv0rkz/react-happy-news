import type { NewsItem } from '../types/news.types'
import { db } from './schema'

const selectById = db.prepare<[string], { data: string }>('SELECT data FROM news_items WHERE id = ?')

const insertOne = db.prepare<[string, string, string, number]>(
  'INSERT OR REPLACE INTO news_items (id, source, data, fetched_at) VALUES (?, ?, ?, ?)',
)

const insertMany = db.transaction((items: NewsItem[]) => {
  const now = Date.now()
  for (const item of items) {
    insertOne.run(item.id, item.source, JSON.stringify(item), now)
  }
})

export const newsRepository = {
  findById(id: string): NewsItem | undefined {
    const row = selectById.get(id)
    if (!row) return undefined
    return JSON.parse(row.data) as NewsItem
  },

  upsertMany(items: NewsItem[]): void {
    insertMany(items)
  },
}
