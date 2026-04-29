import NewsItem from '../NewsItem'
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
  if (news.length === 0) {
    return <p className={styles.empty}>Нет новостей по выбранным источникам</p>
  }

  return (
    <ul className={styles.list}>
      {news.map((item) => (
        <li key={item.id} className={styles.listItem}>
          <NewsItem item={item} />
        </li>
      ))}
    </ul>
  )
}

export default NewsList
