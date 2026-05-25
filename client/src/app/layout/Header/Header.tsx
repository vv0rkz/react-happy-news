import type { HealthStatus } from '@app/lib/health-check'
import { StatusBadge } from '@app/lib/health-check'
import { ActionIcon, Badge, Button, Container, Group, Stack, Text, Tooltip, useMantineColorScheme } from '@mantine/core'
import { useLocalStorage } from '@shared/hooks/useLocalStorage'
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
        </Stack>
      </Container>
    </header>
  )
}
