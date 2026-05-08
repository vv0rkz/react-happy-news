import styles from './OfflineBanner.module.css'

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
    <div className={styles.banner} role="alert">
      <span className={styles.icon}>⚠️</span>
      <span className={styles.message}>{message}</span>
    </div>
  )
}
