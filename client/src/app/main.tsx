import { MantineProvider, createTheme, localStorageColorSchemeManager } from '@mantine/core'
import '@mantine/core/styles.css'
import { Notifications } from '@mantine/notifications'
import '@mantine/notifications/styles.css'
import { queryClient } from '@shared/api/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import { router } from './router'

const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'md',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
})

const colorSchemeManager = localStorageColorSchemeManager({ key: 'happyNews_colorScheme' })

const MOCK_STORAGE_KEY = 'happyNews_mockMode'

async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) return

  const isMockEnabled = localStorage.getItem(MOCK_STORAGE_KEY) === 'true'
  if (!isMockEnabled) return

  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
  })
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

enableMocking().finally(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager}>
        <Notifications position="bottom-center" />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </AuthProvider>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>,
  )
})
