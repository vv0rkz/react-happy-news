import { SourceName, allSourceNames } from '@entities/news/api/apiNews/utils/transforms.types'
import styles from './styles.module.css'

const SOURCE_LABELS: Record<SourceName, string> = {
  [SourceName.Guardian]: 'Guardian',
  [SourceName.NewsApi]: 'NewsAPI',
  [SourceName.HackerNews]: 'HackerNews',
}

interface SourceFilterProps {
  selectedSources: SourceName[]
  onToggle: (source: SourceName) => void
}

const SourceFilter = ({ selectedSources, onToggle }: SourceFilterProps): React.ReactNode => {
  return (
    <div className={styles.filter}>
      {allSourceNames.map((source) => (
        <label key={source} className={styles.label}>
          <input
            type="checkbox"
            checked={selectedSources.includes(source)}
            onChange={() => onToggle(source)}
            className={styles.checkbox}
          />
          {SOURCE_LABELS[source]}
        </label>
      ))}
    </div>
  )
}

export default SourceFilter
