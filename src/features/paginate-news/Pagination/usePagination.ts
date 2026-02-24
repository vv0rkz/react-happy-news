import { useEffect, useMemo, useState } from 'react'

interface UsePaginationReturn<T> {
  currentPage: number
  pageSize: number
  paginatedData: T[]
  totalPages: number
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setPageSize: (size: number) => void
  isFirstPage: boolean
  isLastPage: boolean
}

export const USE_PAGINATION_INITIAL_VALUES = {
  pageSize: 10,
  currentPage: 1,
} as const

export function usePagination<T>(
  data: T[],
  initialPageSize: number = USE_PAGINATION_INITIAL_VALUES.pageSize,
): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(initialPageSize)

  const totalPages = useMemo((): number => Math.ceil(data.length / pageSize), [data.length, pageSize])

  const paginatedData = useMemo((): T[] => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(USE_PAGINATION_INITIAL_VALUES.currentPage)
  }, [data])

  useEffect(() => {
    setCurrentPage(USE_PAGINATION_INITIAL_VALUES.currentPage)
  }, [pageSize])

  return {
    currentPage,
    pageSize,
    paginatedData,
    totalPages,
    goToPage: (page: number): void => setCurrentPage(page),
    nextPage: (): void => setCurrentPage((prev) => prev + 1),
    prevPage: (): void => setCurrentPage((prev) => prev - 1),
    setPageSize: (size: number): void => setPageSize(size),
    isFirstPage: currentPage === USE_PAGINATION_INITIAL_VALUES.currentPage,
    isLastPage: currentPage === totalPages,
  }
}
