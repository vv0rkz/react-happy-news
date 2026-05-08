import { Chip, ScrollArea } from '@mantine/core'
import { useNewsFilterContext } from './NewsFilterContext'

export const CATEGORIES = [
  { value: 'all', label: '📰 Все' },
  { value: 'environment', label: '🌿 Природа' },
  { value: 'technology', label: '💡 Технологии' },
  { value: 'sport', label: '🏆 Спорт' },
  { value: 'science', label: '🔬 Наука' },
  { value: 'world', label: '🌍 Общество' },
]

export const CategoryFilter = (): React.ReactNode => {
  const { category, setCategory } = useNewsFilterContext()

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
