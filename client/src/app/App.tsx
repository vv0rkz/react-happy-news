import { OfflineBanner, useHealthCheck } from '@features/health-check'
import { NewsFilterProvider } from '@features/news-filter'
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

    if (prev === 'checking') return

    if (status === 'offline' && prev === 'online') {
      notifications.show({
        message: 'Соединение с сервером потеряно',
        color: 'red',
        autoClose: 4000,
      })
    }

    if (status === 'online' && prev === 'offline') {
      notifications.show({
        message: 'Соединение восстановлено',
        color: 'green',
        autoClose: 4000,
      })
    }
  }, [status])

  return (
    <NewsFilterProvider>
      <Header status={status} />
      {status === 'offline' && <OfflineBanner lastOnlineAt={lastOnlineAt} />}
      <Outlet />
    </NewsFilterProvider>
  )
}
