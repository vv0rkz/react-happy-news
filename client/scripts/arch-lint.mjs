/**
 * Architecture lint: folder conventions + colocation (consumer zones).
 * Single source of truth for ALLOWED_SEGMENTS — see GOVERNANCE.md.
 *
 * Usage: node scripts/arch-lint.mjs [--json]
 */
import { execSync } from 'child_process'
import { readdirSync, statSync, existsSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientRoot = join(__dirname, '..')
const srcRoot = join(clientRoot, 'src')

/** @type {Record<string, string[]>} */
export const ALLOWED_SEGMENTS = {
  page: ['lib', 'components', 'tests'],
  entity: ['api', 'components', 'lib', 'tests'],
  shared: ['api', 'config', 'components', 'lib', 'tests'],
  app: ['layout', 'lib', 'mocks', 'providers', 'components', 'tests'],
  feature: ['components', 'lib', 'api', 'tests'],
}

const FORBIDDEN_SEGMENTS = new Set(['ui', 'hooks', 'helpers', 'widgets'])
const TOP_LEVEL_SRC = new Set(['app', 'pages', 'features', 'entities', 'shared', 'assets', 'tests'])

/** @type {{ id: string; severity: 'error' | 'warn'; message: string; path: string }[]} */
const violations = []

function add(id, severity, message, filePath) {
  violations.push({ id, severity, message, path: filePath.replace(/\\/g, '/') })
}

function normalize(p) {
  return p.replace(/\\/g, '/')
}

function isPascalCase(name) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name)
}

function listDirs(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((e) => statSync(join(dir, e)).isDirectory())
}

function listFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((e) => !statSync(join(dir, e)).isDirectory())
}

function hasComponentFile(dir, name) {
  return (
    existsSync(join(dir, name, `${name}.tsx`)) ||
    existsSync(join(dir, name, `${name}.ts`))
  )
}

function walkForbiddenSegments(dir, relBase = '') {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const rel = relBase ? `${relBase}/${entry}` : entry
    if (statSync(full).isDirectory()) {
      if (FORBIDDEN_SEGMENTS.has(entry)) {
        add('N3', 'error', `forbidden segment "${entry}/" — use components/ or lib/`, `src/${rel}`)
      }
      walkForbiddenSegments(full, rel)
    }
  }
}

function checkPageRoots() {
  const pagesDir = join(srcRoot, 'pages')
  if (!existsSync(pagesDir)) return

  for (const page of listDirs(pagesDir)) {
    const pageDir = join(pagesDir, page)
    const rel = `src/pages/${page}`

    for (const entry of readdirSync(pageDir)) {
      const full = join(pageDir, entry)
      if (statSync(full).isDirectory()) {
        if (!ALLOWED_SEGMENTS.page.includes(entry)) {
          add('P1', 'error', `unexpected folder "${entry}/" in page root`, `${rel}/${entry}`)
        }
        if (entry === 'components') {
          checkComponentsSegment(full, `${rel}/components`)
        }
        continue
      }
      if (entry.endsWith('.test.ts') || entry.endsWith('.test.tsx')) continue
      const allowedFile =
        entry === `${page}.tsx` ||
        entry === 'index.ts' ||
        entry === `${page}.module.css` ||
        entry.endsWith('.module.css') && entry === `${page}.module.css`
      if (!allowedFile && (entry.endsWith('.tsx') || entry.endsWith('.ts') || entry.endsWith('.css'))) {
        add('P1', 'error', `unexpected file "${entry}" in page root — move to components/ or lib/`, `${rel}/${entry}`)
      }
    }
  }
}

function checkComponentsSegment(dir, rel) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const entryRel = `${rel}/${entry}`
    if (statSync(full).isDirectory()) {
      if (!isPascalCase(entry)) {
        add('N2', 'error', `components/ subfolder must be PascalCase: "${entry}"`, entryRel)
      } else if (!hasComponentFile(dir, entry)) {
        add('N2', 'error', `missing ${entry}/${entry}.tsx`, entryRel)
      }
    } else if (entry.endsWith('.tsx') && !entry.endsWith('.test.tsx')) {
      add('P2', 'error', `flat component file not allowed — use ${entry.replace('.tsx', '')}/${entry}`, `${rel}/${entry}`)
    }
  }
}

function checkEntityRoots() {
  const entitiesDir = join(srcRoot, 'entities')
  if (!existsSync(entitiesDir)) return

  for (const domain of listDirs(entitiesDir)) {
    const domainDir = join(entitiesDir, domain)
    const rel = `src/entities/${domain}`

    for (const entry of listDirs(domainDir)) {
      if (!ALLOWED_SEGMENTS.entity.includes(entry)) {
        add('N1', 'error', `unexpected segment "${entry}/" in entity root`, `${rel}/${entry}`)
      }
      if (entry === 'components') {
        checkComponentsSegment(join(domainDir, entry), `${rel}/components`)
      }
    }
  }
}

function checkSharedRoot() {
  const sharedDir = join(srcRoot, 'shared')
  if (!existsSync(sharedDir)) return

  for (const entry of listDirs(sharedDir)) {
    if (!ALLOWED_SEGMENTS.shared.includes(entry)) {
      add('N1', 'error', `unexpected segment "${entry}/" in shared/`, `src/shared/${entry}`)
    }
    if (entry === 'components') {
      checkComponentsSegment(join(sharedDir, entry), `src/shared/components`)
    }
  }
}

function checkAppStructure() {
  const appDir = join(srcRoot, 'app')
  if (!existsSync(appDir)) return

  for (const entry of listDirs(appDir)) {
    if (!ALLOWED_SEGMENTS.app.includes(entry)) {
      add('N1', 'error', `unexpected segment "${entry}/" in app/`, `src/app/${entry}`)
    }
  }

  const layoutDir = join(appDir, 'layout')
  if (existsSync(layoutDir)) {
    for (const entry of listDirs(layoutDir)) {
      if (!isPascalCase(entry)) {
        add('N2', 'error', `layout/ subfolder must be PascalCase component: "${entry}"`, `src/app/layout/${entry}`)
      } else if (!hasComponentFile(layoutDir, entry)) {
        add('N2', 'error', `missing ${entry}/${entry}.tsx in layout/`, `src/app/layout/${entry}`)
      }
    }
  }

  const appLib = join(appDir, 'lib')
  if (existsSync(appLib)) {
    for (const module of listDirs(appLib)) {
      const moduleDir = join(appLib, module)
      for (const entry of listDirs(moduleDir)) {
        if (entry === 'components') {
          checkComponentsSegment(join(moduleDir, entry), `src/app/lib/${module}/components`)
        } else if (isPascalCase(entry)) {
          add('N2', 'error', `use components/${entry}/ in app/lib/${module}/`, `src/app/lib/${module}/${entry}`)
        }
      }
    }
  }
}

function checkFeatureRoots() {
  const featuresDir = join(srcRoot, 'features')
  if (!existsSync(featuresDir)) return

  for (const feature of listDirs(featuresDir)) {
    const featureDir = join(featuresDir, feature)
    const rel = `src/features/${feature}`

    for (const entry of listDirs(featureDir)) {
      if (!ALLOWED_SEGMENTS.feature.includes(entry)) {
        add('N1', 'error', `unexpected segment "${entry}/" in feature root`, `${rel}/${entry}`)
      }
      if (entry === 'components') {
        checkComponentsSegment(join(featureDir, entry), `${rel}/components`)
      }
    }

    const looseTsx = listFiles(featureDir).filter((f) => f.endsWith('.tsx') && f !== 'index.ts')
    for (const f of looseTsx) {
      add('P1', 'error', `flat "${f}" in feature root — move to components/`, `${rel}/${f}`)
    }
  }
}

function checkTopLevelSrc() {
  for (const entry of listDirs(srcRoot)) {
    if (!TOP_LEVEL_SRC.has(entry)) {
      add('N1', 'error', `unexpected top-level folder src/${entry}/`, `src/${entry}`)
    }
  }
}

function pageKey(path) {
  const m = path.match(/^src\/pages\/([^/]+)/)
  return m ? m[1] : null
}

function consumerZone(dep) {
  if (dep.startsWith('src/app/layout/')) return 'app/layout'
  if (dep.startsWith('src/app/')) return 'app'
  const pk = pageKey(dep)
  if (pk) return `pages/${pk}`
  if (dep.startsWith('src/entities/')) return 'entities'
  if (dep.startsWith('src/features/')) {
    const m = dep.match(/^src\/features\/([^/]+)/)
    return m ? `features/${m[1]}` : 'features'
  }
  return null
}

function runDepcruiseColocation() {
  const raw = execSync('pnpm exec depcruise src --config .dependency-cruiser.cjs --output-type json', {
    cwd: clientRoot,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  })
  const graph = JSON.parse(raw)
  const byPath = new Map()

  for (const m of graph.modules ?? []) {
    const p = normalize(m.source)
    if (!p.startsWith('src/') || p.includes('.test.')) continue
    byPath.set(p, { dependents: new Set() })
  }

  for (const m of graph.modules ?? []) {
    const from = normalize(m.source)
    if (!byPath.has(from)) continue
    for (const dep of m.dependencies ?? []) {
      const to = normalize(dep.resolved ?? dep.module)
      const node = byPath.get(to)
      if (node) node.dependents.add(from)
    }
  }

  /** @type {Map<string, Set<string>>} */
  const sharedComponentZones = new Map()

  for (const [path, { dependents }] of byPath) {
    const m = path.match(/^src\/shared\/components\/([^/]+)\//)
    if (m) {
      const key = `src/shared/components/${m[1]}/`
      if (!sharedComponentZones.has(key)) sharedComponentZones.set(key, new Set())
      const zones = sharedComponentZones.get(key)
      for (const dep of dependents) {
        const z = consumerZone(dep)
        if (z) zones.add(z)
      }
    }
  }

  for (const [folder, zones] of sharedComponentZones) {
    if (zones.size === 0) {
      add('S2', 'warn', 'zero consumer zones — knip triage (delete or ignore)', folder)
    } else if (zones.size < 2) {
      add('S1', 'error', `single consumer zone [${[...zones].join(', ')}] — colocate`, folder)
    }
  }

  for (const [path, { dependents }] of byPath) {
    if (!path.startsWith('src/shared/lib/')) continue
    if (path.endsWith('/index.ts')) continue

    const zones = new Set()
    for (const dep of dependents) {
      const z = consumerZone(dep)
      if (z) zones.add(z)
    }

    if (zones.size === 0) {
      add('S2', 'warn', 'zero consumer zones — knip triage (delete or ignore)', path)
    } else if (zones.size < 2) {
      add('S1', 'error', `single consumer zone [${[...zones].join(', ')}] — colocate`, path)
    }
  }

  for (const [path, { dependents }] of byPath) {
    if (!path.startsWith('src/pages/') || !path.includes('/components/')) continue
    if (path.endsWith('/index.ts')) continue
    const owners = new Set()
    for (const dep of dependents) {
      const pk = pageKey(dep)
      if (pk) owners.add(`pages/${pk}`)
    }
    if (owners.size >= 2) {
      add('X1', 'warn', `used from ${[...owners].join(', ')} — consider features/`, path)
    }
  }

  for (const [path, { dependents }] of byPath) {
    if (!path.startsWith('src/features/')) continue
    if (path.endsWith('/index.ts')) continue
    const zones = new Set()
    for (const dep of dependents) {
      const z = consumerZone(dep)
      if (z?.startsWith('pages/')) zones.add(z)
    }
    if (zones.size === 1) {
      add('X2', 'warn', `single page consumer — colocate to ${[...zones][0]}`, path)
    }
  }
}

function runFilesystemChecks() {
  checkTopLevelSrc()
  walkForbiddenSegments(srcRoot)
  checkPageRoots()
  checkEntityRoots()
  checkSharedRoot()
  checkAppStructure()
  checkFeatureRoots()
}

function main() {
  const json = process.argv.includes('--json')
  runFilesystemChecks()
  runDepcruiseColocation()

  const errors = violations.filter((v) => v.severity === 'error')
  const warns = violations.filter((v) => v.severity === 'warn')

  if (json) {
    console.log(JSON.stringify({ errors, warnings: warns }, null, 2))
  } else {
    if (violations.length === 0) {
      console.log('arch:lint — OK')
    } else {
      for (const v of violations) {
        console.log(`${v.severity.toUpperCase()} [${v.id}] ${v.path}: ${v.message}`)
      }
    }
  }

  if (errors.length > 0) {
    process.exit(1)
  }
}

main()
