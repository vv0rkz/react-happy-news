import { createBrowserRouter } from 'react-router-dom'
import { APP_ROUTES } from '@shared/config/routes'
import App from './App'
import Main from '@pages/Main'
import NewsDetail from '@pages/NewsDetail'

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.index,
    element: <App />,
    children: [
      { index: true, element: <Main /> },
      { path: APP_ROUTES.NewsDetail, element: <NewsDetail /> },
    ],
  },
])
