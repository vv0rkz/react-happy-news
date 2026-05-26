/**
 * Architecture report: zone stats, fan-in/out hubs, colocation hints.
 * Output: docs/architecture/generated/report.md (from repo root)
 */
import { execSync } from 'child_process'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientRoot = join(__dirname, '..')
const repoRoot = join(clientRoot, '..')
const outDir = join(repoRoot, 'docs', 'architecture', 'generated')
const outFile = join(outDir, 'report.md')

const ZONES = [
  { id: 'core', match: (p) => p.startsWith('src/shared/api/') },
  { id: 'shared_components', match: (p) => p.startsWith('src/shared/components/') },
  { id: 'shared_lib', match: (p) => p.startsWith('src/shared/lib/') },
  { id: 'catalog_api', match: (p) => p.startsWith('src/model/news/api/') },
  { id: 'catalog_components', match: (p) => p.startsWith('src/model/news/components/') },
  { id: 'engagement', match: (p) => p.startsWith('src/pages/Favorites/') || p.startsWith('src/pages/Dashboard/') },
  { id: 'app', match: (p) => p.startsWith('src/app/') },
  { id: 'features', match: (p) => p.startsWith('src/features/') },
  { id: 'pages', match: (p) => p.startsWith('src/pages/') },
]

function normalizePath(modulePath) {
  return modulePath.replace(/\\/g, '/').replace(/^\.\//, '')
}

function zoneOf(modulePath) {
  const p = normalizePath(modulePath)
  for (const z of ZONES) {
    if (z.match(p)) return z.id
  }
  return 'other'
}

function runDepcruiseJson() {
  const raw = execSync('pnpm exec depcruise src --config .dependency-cruiser.cjs --output-type json', {
    cwd: clientRoot,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  })
  return JSON.parse(raw)
}

function buildStats(modules) {
  const byPath = new Map()
  for (const m of modules) {
    const p = normalizePath(m.source)
    if (!p.startsWith('src/') || p.includes('.test.')) continue
    byPath.set(p, {
      path: p,
      zone: zoneOf(p),
      fanIn: 0,
      fanOut: 0,
      dependents: new Set(),
      dependencies: new Set(),
    })
  }

  for (const m of modules) {
    const from = normalizePath(m.source)
    const fromNode = byPath.get(from)
    if (!fromNode) continue
    for (const dep of m.dependencies ?? []) {
      const to = normalizePath(dep.resolved ?? dep.module)
      if (!to.startsWith('src/')) continue
      const toNode = byPath.get(to)
      if (!toNode) continue
      fromNode.fanOut += 1
      fromNode.dependencies.add(to)
      toNode.fanIn += 1
      toNode.dependents.add(from)
    }
  }

  return [...byPath.values()]
}

function zoneSummary(stats) {
  const zones = new Map()
  for (const s of stats) {
    if (!zones.has(s.zone)) zones.set(s.zone, { files: 0, fanIn: 0, fanOut: 0 })
    const z = zones.get(s.zone)
    z.files += 1
    z.fanIn += s.fanIn
    z.fanOut += s.fanOut
  }
  return [...zones.entries()]
    .map(([zone, data]) => ({
      zone,
      files: data.files,
      avgFanIn: data.files ? (data.fanIn / data.files).toFixed(2) : '0',
      avgFanOut: data.files ? (data.fanOut / data.files).toFixed(2) : '0',
    }))
    .sort((a, b) => b.files - a.files)
}

function topHubs(stats, n = 5) {
  return [...stats]
    .filter((s) => s.fanIn + s.fanOut > 0)
    .sort((a, b) => b.fanIn + b.fanOut - (a.fanIn + a.fanOut))
    .slice(0, n)
    .map((s) => ({ path: s.path, zone: s.zone, fanIn: s.fanIn, fanOut: s.fanOut }))
}

function pageKey(path) {
  const m = path.match(/^src\/pages\/([^/]+)/)
  return m ? m[1] : null
}

function consumerZoneExtended(dep) {
  if (dep.startsWith('src/app/layout/')) return 'app/layout'
  if (dep.startsWith('src/app/')) return 'app'
  const pk = pageKey(dep)
  if (pk) return `pages/${pk}`
  if (dep.startsWith('src/model/')) return 'model'
  if (dep.startsWith('src/features/')) {
    const m = dep.match(/^src\/features\/([^/]+)/)
    return m ? `features/${m[1]}` : 'features'
  }
  return null
}

function misplacedSharedHints(stats) {
  const hints = []
  for (const s of stats) {
    if (!s.path.startsWith('src/shared/components/') && !s.path.startsWith('src/shared/lib/')) continue
    if (s.path.endsWith('/index.ts')) continue
    const zones = new Set()
    for (const dep of s.dependents) {
      const zone = consumerZoneExtended(dep)
      if (zone) zones.add(zone)
    }
    if (zones.size === 0) {
      hints.push({ path: s.path, consumers: ['none'], suggestion: 'knip triage — delete or ignore' })
    } else if (zones.size < 2) {
      hints.push({
        path: s.path,
        consumers: [...zones].sort(),
        suggestion: 'colocate to sole consumer',
      })
    }
  }
  return hints
}

function consumerZone(dep) {
  if (dep.startsWith('src/app/layout/')) return 'app/layout'
  if (dep.startsWith('src/app/')) return 'app'
  const pk = pageKey(dep)
  if (pk) return `pages/${pk}`
  if (dep.startsWith('src/features/')) return null
  return null
}

function colocationHints(stats) {
  const hints = []
  for (const s of stats) {
    if (!s.path.startsWith('src/pages/')) continue
    if (s.path.endsWith('/index.ts')) continue
    const owners = new Set()
    for (const dep of s.dependents) {
      if (dep.startsWith('src/app/layout/')) owners.add('app/layout')
      const pk = pageKey(dep)
      if (pk) owners.add(`pages/${pk}`)
      if (dep.startsWith('src/features/')) owners.add('features')
    }
    if (owners.size >= 2) {
      hints.push({
        path: s.path,
        consumers: [...owners].sort(),
        suggestion: 'consider features/<name>/',
      })
    }
  }
  return hints
}

function misplacedFeaturesHints(stats) {
  const hints = []
  for (const s of stats) {
    if (!s.path.startsWith('src/features/')) continue
    if (s.path.endsWith('/index.ts')) continue
    const owners = new Set()
    for (const dep of s.dependents) {
      const zone = consumerZone(dep)
      if (zone) owners.add(zone)
    }
    if (owners.size > 0 && owners.size < 2) {
      hints.push({
        path: s.path,
        consumers: [...owners].sort(),
        suggestion: 'move to pages/<Page>/ or app/',
      })
    }
  }
  return hints
}

function markdown({ generatedAt, summary, hubs, hints, misplaced, misplacedShared, moduleCount }) {
  const lines = [
    '# Architecture report (generated)',
    '',
    `Generated: ${generatedAt}`,
    '',
    `Modules analyzed: ${moduleCount}`,
    '',
    '## Folder convention',
    '',
    'Lowercase = infrastructure segments (whitelist). PascalCase = component folders.',
    'Source of truth: `client/scripts/arch-lint.mjs` → `ALLOWED_SEGMENTS`.',
    'Gate: `pnpm arch:lint`.',
    '',
    '## Zone summary',
    '',
    '| Zone | Files | Avg fan-in | Avg fan-out |',
    '| ---- | ----- | ---------- | ----------- |',
    ...summary.map((r) => `| ${r.zone} | ${r.files} | ${r.avgFanIn} | ${r.avgFanOut} |`),
    '',
    '## Top coupling hubs',
    '',
    '| Path | Zone | Fan-in | Fan-out |',
    '| ---- | ---- | ------ | ------- |',
    ...(hubs.length
      ? hubs.map((h) => `| \`${h.path}\` | ${h.zone} | ${h.fanIn} | ${h.fanOut} |`)
      : ['| — | — | — | — |']),
    '',
    '## Colocation hints (2+ consumer areas)',
    '',
    ...(hints.length
      ? hints.map((h) => `- \`${h.path}\` — consumers: ${h.consumers.join(', ')} → **${h.suggestion}**`)
      : ['- None']),
    '',
    '## Misplaced features (single consumer — colocate)',
    '',
    ...(misplaced.length
      ? misplaced.map((h) => `- \`${h.path}\` — consumers: ${h.consumers.join(', ')} → **${h.suggestion}**`)
      : ['- None']),
    '',
    '## Misplaced shared (consumerZones < 2)',
    '',
    ...(misplacedShared.length
      ? misplacedShared.map((h) => `- \`${h.path}\` — consumers: ${h.consumers.join(', ')} → **${h.suggestion}**`)
      : ['- None']),
    '',
    '> Re-run: `pnpm arch:report` / gate: `pnpm arch:lint`',
    '',
  ]
  return lines.join('\n')
}

function main() {
  const graph = runDepcruiseJson()
  const modules = graph.modules ?? []
  const stats = buildStats(modules)
  const summary = zoneSummary(stats)
  const hubs = topHubs(stats)
  const hints = colocationHints(stats)
  const misplaced = misplacedFeaturesHints(stats)
  const misplacedShared = misplacedSharedHints(stats)
  const md = markdown({
    generatedAt: new Date().toISOString(),
    summary,
    hubs,
    hints,
    misplaced,
    misplacedShared,
    moduleCount: stats.length,
  })

  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, md, 'utf-8')

  const rel = relative(repoRoot, outFile)
  console.log(`Architecture report written to ${rel}`)
  if (hints.length) {
    console.log(`Colocation hints: ${hints.length}`)
  }
  if (misplaced.length) {
    console.log(`Misplaced features hints: ${misplaced.length}`)
  }
  if (misplacedShared.length) {
    console.log(`Misplaced shared hints: ${misplacedShared.length}`)
  }
}

main()
