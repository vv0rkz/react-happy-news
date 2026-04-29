/**
 * Скачивает актуальный OpenAPI spec с запущенного сервера и перезаписывает openapi.json.
 * Затем выполните: pnpm gen:openapi
 *
 * Usage: OPENAPI_URL=http://localhost:3001/api/docs.json node scripts/fetch-openapi.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const url = process.env.OPENAPI_URL ?? 'http://localhost:3001/api/docs.json'

const res = await fetch(url)
if (!res.ok) {
  console.error(`Fetch failed: ${res.status} ${res.statusText}`)
  process.exit(1)
}

const text = await res.text()
const dir = dirname(fileURLToPath(import.meta.url))
const outPath = join(dir, '../src/shared/api/openapi.json')
writeFileSync(outPath, text, 'utf8')
console.log(`Wrote ${outPath}`)
