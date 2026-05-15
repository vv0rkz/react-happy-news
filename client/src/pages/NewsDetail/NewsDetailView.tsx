import DOMPurify from 'dompurify'
import { NewsBanner } from '@entities/news/NewsBanner'
import { useGetNewsDetailQuery } from '@entities/news/api'
import { ReadersCount } from '@features/live-readers'
import { ErrorComponent } from '@shared/ErrorComponent'
import { Skeleton } from '@shared/Skeleton'

interface NewsDetailViewProps {
  id: string
}

export const NewsDetailView = ({ id }: NewsDetailViewProps): React.ReactNode => {
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
            {data.body && (
              <div
                className="news-detail__body"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.body) }}
              />
            )}
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-detail__original-link"
            >
              Читать оригинал
            </a>
          </>
        )
      )}
    </>
  )
}
