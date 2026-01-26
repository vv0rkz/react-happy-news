import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { MockProvider } from './context/MockContext'
import './index.css'
import { router } from './router'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MockProvider>
      <RouterProvider router={router} />
    </MockProvider>
  </StrictMode>,
)
