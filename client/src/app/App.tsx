import { Outlet } from 'react-router-dom'
import Header from '@widgets/Header'
// TODO: импортировать FeedbackForm из '@features/feedback'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <Outlet />
      {/* TODO: добавить <footer> с <FeedbackForm /> после <Outlet />
          стиль footer — на твой вкус, минимум: padding + borderTop */}
    </>
  )
}

export default App
