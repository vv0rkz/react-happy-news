import { createBrowserRouter } from 'react-router'
import App from './App'
import Main from './pages/Main/Main'
import NewsDetail from './pages/NewsDetail/NewsDetail'

export const APP_ROUTES = {
  index: '/',
  NewsDetail: 'news/:id',
}

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
