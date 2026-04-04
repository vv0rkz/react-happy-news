// scripts/gen-barrels.js — генерирует index.ts для папок с паттерном FolderName/FolderName.tsx
import { existsSync, readdirSync, statSync, writeFileSync } from 'fs'
import { basename, join } from 'path'

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      walk(fullPath)
    } else if (entry.endsWith('.tsx') && !entry.endsWith('.test.tsx')) {
      const componentName = basename(entry, '.tsx')
      const folderName = basename(dir)
      if (componentName === folderName) {
        const indexPath = join(dir, 'index.ts')
        if (!existsSync(indexPath)) {
          writeFileSync(indexPath, `export { default } from './${componentName}'\n`)
          console.log(`Created: ${indexPath}`)
        }
      }
    }
  }
}

walk('src')
console.log('Done')
