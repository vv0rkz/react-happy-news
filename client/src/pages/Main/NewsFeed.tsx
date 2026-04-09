import NewsBanner from '@entities/news/NewsBanner'
import NewsList from '@entities/news/NewsList'
import { useGetNewsQuery } from '@entities/news/api'
import Pagination from '@features/paginate-news/Pagination'
import { SourceFilter, useSourceFilter } from '@features/source-filter'
import ErrorComponent from '@shared/ErrorComponent'
import Skeleton from '@shared/Skeleton'

const NewsFeed = (): React.ReactNode => {
  const { selectedSources, sourcesParam, toggle } = useSourceFilter()

  const {
    data: news,
    isLoading: isInitialLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetNewsQuery(sourcesParam)

  const isLoading = isInitialLoading || isFetching
  const normalizedError = queryError ? new Error('Ошибка загрузки новостей') : null

  if (normalizedError && !isLoading) {
    return <ErrorComponent error={normalizedError} onRetry={refetch} />
  }

  return (
    <>
      <SourceFilter selectedSources={selectedSources} onToggle={toggle} />
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
