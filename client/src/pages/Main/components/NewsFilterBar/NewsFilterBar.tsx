import { ActionIcon, Popover, Stack, Text, Tooltip } from '@mantine/core'
import { useNewsFilterParams } from '../../lib/useNewsFilterParams'
import { SearchInput } from '../SearchInput'
import { SourceFilter } from '../SourceFilter'
import styles from './NewsFilterBar.module.css'

export const NewsFilterBar = (): React.ReactNode => {
  const { q, setQ, selectedSources, toggleSource } = useNewsFilterParams()

  return (
    <div className={styles.filterRow}>
      <div className={styles.searchRow}>
        <SearchInput value={q} onChange={setQ} placeholder="Поиск новостей..." />
      </div>

      <Popover width={220} position="bottom-end" withArrow shadow="md">
        <Popover.Target>
          <Tooltip label="Источники" withArrow>
            <ActionIcon variant="light" color="indigo" size="lg" radius="xl" aria-label="Источники">
              ⚙️
            </ActionIcon>
          </Tooltip>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap="xs">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Источники
            </Text>
            <SourceFilter selectedSources={selectedSources} onToggle={toggleSource} />
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </div>
  )
}
