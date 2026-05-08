import { OfflineBanner, useHealthCheck } from '@features/health-check'
import type { ToastMessage } from '@shared/Toast'
import { Toast } from '@shared/Toast'
import { Header } from '@widgets/Header'
import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import './App.css'

export function App(): React.ReactNode {
  const { status, lastOnlineAt } = useHealthCheck()
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const toastIdRef = useRef(0)
  const prevStatusRef = useRef(status)

  useEffect(() => {
    const prev = prevStatusRef.current
    prevStatusRef.current = status

    if (prev === 'checking') return

    if (status === 'offline' && prev === 'online') {
      setToast({ id: ++toastIdRef.current, text: 'Соединение с сервером потеряно', variant: 'error' })
    }

    if (status === 'online' && prev === 'offline') {
      setToast({ id: ++toastIdRef.current, text: 'Соединение восстановлено', variant: 'success' })
    }
  }, [status])

  return (
    <>
      <Header status={status} />
      {status === 'offline' && (
        <div style={{ padding: '12px 20px 0' }}>
          <OfflineBanner lastOnlineAt={lastOnlineAt} />
        </div>
      )}
      <Outlet />
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
