import NewsBanner from '@entities/news/NewsBanner'
import { useGetNewsDetailQuery } from '@entities/news/api'
import { ReadersCount } from '@features/live-readers'
import ErrorComponent from '@shared/ErrorComponent'
import Skeleton from '@shared/Skeleton'

interface NewsDetailViewProps {
  id: string
}

const NewsDetailView = ({ id }: NewsDetailViewProps): React.ReactNode => {
  const { data, isLoading: isInitialLoading, isFetching, error: queryError, refetch } = useGetNewsDetailQuery(id)

  const isLoading = isInitialLoading || isFetching
  const normalizedError = queryError ? new Error('Ошибка загрузки деталей новости') : null

  if (normalizedError && !isLoading) {
    return <ErrorComponent error={normalizedError} onRetry={refetch} />
  }

  return (
    <>
      {isLoading ? (
        <Skeleton count={1} type="banner" height="520px" />
      ) : (
        data && (
          <>
            <ReadersCount articleId={id} />
            <NewsBanner item={data} />
          </>
        )
      )}
    </>
  )
}

export default NewsDetailView
