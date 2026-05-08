import type { HealthStatus } from '@features/health-check'
import { StatusBadge } from '@features/health-check'
import { SearchInput, useNewsFilterContext } from '@features/news-filter'
import { SourceFilter } from '@features/source-filter'
import {
  ActionIcon,
  Badge,
  Button,
  Collapse,
  Container,
  Group,
  Popover,
  Stack,
  Text,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core'
import { useLocalStorage } from '@shared/useLocalStorage'
import { useNavigate } from 'react-router-dom'
import styles from './styles.module.css'

const MOCK_STORAGE_KEY = 'happyNews_mockMode'

interface HeaderProps {
  status: HealthStatus
}

export const Header = ({ status }: HeaderProps): React.ReactNode => {
  const [isMockEnabled, setIsMockEnabled] = useLocalStorage<boolean>({ key: MOCK_STORAGE_KEY, initialValue: false })
  const navigate = useNavigate()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const { searchQuery, setSearchQuery, searchVisible, toggleSearch, selectedSources, toggleSource } =
    useNewsFilterContext()

  const toggleMock = (): void => {
    const next = !isMockEnabled
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(next))
    setIsMockEnabled(next)
    window.location.reload()
  }

  return (
    <header className={styles.header}>
      <Container size="lg">
        <Stack gap={0}>
          <Group justify="space-between" align="center">
            <Text component="h1" className={styles.title ?? ''} onClick={() => navigate('/')}>
              Happy News 🌞
            </Text>

            <Group gap="xs">
              <StatusBadge status={status} />

              <Tooltip label={searchVisible ? 'Закрыть поиск' : 'Поиск'} withArrow>
                <ActionIcon
                  onClick={toggleSearch}
                  variant={searchVisible ? 'filled' : 'light'}
                  color="indigo"
                  size="lg"
                  radius="xl"
                  aria-label="Поиск"
                >
                  {searchVisible ? '✕' : '🔍'}
                </ActionIcon>
              </Tooltip>

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

              <Tooltip label={colorScheme === 'dark' ? 'Светлая тема' : 'Тёмная тема'} withArrow>
                <ActionIcon
                  onClick={() => toggleColorScheme()}
                  variant="light"
                  color="indigo"
                  size="lg"
                  radius="xl"
                  aria-label="Переключить тему"
                >
                  {colorScheme === 'dark' ? '☀️' : '🌙'}
                </ActionIcon>
              </Tooltip>

              <Button
                onClick={toggleMock}
                variant={isMockEnabled ? 'filled' : 'light'}
                color={isMockEnabled ? 'orange' : 'indigo'}
                size="sm"
                radius="xl"
                leftSection={isMockEnabled ? '🔧' : '🌐'}
                rightSection={
                  <Badge size="xs" color={isMockEnabled ? 'orange' : 'gray'} variant="filled">
                    {isMockEnabled ? 'ON' : 'OFF'}
                  </Badge>
                }
              >
                Mock
              </Button>
            </Group>
          </Group>

          <Collapse expanded={searchVisible}>
            <div className={styles.searchRow}>
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Поиск новостей..." />
            </div>
          </Collapse>
        </Stack>
      </Container>
    </header>
  )
}
