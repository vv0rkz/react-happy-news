import { SegmentedControl } from '@mantine/core'

export type SortOption = 'date' | 'source'

interface SortSelectProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const SORT_DATA = [
  { label: 'По дате', value: 'date' },
  { label: 'По источнику', value: 'source' },
]

export const SortSelect = ({ value, onChange }: SortSelectProps): React.ReactNode => {
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => onChange(v as SortOption)}
      data={SORT_DATA}
      size="sm"
      radius="xl"
      color="indigo"
    />
  )
}
