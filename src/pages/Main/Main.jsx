// src/pages/Main/Main.jsx
import Skeleton from '@/components/Skeleton/Skeleton'
import { apiNews } from '@api'
import ErrorComponent from '@components/ErrorComponent/ErrorComponent'
import NewsBanner from '@components/NewsBanner/NewsBanner'
import NewsList from '@components/NewsList/NewsList'
import Pagination from '@components/Pagination/Pagination'
import { useMock } from '@context/MockContext'
import { useCallback } from 'react'
import { useFetch } from '../../hooks/useFetch'
import styles from './styles.module.css'

const Main = () => {
  const { isMockEnabled } = useMock()

  const getNewsWithMockToggle = useCallback(() => apiNews.getNews(isMockEnabled), [isMockEnabled])

  const { data: news, isLoading, error, refetch } = useFetch(getNewsWithMockToggle)

  // Компонент ошибки
  if (error && !isLoading) {
    return (
      <main className={styles.main}>
        <ErrorComponent error={error} onRetry={refetch} />
      </main>
    )
  }

  return (
    <main className={styles.main}>
      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : news[0] && <NewsBanner item={news[0]} />}

      {isLoading ? (
        <Skeleton type="item" count={10} height="100px" />
      ) : (
        <Pagination data={news}>{(data) => <NewsList news={data} />}</Pagination>
      )}
    </main>
  )
}

export default Main
