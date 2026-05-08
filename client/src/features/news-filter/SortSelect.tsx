import styles from './styles.module.css'

export type SortOption = 'date' | 'source'

interface SortSelectProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

export const SortSelect = ({ value, onChange }: SortSelectProps): React.ReactNode => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className={styles.sortSelect}
    >
      <option value="date">По дате</option>
      <option value="source">По источнику</option>
    </select>
  )
}
