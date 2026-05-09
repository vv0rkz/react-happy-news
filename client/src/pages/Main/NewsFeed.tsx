import { useGetNewsQuery } from '@entities/news/api'
import { useNewsFilterParams } from '@features/news-filter'
import { ErrorComponent } from '@shared/ErrorComponent'
import { NewsFeedView } from './NewsFeedView'

export const NewsFeed = (): React.ReactNode => {
  const { queryParams } = useNewsFilterParams()

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

  return <NewsFeedView news={news} isLoading={isLoading} />
}
