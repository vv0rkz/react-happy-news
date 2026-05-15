import { Virtuoso } from 'react-virtuoso'
import { NewsItem } from '../NewsItem'
import styles from './styles.module.css'

type NewsListItem = {
  id: string
  title: string
  description: string
  image: string
  published: string
  author: string
  tag: string
}

interface NewsListProps {
  news: NewsListItem[]
}

export const NewsList = ({ news }: NewsListProps): React.ReactNode => {
  if (news.length === 0) {
    return <p className={styles.empty}>Нет новостей по выбранным источникам</p>
  }

  return (
    <Virtuoso
      data={news}
      useWindowScroll
      itemContent={(_index, item) => (
        <div className={styles.listItem}>
          <NewsItem item={item} />
        </div>
      )}
    />
  )
}
