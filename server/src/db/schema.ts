import Database from 'better-sqlite3'
import path from 'node:path'
import { runMigrations } from './migrations'

const DB_PATH = path.join(__dirname, '..', '..', 'news.db')
export const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
runMigrations(db)
