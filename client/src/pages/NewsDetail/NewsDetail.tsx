import { useParams } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorComponent from '@shared/ErrorComponent'
import styles from './styles.module.css'
import NewsDetailView from './NewsDetailView'

const NewsDetail = (): React.ReactNode => {
  const { id } = useParams<{ id: string }>()
  return (
    <main className={styles.main}>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorComponent error={error instanceof Error ? error : new Error(String(error))} onRetry={resetErrorBoundary} />
        )}
      >
        <NewsDetailView id={id ?? ''} />
      </ErrorBoundary>
    </main>
  )
}

export default NewsDetail
