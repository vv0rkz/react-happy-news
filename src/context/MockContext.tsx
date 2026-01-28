import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface MockContextValue {
  isMockEnabled: boolean
  toggleMock: () => void
}

const MockContext = createContext<MockContextValue | undefined>(undefined)

const STORAGE_KEY = 'happyNews_mockMode'

interface MockProviderProps {
  children: ReactNode
}

export const MockProvider = ({ children }: MockProviderProps): React.ReactNode => {
  // Читаем из localStorage, если нет — берём из env
  const [isMockEnabled, setIsMockEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      return stored === 'true'
    }
    return false
  })

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isMockEnabled))
    console.log('💾 Mock mode сохранён:', isMockEnabled ? 'ON' : 'OFF')
  }, [isMockEnabled])

  const toggleMock = (): void => {
    setIsMockEnabled((prev) => {
      const newValue = !prev
      console.log('🔄 Mock mode переключён:', newValue ? 'ON' : 'OFF')
      return newValue
    })
  }

  return <MockContext.Provider value={{ isMockEnabled, toggleMock }}>{children}</MockContext.Provider>
}

// Хук для удобного использования
export const useMock = () => {
  const context = useContext(MockContext)
  if (!context) {
    throw new Error('useMock must be used within MockProvider')
  }
  return context
}
