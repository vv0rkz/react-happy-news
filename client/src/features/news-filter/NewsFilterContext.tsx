import type { SourceName } from '@entities/news/api/apiNews/utils/transforms.types'
import { createContext, useContext, useState } from 'react'
import { useNewsFilter } from './useNewsFilter'

interface NewsFilterContextValue {
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchVisible: boolean
  toggleSearch: () => void
  category: string
  setCategory: (c: string) => void
  selectedSources: SourceName[]
  toggleSource: (s: SourceName) => void
  queryParams: string
}

const NewsFilterContext = createContext<NewsFilterContextValue | null>(null)

export function NewsFilterProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const filter = useNewsFilter()
  const [searchVisible, setSearchVisible] = useState(false)

  const toggleSearch = (): void => {
    setSearchVisible((v) => !v)
    if (searchVisible) {
      filter.setSearchQuery('')
    }
  }

  return (
    <NewsFilterContext.Provider value={{ ...filter, searchVisible, toggleSearch }}>
      {children}
    </NewsFilterContext.Provider>
  )
}

export function useNewsFilterContext(): NewsFilterContextValue {
  const ctx = useContext(NewsFilterContext)
  if (ctx === null) {
    throw new Error('useNewsFilterContext must be used within NewsFilterProvider')
  }
  return ctx
}
