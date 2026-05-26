import { SourceName } from '@entities/news/api/apiNews/utils/transforms.types'
import styles from './styles.module.css'

const SOURCE_CONFIG: Record<SourceName, { label: string; colorClass: string }> = {
  [SourceName.Guardian]: { label: 'Guardian', colorClass: styles.guardian! },
  [SourceName.PositiveNews]: { label: 'Positive News', colorClass: styles.positiveNews! },
  [SourceName.ReasonsToBeCheerful]: { label: 'Reasons to be Cheerful', colorClass: styles.reasonsToBCheerful! },
  [SourceName.Upworthy]: { label: 'Upworthy', colorClass: styles.upworthy! },
  [SourceName.Mongabay]: { label: 'Mongabay', colorClass: styles.mongabay! },
  [SourceName.TheConversation]: { label: 'The Conversation', colorClass: styles.theConversation! },
  [SourceName.AtlasObscura]: { label: 'Atlas Obscura', colorClass: styles.atlasObscura! },
  [SourceName.ScienceAlert]: { label: 'ScienceAlert', colorClass: styles.scienceAlert! },
}

interface SourceBadgeProps {
  source: SourceName
}

export const SourceBadge = ({ source }: SourceBadgeProps): React.ReactNode => {
  const config = SOURCE_CONFIG[source]
  return <span className={`${styles.badge} ${config.colorClass}`}>{config.label}</span>
}
