import Skeleton from '@/components/Skeleton/Skeleton'
import ErrorComponent from '@components/ErrorComponent/ErrorComponent'
import NewsBanner from '@components/NewsBanner/NewsBanner'
import NewsList from '@components/NewsList/NewsList'
import Pagination from '@components/Pagination/Pagination'
import { useGetNewsQuery } from '@api'
import styles from './styles.module.css'

const Main = (): React.ReactNode => {
  const {
    data: news,
    isLoading: isInitialLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetNewsQuery()

  const isLoading = isInitialLoading || isFetching
  const normalizedError = queryError ? new Error('Ошибка загрузки новостей') : null

  // Компонент ошибки
  if (normalizedError && !isLoading) {
    return (
      <main className={styles.main}>
        <ErrorComponent error={normalizedError} onRetry={refetch} />
      </main>
    )
  }

  return (
    <main className={styles.main}>
      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : news?.[0] && <NewsBanner item={news[0]} />}

      {isLoading ? (
        <Skeleton type="item" count={10} height="100px" />
      ) : (
        news && <Pagination data={news}>{(data) => <NewsList news={data} />}</Pagination>
      )}
    </main>
  )
}

export default Main
