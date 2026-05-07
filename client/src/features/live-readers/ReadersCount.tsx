import styles from './styles.module.css'
import { useLiveReaders } from './useLiveReaders'

interface ReadersCountProps {
  articleId: string
}

export const ReadersCount = ({ articleId }: ReadersCountProps): React.ReactNode => {
  const { count, status } = useLiveReaders(articleId)

  if (status !== 'connected' || count <= 0) {
    return null
  }

  return (
    <div className={styles.container}>
      <span className={styles.dot} />
      <span className={styles.text}>Читают сейчас: {count}</span>
    </div>
  )
}
