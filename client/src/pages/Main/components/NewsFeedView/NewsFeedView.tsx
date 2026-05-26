import type { NewsDetailsData } from '@model/news/api/apiNews/utils/transforms.types'
import { NewsBanner } from '@model/news/components/NewsBanner'
import { NewsList } from '@model/news/components/NewsList'
import { Divider, Stack } from '@mantine/core'
import { Skeleton } from '@shared/components/Skeleton'
import { CategoryFilter } from '../CategoryFilter'
import { NewsFilterBar } from '../NewsFilterBar'
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
