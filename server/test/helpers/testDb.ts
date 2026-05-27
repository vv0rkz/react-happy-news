import Database from 'better-sqlite3'
import { runMigrations } from '../../src/db/migrations'

export function createTestDb(): Database.Database {
  const db = new Database(':memory:')
  runMigrations(db)
  return db
}

export function clearAuthTables(db: Database.Database): void {
  db.exec('DELETE FROM refresh_tokens')
  db.exec('DELETE FROM users')
}
