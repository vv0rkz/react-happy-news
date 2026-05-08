import type { HealthStatus } from '@features/health-check'
import { StatusBadge } from '@features/health-check'
import { Badge, Button, Container, Group, Text } from '@mantine/core'
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

  const toggleMock = (): void => {
    const next = !isMockEnabled
    // Записываем в localStorage синхронно до reload, иначе useEffect не успеет сохранить
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(next))
    setIsMockEnabled(next)
    // MSW стартует/останавливается при загрузке приложения,
    // поэтому для применения переключателя делаем reload.
    window.location.reload()
  }

  return (
    <header className={styles.header}>
      <Container size="lg">
        <Group justify="space-between" align="center">
          <Text
            component="h1"
            className={styles.title}
            onClick={() => navigate('/')}
          >
            Happy News 🌞
          </Text>
          <Group gap="sm">
            <StatusBadge status={status} />
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
      </Container>
    </header>
  )
}
