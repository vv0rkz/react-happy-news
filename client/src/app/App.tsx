import Header from '@widgets/Header'
import { Outlet } from 'react-router-dom'
// import { FeedbackForm } from '@features/feedback'
import './App.css'

function App() {
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

export default App
