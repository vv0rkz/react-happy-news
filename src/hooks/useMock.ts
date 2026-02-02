import { useContext } from 'react'
import { MockContext } from '../context/MockContext'

export const useMock = () => {
  const context = useContext(MockContext)
  if (!context) {
    throw new Error('useMock must be used within MockProvider')
  }
  return context
}
