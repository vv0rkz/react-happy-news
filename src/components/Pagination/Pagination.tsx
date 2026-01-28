import { usePagination } from '@/hooks/usePagination'
import styles from './styles.module.css'

interface PaginationProps<T> {
  data: T[]
  children: (data: T[]) => React.ReactNode
}

function Pagination<T>({ data, children }: PaginationProps<T>): React.ReactNode {
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, isFirstPage, isLastPage } = usePagination(
    data ?? [],
    2,
  )
  if (totalPages <= 1) {
    return <>{children(paginatedData)}</>
  }

  return (
    <>
      {children(paginatedData)}
      <div className={styles.pagination}>
        <button onClick={(): void => prevPage()} disabled={isFirstPage}>
          {'<'}
        </button>

        <p>{`Страница ${currentPage} из ${totalPages}`}</p>

        <button onClick={(): void => nextPage()} disabled={isLastPage}>
          {'>'}
        </button>
      </div>
    </>
  )
}

export default Pagination
