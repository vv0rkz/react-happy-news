import { generatePath, useNavigate } from 'react-router-dom'
import type { SourceName } from '@entities/news/api/apiNews/utils/transforms.types'
import { APP_ROUTES } from '@shared/config/routes'
import Image from '@shared/Image'
import { SourceBadge } from '../SourceBadge'
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
    source?: SourceName
  }
}

const NewsItem = ({ item }: NewsItemProps): React.ReactNode => {
  const navigate = useNavigate()
  const handleClick = (): void => {
    navigate(generatePath(APP_ROUTES.NewsDetail, { id: item.id }))
  }
  return (
    <article className={styles.item} onClick={handleClick}>
      <Image image={item.image} className={styles.image ?? ''} />
      <div className={styles.info}>
        {item.source && <SourceBadge source={item.source} />}
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.extra}>{item.description}</p>
      </div>
    </article>
  )
}

export default NewsItem
