import { Header } from '@widgets/Header'
import { Outlet } from 'react-router-dom'
// import { FeedbackForm } from '@features/feedback'
import './App.css'

export function App(): React.ReactNode {
  return (
    <>
      <Header />
      <Outlet />
      {/* <footer style={{ borderTop: '1px solid #eee', paddingTop: '32px', marginTop: '64px' }}>
        <FeedbackForm />
      </footer> */}
    </>
  )
}
