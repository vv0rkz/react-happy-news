import { Alert, Button, Container, List, Stack, Text, Title } from '@mantine/core'

interface ErrorComponentProps {
  error: Error
  onRetry: () => void
}

export function ErrorComponent({ error, onRetry }: ErrorComponentProps): React.ReactNode {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg">
        <Text size="80px" style={{ lineHeight: 1 }}>📡</Text>
        <Title order={2}>Ошибка подключения</Title>
        <Text c="dimmed">{error.message}</Text>

        <Alert color="yellow" variant="light" title="💡 Возможные причины" w="100%">
          <List size="sm" spacing="xs">
            <List.Item>Нет интернета</List.Item>
            <List.Item>CORS блокировка — используй Mock режим</List.Item>
            <List.Item>API временно недоступен</List.Item>
          </List>
        </Alert>

        <Button onClick={onRetry} color="indigo" radius="xl" size="md">
          🔄 Попробовать снова
        </Button>
      </Stack>
    </Container>
  )
}
