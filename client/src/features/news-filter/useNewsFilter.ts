import type { SourceName } from '@entities/news/api/apiNews/utils/transforms.types'
import { useSourceFilter } from '@features/source-filter'
import { useLocalStorage } from '@shared/useLocalStorage'
import { useState } from 'react'
import type { SortOption } from './SortSelect'

interface UseNewsFilterReturn {
  searchQuery: string
  setSearchQuery: (q: string) => void
  sort: SortOption
  setSort: (s: SortOption) => void
  selectedSources: SourceName[]
  toggleSource: (s: SourceName) => void
  queryParams: string
}

export function useNewsFilter(): UseNewsFilterReturn {
  const { selectedSources, sourcesParam, toggle } = useSourceFilter()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useLocalStorage<SortOption>({ key: 'news-sort', initialValue: 'date' })

  const parts: string[] = [`sources=${sourcesParam}`, `sort=${sort}`]
  if (searchQuery.trim()) {
    parts.push(`q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const queryParams = parts.join('&')

  return {
    searchQuery,
    setSearchQuery,
    sort,
    setSort,
    selectedSources,
    toggleSource: toggle,
    queryParams,
  }
}
