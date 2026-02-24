// scripts/update-imports.js — заменяет дублирующиеся импорты на короткий путь
// Пример: '@entities/news/NewsBanner/NewsBanner' → '@entities/news/NewsBanner'
// Сокращает ТОЛЬКО если в папке уже есть index.ts / index.tsx
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'

const ALIAS_MAP = {
  '@app': 'src/app',
  '@pages': 'src/pages',
  '@widgets': 'src/widgets',
  '@features': 'src/features',
  '@entities': 'src/entities',
  '@shared': 'src/shared',
}

// Совпадает: from 'prefix/Name/Name' — последние два сегмента одинаковые
const DUPLICATE_IMPORT = /(from\s+['"])(.*?)\/(\w+)\/\3(['"])/g

function resolveFolderPath(pathBase, folderName, fileDir) {
  const aliasPath = `${pathBase}/${folderName}`
  for (const [alias, realPath] of Object.entries(ALIAS_MAP)) {
    if (aliasPath.startsWith(`${alias}/`)) {
      return join(realPath, aliasPath.slice(alias.length + 1))
    }
  }
  // Относительный путь: resolve относительно директории файла
  return resolve(fileDir, pathBase, folderName)
}

function hasBarrel(folderPath) {
  return existsSync(join(folderPath, 'index.ts')) || existsSync(join(folderPath, 'index.tsx'))
}

function processFile(filePath) {
  const fileDir = dirname(filePath)
  const content = readFileSync(filePath, 'utf-8')

  const updated = content.replace(DUPLICATE_IMPORT, (match, fromPart, pathBase, name, quote) => {
    const folderPath = resolveFolderPath(pathBase, name, fileDir)
    if (hasBarrel(folderPath)) {
      return `${fromPart}${pathBase}/${name}${quote}`
    }
    return match // barrel не найден — не трогаем
  })

  if (updated !== content) {
    writeFileSync(filePath, updated)
    console.log(`Updated: ${filePath}`)
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      walk(fullPath)
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      processFile(fullPath)
    }
  }
}

walk('src')
console.log('Done')
