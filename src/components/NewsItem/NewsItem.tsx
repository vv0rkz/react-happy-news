import { generatePath, useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '../../router'
import Image from '../Image/Image'
import styles from './styles.module.css'

interface NewsItemProps {
  item: {
    id: string
    title: string
    description: string
    image: string
    published: string
    author: string
    tag: string
  }
}

const NewsItem = ({ item }: NewsItemProps): React.ReactNode => {
  const navigate = useNavigate()
  const handleClick = (): void => {
    navigate(generatePath(APP_ROUTES.NewsDetail, { id: item.id }))
  }
  return (
    <div className={styles.item} onClick={handleClick}>
      <Image image={item.image} className={styles.image ?? ''} />
      <div className={styles.info}>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.extra}>{item.description}</p>
      </div>
    </div>
  )
}

export default NewsItem
