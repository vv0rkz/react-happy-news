import { Group, Pagination as MantinePagination } from '@mantine/core'
import { usePagination } from './usePagination'

interface PaginationProps<T> {
  data: T[]
  children: (data: T[]) => React.ReactNode
}

export function Pagination<T>({ data, children }: PaginationProps<T>): React.ReactNode {
  const { paginatedData, currentPage, totalPages, goToPage } = usePagination(data ?? [], 500)

  return (
    <>
      {children(paginatedData)}
      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <MantinePagination
            total={totalPages}
            value={currentPage}
            onChange={goToPage}
            color="indigo"
            radius="xl"
          />
        </Group>
      )}
    </>
  )
}
