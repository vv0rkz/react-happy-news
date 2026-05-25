import { ErrorComponent } from '@shared/ui/ErrorComponent'
import { Container } from '@mantine/core'
import { ErrorBoundary } from 'react-error-boundary'
import { NewsFeed } from './NewsFeed'

export const Main = (): React.ReactNode => {
  return (
    <main>
      <Container size="lg" py="xl">
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ErrorComponent error={error instanceof Error ? error : new Error(String(error))} onRetry={resetErrorBoundary} />
          )}
        >
          <NewsFeed />
        </ErrorBoundary>
      </Container>
    </main>
  )
}
