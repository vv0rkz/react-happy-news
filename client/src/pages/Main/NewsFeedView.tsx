import type { NewsDetailsData } from '@entities/news/api/apiNews/utils/transforms.types'
import { NewsBanner } from '@entities/news/ui/NewsBanner'
import { NewsList } from '@entities/news/ui/NewsList'
import { Divider, Stack } from '@mantine/core'
import { Skeleton } from '@shared/ui/Skeleton'
import { CategoryFilter } from './ui/CategoryFilter'
import { NewsFilterBar } from './ui/NewsFilterBar'
import styles from './NewsFeedView.module.css'

interface NewsFeedViewProps {
  news: NewsDetailsData[] | undefined
  isLoading: boolean
}

export const NewsFeedView = ({ news, isLoading }: NewsFeedViewProps): React.ReactNode => {
  return (
    <Stack gap="lg">
      <div className={styles.controls}>
        <NewsFilterBar />
        <CategoryFilter />
      </div>
      <Divider />

      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : news?.[0] && <NewsBanner item={news[0]} />}

      {isLoading ? (
        <Skeleton type="item" count={10} height="100px" />
      ) : (
        news && <NewsList news={news} />
      )}
    </Stack>
  )
}
