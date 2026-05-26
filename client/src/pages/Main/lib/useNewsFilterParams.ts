import { allSourceNames, SourceName } from '@model/news/api/apiNews/utils/transforms.types'
import { useSearchParams } from 'react-router-dom'

function parseSourcesParam(raw: string | null): SourceName[] {
  if (!raw) return [...allSourceNames]
  const valid = raw.split(',').filter((s): s is SourceName => (allSourceNames as string[]).includes(s))
  return valid.length > 0 ? valid : [...allSourceNames]
}

export function useNewsFilterParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedSources = parseSourcesParam(searchParams.get('sources'))
  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? 'all'

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === '') {
            next.delete(key)
          } else {
            next.set(key, value)
          }
        }
        return next
      },
      { replace: true },
    )
  }

  const setQ = (value: string) => updateParams({ q: value.trim() || null })

  const setCategory = (cat: string) => updateParams({ category: cat === 'all' ? null : cat })

  const toggleSource = (source: SourceName) => {
    if (selectedSources.includes(source) && selectedSources.length === 1) return
    const next = selectedSources.includes(source)
      ? selectedSources.filter((s) => s !== source)
      : [...selectedSources, source]
    const sorted = [...next].sort()
    updateParams({ sources: sorted.length === allSourceNames.length ? null : sorted.join(',') })
  }

  const parts: string[] = [`sources=${[...selectedSources].sort().join(',')}`]
  if (q.trim()) parts.push(`q=${encodeURIComponent(q.trim())}`)
  if (category !== 'all') parts.push(`category=${encodeURIComponent(category)}`)
  const queryParams = parts.join('&')

  return { selectedSources, q, category, setQ, setCategory, toggleSource, queryParams }
}
