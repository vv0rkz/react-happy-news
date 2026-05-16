import { Alert, Container } from '@mantine/core'

interface OfflineBannerProps {
  lastOnlineAt: Date | null
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export const OfflineBanner = ({ lastOnlineAt }: OfflineBannerProps): React.ReactNode => {
  const message =
    lastOnlineAt !== null
      ? `Нет связи с сервером. Показываем данные от ${formatTime(lastOnlineAt)}`
      : 'Нет связи с сервером. Показываем последние доступные данные'

  return (
    <Container size="lg" pt="sm">
      <Alert color="red" variant="light" title="Нет соединения" icon="⚠️">
        {message}
      </Alert>
    </Container>
  )
}
