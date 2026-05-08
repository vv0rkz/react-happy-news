import type { HealthStatus } from './useHealthCheck'
import styles from './StatusBadge.module.css'

interface StatusBadgeProps {
  status: HealthStatus
}

const STATUS_CONFIG: Record<HealthStatus, { label: string; tooltip: string; className: string }> = {
  online: {
    label: 'Сервер работает',
    tooltip: 'Соединение с сервером установлено. Данные актуальны.',
    className: 'online',
  },
  offline: {
    label: 'Нет связи',
    tooltip: 'Сервер недоступен. Показываем данные из кэша.',
    className: 'offline',
  },
  checking: {
    label: 'Проверяем...',
    tooltip: 'Проверяем соединение с сервером.',
    className: 'checking',
  },
}

export const StatusBadge = ({ status }: StatusBadgeProps): React.ReactNode => {
  if (status === 'checking') return null

  const { label, tooltip, className } = STATUS_CONFIG[status]

  return (
    <span className={`${styles.badge} ${styles[className]}`} title={tooltip}>
      <span className={styles.dot} />
      {label}
    </span>
  )
}
