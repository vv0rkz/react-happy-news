import type { NewsDetailsData, SourceName } from '@entities/news/api/apiNews/utils/transforms.types'
import { NewsBanner } from '@entities/news/NewsBanner'
import { NewsList } from '@entities/news/NewsList'
import type { SortOption } from '@features/news-filter'
import { SearchInput, SortSelect } from '@features/news-filter'
import { Pagination } from '@features/paginate-news/Pagination'
import { SourceFilter } from '@features/source-filter'
import { Divider, Group, Stack } from '@mantine/core'
import { Skeleton } from '@shared/Skeleton'

interface NewsFeedViewProps {
  news: NewsDetailsData[] | undefined
  isLoading: boolean
  selectedSources: SourceName[]
  onToggle: (source: SourceName) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  sort: SortOption
  onSortChange: (value: SortOption) => void
}

export const NewsFeedView = ({
  news,
  isLoading,
  selectedSources,
  onToggle,
  searchQuery,
  onSearchChange,
  sort,
  onSortChange,
}: NewsFeedViewProps): React.ReactNode => {
  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <SourceFilter selectedSources={selectedSources} onToggle={onToggle} />
        <Group gap="sm" wrap="wrap">
          <SearchInput value={searchQuery} onChange={onSearchChange} />
          <SortSelect value={sort} onChange={onSortChange} />
        </Group>
        <Divider />
      </Stack>

      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : news?.[0] && <NewsBanner item={news[0]} />}

      {isLoading ? (
        <Skeleton type="item" count={10} height="100px" />
      ) : (
        news && <Pagination data={news}>{(data) => <NewsList news={data} />}</Pagination>
      )}
    </Stack>
  )
}
