import { Chip, ScrollArea } from '@mantine/core'
import { CATEGORIES } from '../../lib/categories'
import { useNewsFilterParams } from '../../lib/useNewsFilterParams'

export const CategoryFilter = (): React.ReactNode => {
  const { category, setCategory } = useNewsFilterParams()

  return (
    <ScrollArea scrollbarSize={4} type="scroll">
      <Chip.Group multiple={false} value={category} onChange={setCategory}>
        <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              value={cat.value}
              size="sm"
              radius="xl"
              variant="outline"
              color="indigo"
              style={{ flexShrink: 0 }}
            >
              {cat.label}
            </Chip>
          ))}
        </div>
      </Chip.Group>
    </ScrollArea>
  )
}
