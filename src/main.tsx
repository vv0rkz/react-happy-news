import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { store } from './store/store'

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
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>,
  )
})
