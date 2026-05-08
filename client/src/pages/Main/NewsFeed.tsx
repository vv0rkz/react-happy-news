import { useGetNewsQuery } from '@entities/news/api'
import { useNewsFilter } from '@features/news-filter'
import { ErrorComponent } from '@shared/ErrorComponent'
import { NewsFeedView } from './NewsFeedView'

export const NewsFeed = (): React.ReactNode => {
  const { selectedSources, toggleSource, searchQuery, setSearchQuery, sort, setSort, queryParams } = useNewsFilter()

  const {
    data: news,
    isLoading: isInitialLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetNewsQuery(queryParams)

  const isLoading = isInitialLoading || isFetching
  const normalizedError = queryError ? new Error('Ошибка загрузки новостей') : null

  if (normalizedError && !isLoading) {
    return <ErrorComponent error={normalizedError} onRetry={refetch} />
  }

  return (
    <NewsFeedView
      news={news}
      isLoading={isLoading}
      selectedSources={selectedSources}
      onToggle={toggleSource}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      sort={sort}
      onSortChange={setSort}
    />
  )
}
