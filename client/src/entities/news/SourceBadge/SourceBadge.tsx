import { SourceName } from '@entities/news/api/apiNews/utils/transforms.types'
import styles from './styles.module.css'

const SOURCE_CONFIG: Record<SourceName, { label: string; colorClass: string }> = {
  [SourceName.Guardian]: { label: 'Guardian', colorClass: styles.guardian! },
  [SourceName.NewsApi]: { label: 'NewsAPI', colorClass: styles.newsapi! },
  [SourceName.HackerNews]: { label: 'HN', colorClass: styles.hackernews! },
}

interface SourceBadgeProps {
  source: SourceName
}

const SourceBadge = ({ source }: SourceBadgeProps): React.ReactNode => {
  const config = SOURCE_CONFIG[source]
  return <span className={`${styles.badge} ${config.colorClass}`}>{config.label}</span>
}

export default SourceBadge
