import { NewsBanner } from '@model/news/components/NewsBanner'
import { useGetNewsDetailQuery } from '@model/news/api'
import { ReadersCount } from '../ReadersCount'
import { ErrorComponent } from '@shared/components/ErrorComponent'
import { Skeleton } from '@shared/components/Skeleton'
import { APP_ROUTES } from '@shared/config/routes'
import DOMPurify from 'dompurify'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './NewsDetailView.module.css'

interface NewsDetailViewProps {
  id: string
}

export const NewsDetailView = ({ id }: NewsDetailViewProps): React.ReactNode => {
  const navigate = useNavigate()
  const { data, isLoading: isInitialLoading, isFetching, error: queryError, refetch } = useGetNewsDetailQuery(id)

  const isLoading = isInitialLoading || isFetching
  const normalizedError = queryError ? new Error('Ошибка загрузки деталей новости') : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleBack = (): void => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(APP_ROUTES.index)
    }
  }

  if (normalizedError && !isLoading) {
    return <ErrorComponent error={normalizedError} onRetry={refetch} />
  }

  return (
    <>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          ← Назад
        </button>
        <ReadersCount articleId={id} />
      </div>
      {isLoading ? (
        <Skeleton count={1} type="banner" height="520px" />
      ) : (
        data && (
          <>
            <NewsBanner item={data} />
            {data.body && (
              <div className="news-detail__body" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.body) }} />
            )}
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="news-detail__original-link">
              Читать оригинал
            </a>
          </>
        )
      )}
    </>
  )
}
