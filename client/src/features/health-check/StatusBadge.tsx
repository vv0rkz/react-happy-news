import { Badge, Tooltip } from '@mantine/core'
import type { HealthStatus } from './useHealthCheck'

interface StatusBadgeProps {
  status: HealthStatus
}

const STATUS_CONFIG: Record<HealthStatus, { label: string; tooltip: string; color: string }> = {
  online: {
    label: 'Сервер работает',
    tooltip: 'Соединение с сервером установлено. Данные актуальны.',
    color: 'green',
  },
  offline: {
    label: 'Нет связи',
    tooltip: 'Сервер недоступен. Показываем данные из кэша.',
    color: 'red',
  },
  checking: {
    label: 'Проверяем...',
    tooltip: 'Проверяем соединение с сервером.',
    color: 'gray',
  },
}

export const StatusBadge = ({ status }: StatusBadgeProps): React.ReactNode => {
  if (status === 'checking') return null

  const { label, tooltip, color } = STATUS_CONFIG[status]

  return (
    <Tooltip label={tooltip} withArrow>
      <Badge color={color} variant="dot" size="lg">
        {label}
      </Badge>
    </Tooltip>
  )
}
