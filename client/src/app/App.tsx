import { OfflineBanner, useHealthCheck } from '@features/health-check'
import { notifications } from '@mantine/notifications'
import { Header } from '@widgets/Header'
import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'

export function App(): React.ReactNode {
  const { status, lastOnlineAt } = useHealthCheck()
  const prevStatusRef = useRef(status)

  useEffect(() => {
    const prev = prevStatusRef.current
    prevStatusRef.current = status

    if (prev === 'pending') return

    if (status === 'error' && prev === 'success') {
      notifications.show({
        message: 'Соединение с сервером потеряно',
        color: 'red',
        autoClose: 4000,
      })
    }

    if (status === 'success' && prev === 'error') {
      notifications.show({
        message: 'Соединение восстановлено',
        color: 'green',
        autoClose: 4000,
      })
    }
  }, [status])

  return (
    <>
      <Header status={status} />
      {status === 'error' && <OfflineBanner lastOnlineAt={lastOnlineAt} />}
      <Outlet />
    </>
  )
}
