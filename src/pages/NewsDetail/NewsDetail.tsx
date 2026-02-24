// src/pages/NewsDetail/NewsDetail.tsx
import { useParams } from 'react-router-dom'
import NewsDetailView from './NewsDetailView'
import styles from './styles.module.css'

const NewsDetail = (): React.ReactNode => {
  const { id } = useParams<{ id: string }>()
  return (
    <main className={styles.main}>
      <NewsDetailView id={id ?? ''} />
    </main>
  )
}

export default NewsDetail
