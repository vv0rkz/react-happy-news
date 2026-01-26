// src/context/MockContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'

const MockContext = createContext()

const STORAGE_KEY = 'happyNews_mockMode'

export const MockProvider = ({ children }) => {
  // Читаем из localStorage, если нет — берём из env
  const [isMockEnabled, setIsMockEnabled] = useState(() => {
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

  const toggleMock = () => {
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
