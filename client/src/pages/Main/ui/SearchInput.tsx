import { TextInput } from '@mantine/core'
import { useDebounce } from '@shared/hooks/useDebounce'
import { useEffect, useState } from 'react'

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
  }, [debouncedValue, onChange])

  return (
    <TextInput
      value={rawValue}
      onChange={(e) => setRawValue(e.target.value)}
      placeholder={placeholder}
      radius="xl"
      style={{ flex: 1, minWidth: 220 }}
    />
  )
}
