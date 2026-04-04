import { Outlet } from 'react-router-dom'
import Header from '@widgets/Header'
import './App.css'
function App() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

export default App
