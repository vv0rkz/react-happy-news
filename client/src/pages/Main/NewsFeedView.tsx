import type { NewsDetailsData } from '@entities/news/api/apiNews/utils/transforms.types'
import { NewsBanner } from '@entities/news/NewsBanner'
import { NewsList } from '@entities/news/NewsList'
import { CategoryFilter } from '@features/news-filter'
import { Pagination } from '@features/paginate-news/Pagination'
import { Divider, Stack } from '@mantine/core'
import { Skeleton } from '@shared/Skeleton'

interface NewsFeedViewProps {
  news: NewsDetailsData[] | undefined
  isLoading: boolean
}

export const NewsFeedView = ({ news, isLoading }: NewsFeedViewProps): React.ReactNode => {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <CategoryFilter />
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
