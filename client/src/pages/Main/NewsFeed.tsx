import NewsBanner from '@entities/news/NewsBanner'
import NewsList from '@entities/news/NewsList'
import { useGetNewsQuery } from '@entities/news/api'
// TODO: import { SourceFilter, useSourceFilter } from '@features/source-filter'
import Pagination from '@features/paginate-news/Pagination'
import ErrorComponent from '@shared/ErrorComponent'
import Skeleton from '@shared/Skeleton'

const NewsFeed = (): React.ReactNode => {
  // TODO: const { selectedSources, sourcesParam, toggle } = useSourceFilter()
  // TODO: передать sourcesParam в useGetNewsQuery(sourcesParam)
  const { data: news, isLoading: isInitialLoading, isFetching, error: queryError, refetch } = useGetNewsQuery()

  const isLoading = isInitialLoading || isFetching
  const normalizedError = queryError ? new Error('Ошибка загрузки новостей') : null

  if (normalizedError && !isLoading) {
    return <ErrorComponent error={normalizedError} onRetry={refetch} />
  }

  return (
    <>
      {/* TODO: <SourceFilter selectedSources={selectedSources} onToggle={toggle} /> */}
      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : news?.[0] && <NewsBanner item={news[0]} />}

      {isLoading ? (
        <Skeleton type="item" count={10} height="100px" />
      ) : (
        news && <Pagination data={news}>{(data) => <NewsList news={data} />}</Pagination>
      )}
    </>
  )
}

export default NewsFeed
