import './App.css'
import Header from './components/Header/Header'
import { MockProvider } from './context/MockContext'
import Main from './pages/Main/Main'
function App() {
  return (
    <MockProvider>
      <Header />
      <div className="container">
        <Main />
      </div>
    </MockProvider>
  )
}

export default App
