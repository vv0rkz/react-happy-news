import { useGetNewsQuery } from '@entities/news/api'
import { useSourceFilter } from '@features/source-filter'
import ErrorComponent from '@shared/ErrorComponent'
import NewsFeedView from './NewsFeedView'

const NewsFeed = (): React.ReactNode => {
  const { selectedSources, sourcesParam, toggle } = useSourceFilter()

  const {
    data: news,
    isLoading: isInitialLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetNewsQuery(sourcesParam)

  const isLoading = isInitialLoading || isFetching
  const normalizedError = queryError ? new Error('Ошибка загрузки новостей') : null

  if (normalizedError && !isLoading) {
    return <ErrorComponent error={normalizedError} onRetry={refetch} />
  }

  return <NewsFeedView news={news} isLoading={isLoading} selectedSources={selectedSources} onToggle={toggle} />
}

export default NewsFeed
