import { useSourceFilter } from '@features/source-filter'
import { useState } from 'react'

interface UseNewsFilterReturn {
  searchQuery: string
  setSearchQuery: (q: string) => void
  category: string
  setCategory: (c: string) => void
  selectedSources: ReturnType<typeof useSourceFilter>['selectedSources']
  toggleSource: ReturnType<typeof useSourceFilter>['toggle']
  queryParams: string
}

export function useNewsFilter(): UseNewsFilterReturn {
  const { selectedSources, sourcesParam, toggle } = useSourceFilter()
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')

  const parts: string[] = [`sources=${sourcesParam}`]
  if (searchQuery.trim()) {
    parts.push(`q=${encodeURIComponent(searchQuery.trim())}`)
  }
  if (category !== 'all') {
    parts.push(`category=${encodeURIComponent(category)}`)
  }

  const queryParams = parts.join('&')

  return {
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
    selectedSources,
    toggleSource: toggle,
    queryParams,
  }
}
