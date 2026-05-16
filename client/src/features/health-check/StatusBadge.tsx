import { Badge, Tooltip } from '@mantine/core'
import type { HealthStatus } from './useHealthCheck'

interface StatusBadgeProps {
  status: HealthStatus
}

const STATUS_CONFIG: Record<Exclude<HealthStatus, 'pending'>, { label: string; tooltip: string; color: string }> = {
  success: {
    label: 'Сервер работает',
    tooltip: 'Соединение с сервером установлено. Данные актуальны.',
    color: 'green',
  },
  error: {
    label: 'Нет связи',
    tooltip: 'Сервер недоступен. Показываем данные из кэша.',
    color: 'red',
  },
}

export const StatusBadge = ({ status }: StatusBadgeProps): React.ReactNode => {
  if (status === 'pending') return null

  const { label, tooltip, color } = STATUS_CONFIG[status]

  return (
    <Tooltip label={tooltip} withArrow>
      <Badge color={color} variant="dot" size="lg">
        {label}
      </Badge>
    </Tooltip>
  )
}
