import { SourceName } from '@entities/news/api/apiNews/utils/transforms.types'
import styles from './styles.module.css'

const SOURCE_CONFIG: Record<SourceName, { label: string; colorClass: string }> = {
  [SourceName.Guardian]: { label: 'Guardian', colorClass: styles.guardian! },
  [SourceName.Rss]: { label: 'RSS', colorClass: styles.rss! },
}

interface SourceBadgeProps {
  source: SourceName
}

export const SourceBadge = ({ source }: SourceBadgeProps): React.ReactNode => {
  const config = SOURCE_CONFIG[source]
  return <span className={`${styles.badge} ${config.colorClass}`}>{config.label}</span>
}
