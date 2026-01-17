import { useEffect, useMemo, useState } from 'react'

export function usePagination(data, initialPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = useMemo(() => Math.ceil(data.length / pageSize), [data.length, pageSize])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  return {
    currentPage,
    pageSize,
    paginatedData,
    totalPages,
    goToPage: (page) => setCurrentPage(page),
    nextPage: () => setCurrentPage((prev) => prev + 1),
    prevPage: () => setCurrentPage((prev) => prev - 1),
    setPageSize,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  }
}
