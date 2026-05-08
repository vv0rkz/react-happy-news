import { useDebounce } from '@shared/useDebounce'
import { useEffect, useState } from 'react'
import styles from './styles.module.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Поиск новостей...',
}: SearchInputProps): React.ReactNode => {
  const [rawValue, setRawValue] = useState(value)
  const debouncedValue = useDebounce(rawValue, 300)

  useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue])

  return (
    <input
      type="search"
      value={rawValue}
      onChange={(e) => setRawValue(e.target.value)}
      placeholder={placeholder}
      className={styles.searchInput}
    />
  )
}
