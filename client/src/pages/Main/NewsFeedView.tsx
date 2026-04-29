import type { NewsDetailsData } from '@entities/news/api/apiNews/utils/transforms.types'
import type { SourceName } from '@entities/news/api/apiNews/utils/transforms.types'
import NewsBanner from '@entities/news/NewsBanner'
import NewsList from '@entities/news/NewsList'
import Pagination from '@features/paginate-news/Pagination'
import { SourceFilter } from '@features/source-filter'
import Skeleton from '@shared/Skeleton'

interface NewsFeedViewProps {
  news: NewsDetailsData[] | undefined
  isLoading: boolean
  selectedSources: SourceName[]
  onToggle: (source: SourceName) => void
}

const NewsFeedView = ({ news, isLoading, selectedSources, onToggle }: NewsFeedViewProps): React.ReactNode => {
  return (
    <>
      <SourceFilter selectedSources={selectedSources} onToggle={onToggle} />
      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : news?.[0] && <NewsBanner item={news[0]} />}

      {isLoading ? (
        <Skeleton type="item" count={10} height="100px" />
      ) : (
        news && <Pagination data={news}>{(data) => <NewsList news={data} />}</Pagination>
      )}
    </>
  )
}

export default NewsFeedView
