import { ErrorBoundary } from 'react-error-boundary'
import { ErrorComponent } from '@shared/ErrorComponent'
import { NewsFeed } from './NewsFeed'

export const Main = (): React.ReactNode => {
  return (
    <main>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorComponent error={error instanceof Error ? error : new Error(String(error))} onRetry={resetErrorBoundary} />
        )}
      >
        <NewsFeed />
      </ErrorBoundary>
    </main>
  )
}
