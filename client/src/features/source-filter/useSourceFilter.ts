import { allSourceNames, type SourceName } from '@entities/news/api/apiNews/utils/transforms.types'
import { useLocalStorage } from '@shared/useLocalStorage'

export function useSourceFilter() {
  const [selectedSources, setSelectedSources] = useLocalStorage<SourceName[]>({
    key: 'news-sources',
    initialValue: allSourceNames,
  })

  const toggle = (source: SourceName) => {
    setSelectedSources((prev) => {
      if (prev.includes(source) && prev.length === 1) {
        return prev
      }
      if (prev.includes(source)) {
        return prev.filter((s) => s !== source)
      }
      return [...prev, source]
    })
  }

  const sourcesParam = [...selectedSources].sort().join(',')

  const isSelected = (source: SourceName) => selectedSources.includes(source)
  return { selectedSources, sourcesParam, toggle, isSelected }
}
