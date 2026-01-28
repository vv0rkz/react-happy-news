import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { MockProvider } from './context/MockContext'
import './index.css'
import { router } from './router'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <MockProvider>
      <RouterProvider router={router} />
    </MockProvider>
  </StrictMode>,
)
