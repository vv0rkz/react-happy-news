import { type ReactNode, createContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const STORAGE_KEY = 'happyNews_mockMode'

interface MockContextValue {
  isMockEnabled: boolean
  toggleMock: () => void
}

export const MockContext = createContext<MockContextValue | undefined>(undefined)

interface MockProviderProps {
  children: ReactNode
}

export const MockProvider = ({ children }: MockProviderProps): React.ReactNode => {
  // Читаем из localStorage, если нет — берём из env
  const [isMockEnabled, setIsMockEnabled] = useLocalStorage(STORAGE_KEY, false)

  const toggleMock = (): void => {
    setIsMockEnabled((prev) => {
      const newValue = !prev
      console.log('🔄 Mock mode переключён:', newValue ? 'ON' : 'OFF')
      return newValue
    })
  }

  return <MockContext.Provider value={{ isMockEnabled, toggleMock }}>{children}</MockContext.Provider>
}
