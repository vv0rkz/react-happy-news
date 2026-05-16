import { useEffect, useState } from 'react'
import styles from './styles.module.css'

export type ToastVariant = 'error' | 'success' | 'info'

export interface ToastMessage {
  id: number
  text: string
  variant: ToastVariant
}

interface ToastProps {
  message: ToastMessage | null
  duration?: number
  onDismiss: () => void
}

export const Toast = ({ message, duration = 4000, onDismiss }: ToastProps): React.ReactNode => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (message === null) return

    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, duration)

    return () => {
      clearTimeout(timer)
    }
  }, [message?.id])

  if (message === null) return null

  return (
    <div className={`${styles.toast} ${styles[message.variant]} ${visible ? styles.visible : styles.hidden}`}>
      {message.text}
    </div>
  )
}
