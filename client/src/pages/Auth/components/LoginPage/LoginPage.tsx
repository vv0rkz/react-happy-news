import { Container, Title } from '@mantine/core'
import { LoginForm } from '@pages/Auth/components/LoginForm'

export function LoginPage() {
  return (
    <main>
      <Container size="lg" py="xl">
        <Title order={2} mb="lg">
          Log in
        </Title>
        <LoginForm />
      </Container>
    </main>
  )
}
