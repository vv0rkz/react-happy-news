import { SourceName } from '@model/news/api/apiNews/utils/transforms.types'
import { SourceBadge } from '../SourceBadge'
import { formatTimeAgo } from './formatTimeAgo'
import { Image } from '../Image'
import styles from './styles.module.css'

interface NewsBannerProps {
  item: {
    id: string
    title: string
    description: string
    image: string
    published: string
    author: string
    tag: string
    source?: string
  }
}

export const NewsBanner = ({ item }: NewsBannerProps): React.ReactNode => {
  const source = item.source as SourceName | undefined
  return (
    <div className={styles.banner}>
      <Image image={item.image} className={styles.image ?? ''} />
      {source && <SourceBadge source={source} />}
      <h1 className={styles.title}>{item.title}</h1>
      <p className={styles.extra}>
        {formatTimeAgo(item.published)} by {item.author}
      </p>
    </div>
  )
}
