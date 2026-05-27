import type Database from 'better-sqlite3'

export function runMigrations(db: Database.Database): void {
  db.pragma('foreign_keys = ON')

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

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id             TEXT PRIMARY KEY,
      email          TEXT UNIQUE NOT NULL,
      password_hash  TEXT NOT NULL,
      email_verified INTEGER DEFAULT 0,
      created_at     INTEGER NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    )
  `)
}
