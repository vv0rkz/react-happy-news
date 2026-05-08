import type { NewsDetailsData, SourceName } from '@entities/news/api/apiNews/utils/transforms.types'
import { NewsBanner } from '@entities/news/NewsBanner'
import { NewsList } from '@entities/news/NewsList'
import type { SortOption } from '@features/news-filter'
import { SearchInput, SortSelect } from '@features/news-filter'
import { Pagination } from '@features/paginate-news/Pagination'
import { SourceFilter } from '@features/source-filter'
import { Skeleton } from '@shared/Skeleton'
import styles from './NewsFeedView.module.css'

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
    <>
      <div className={styles.controls}>
        <SourceFilter selectedSources={selectedSources} onToggle={onToggle} />
        <div className={styles.filterRow}>
          <SearchInput value={searchQuery} onChange={onSearchChange} />
          <SortSelect value={sort} onChange={onSortChange} />
        </div>
      </div>

      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : news?.[0] && <NewsBanner item={news[0]} />}

      {isLoading ? (
        <Skeleton type="item" count={10} height="100px" />
      ) : (
        news && <Pagination data={news}>{(data) => <NewsList news={data} />}</Pagination>
      )}
    </>
  )
}
