import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { USE_PAGINATION_INITIAL_VALUES, usePagination } from './usePagination'

describe('usePagination', () => {
  const mockData = Array.from({ length: 100 }, (_, ind) => ({ id: ind + 1 }))

  it('инициализируется с правильными начальными значениями', () => {
    const { result } = renderHook(() => usePagination(mockData))

    expect(result.current.currentPage).toBe(USE_PAGINATION_INITIAL_VALUES.currentPage)
    expect(result.current.pageSize).toBe(USE_PAGINATION_INITIAL_VALUES.pageSize)
    expect(result.current.totalPages).toBe(Math.ceil(mockData.length / USE_PAGINATION_INITIAL_VALUES.pageSize))
    expect(result.current.paginatedData.length).toBe(USE_PAGINATION_INITIAL_VALUES.pageSize)
  })

  it('возвращает правильные данные для текущей страницы', () => {
    const { result } = renderHook(() => usePagination(mockData))

    const { pageSize } = USE_PAGINATION_INITIAL_VALUES

    expect(result.current.paginatedData.length).toBe(pageSize)
    expect(result.current.paginatedData[0]).toEqual({ id: 1 })
    expect(result.current.paginatedData[pageSize - 1]).toEqual({ id: pageSize })
  })

  it('переходит на следующую страницу через nextPage()', () => {
    const { result } = renderHook(() => usePagination(mockData))

    const { pageSize } = USE_PAGINATION_INITIAL_VALUES

    act(() => {
      result.current.nextPage()
    })

    expect(result.current.currentPage).toBe(USE_PAGINATION_INITIAL_VALUES.currentPage + 1)
    expect(result.current.paginatedData[0]).toEqual({ id: pageSize + 1 })
    expect(result.current.paginatedData[pageSize - 1]).toEqual({ id: pageSize * 2 })
  })

  it('переходит на предыдущую страницу через prevPage()', () => {
    const { result } = renderHook(() => usePagination(mockData))

    act(() => {
      result.current.nextPage()
    })

    act(() => {
      result.current.prevPage()
    })

    expect(result.current.currentPage).toBe(USE_PAGINATION_INITIAL_VALUES.currentPage)
    expect(result.current.paginatedData[0]).toEqual({ id: 1 })
  })

  it('переходит на конкретную страницу через goToPage()', () => {
    const { result } = renderHook(() => usePagination(mockData))

    const targetPage = 3
    const { pageSize } = USE_PAGINATION_INITIAL_VALUES
    const expectedFirstId = (targetPage - 1) * pageSize + 1

    act(() => {
      result.current.goToPage(targetPage)
    })

    expect(result.current.currentPage).toBe(targetPage)
    expect(result.current.paginatedData[0]).toEqual({ id: expectedFirstId })
    expect(result.current.paginatedData[pageSize - 1]).toEqual({
      id: expectedFirstId + pageSize - 1,
    })
  })

  it('изменяет размер страницы через setPageSize()', () => {
    const { result } = renderHook(() => usePagination(mockData))

    const newPageSize = 5

    act(() => {
      result.current.setPageSize(newPageSize)
    })

    expect(result.current.pageSize).toBe(newPageSize)
    expect(result.current.totalPages).toBe(Math.ceil(mockData.length / newPageSize))
    expect(result.current.paginatedData.length).toBe(newPageSize)
  })

  it('правильно определяет isFirstPage и isLastPage', () => {
    const { result } = renderHook(() => usePagination(mockData))

    expect(result.current.isFirstPage).toBe(true)
    expect(result.current.isLastPage).toBe(false)

    act(() => {
      result.current.goToPage(result.current.totalPages)
    })

    expect(result.current.isFirstPage).toBe(false)
    expect(result.current.isLastPage).toBe(true)
  })

  it('сбрасывает currentPage на 1 при изменении data', () => {
    const { result, rerender } = renderHook(({ data }) => usePagination(data), { initialProps: { data: mockData } })

    const secondPage = 2

    act(() => {
      result.current.goToPage(secondPage)
    })

    expect(result.current.currentPage).toBe(secondPage)

    const newMockData = Array.from({ length: 50 }, (_, ind) => ({ id: ind + 1 }))
    rerender({ data: newMockData })

    expect(result.current.currentPage).toBe(USE_PAGINATION_INITIAL_VALUES.currentPage)
  })

  it('сбрасывает currentPage при изменении pageSize на некорректную', () => {
    const { result } = renderHook(() => usePagination(mockData))

    // Иди на последнюю страницу
    act(() => {
      result.current.goToPage(result.current.totalPages)
    })

    const lastPage = result.current.currentPage
    expect(lastPage).toBeGreaterThan(1)

    // Увеличь pageSize так, чтобы страниц стало меньше
    const newPageSize = 50
    act(() => {
      result.current.setPageSize(newPageSize)
    })

    // currentPage должен сброситься на 1
    expect(result.current.currentPage).toBe(USE_PAGINATION_INITIAL_VALUES.currentPage)
  })
})
