import { usePagination } from '@/hooks/usePagination'
import styles from './styles.module.css'

function Pagination({ data, children }) {
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, isFirstPage, isLastPage } = usePagination(
    data || [],
    2
  )
  if (totalPages <= 1) {
    return <>{children(paginatedData)}</>
  }

  return (
    <>
      {children(paginatedData)}
      <div className={styles.pagination}>
        <button onClick={prevPage} disabled={isFirstPage}>
          {'<'}
        </button>

        <p>{`Страница ${currentPage} из ${totalPages}`}</p>

        <button onClick={nextPage} disabled={isLastPage}>
          {'>'}
        </button>
      </div>
    </>
  )
}

export default Pagination
