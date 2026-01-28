import NewsItem from '../NewsItem/NewsItem'
import styles from './styles.module.css'

interface NewsListProps {
  news: Array<{
    id: string
    title: string
    description: string
    image: string
    published: string
    author: string
    tag: string
  }>
}

const NewsList = ({ news }: NewsListProps): React.ReactNode => {
  return (
    <div className={styles.list}>
      {news.map((item) => (
        <NewsItem key={item.id} item={item} />
      ))}
    </div>
  )
}

export default NewsList
