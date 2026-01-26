import { useCallback } from 'react'
import { useParams } from 'react-router'
import { apiNews } from '../../api'
import ErrorComponent from '../../components/ErrorComponent/ErrorComponent'
import NewsBanner from '../../components/NewsBanner/NewsBanner'
import Skeleton from '../../components/Skeleton/Skeleton'
import { useMock } from '../../context/MockContext'
import { useFetch } from '../../hooks/useFetch'
import styles from './styles.module.css'
const NewsDetail = () => {
  const { id } = useParams()
  const { isMockEnabled } = useMock()

  const getNewsDetailWithMockToggle = useCallback(() => apiNews.getNewsDetail(id, isMockEnabled), [id, isMockEnabled])

  const { data, isLoading, error, refetch } = useFetch(getNewsDetailWithMockToggle)

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
      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : data && <NewsBanner item={data} />}
    </main>
  )
}
export default NewsDetail
