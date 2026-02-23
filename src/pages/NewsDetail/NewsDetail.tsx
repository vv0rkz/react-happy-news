import { useParams } from 'react-router-dom'
import { useGetNewsDetailQuery } from '@api'
import ErrorComponent from '../../components/ErrorComponent/ErrorComponent'
import NewsBanner from '../../components/NewsBanner/NewsBanner'
import Skeleton from '../../components/Skeleton/Skeleton'
import styles from './styles.module.css'

const NewsDetail = (): React.ReactNode => {
  const { id } = useParams<{ id: string }>()
  const {
    data,
    isLoading: isInitialLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetNewsDetailQuery(id ?? '')

  const isLoading = isInitialLoading || isFetching
  const normalizedError = queryError ? new Error('Ошибка загрузки деталей новости') : null

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
      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : data && <NewsBanner item={data} />}
    </main>
  )
}
export default NewsDetail
