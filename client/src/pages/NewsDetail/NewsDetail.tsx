import { useParams } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorComponent } from '@shared/components/ErrorComponent'
import styles from './NewsDetail.module.css'
import { NewsDetailView } from './components/NewsDetailView'

export const NewsDetail = (): React.ReactNode => {
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
