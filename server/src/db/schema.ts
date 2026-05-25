import Database from 'better-sqlite3'
import path from 'node:path'

const DB_PATH = path.join(__dirname, '..', '..', 'news.db')

export const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS news_items (
    id         TEXT PRIMARY KEY,
    source     TEXT NOT NULL,
    data       TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  )
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_fetched_at ON news_items (fetched_at)
`)
