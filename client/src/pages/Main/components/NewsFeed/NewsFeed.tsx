import { useGetNewsQuery } from '@model/news/api'
import { ErrorComponent } from '@shared/components/ErrorComponent'
import { useNewsFilterParams } from '../../lib/useNewsFilterParams'
import { NewsFeedView } from '../NewsFeedView'

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
