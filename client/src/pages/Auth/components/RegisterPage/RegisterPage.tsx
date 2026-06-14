import { Container, Title } from '@mantine/core'
import { RegisterForm } from '@pages/Auth/components/RegisterForm'

export function RegisterPage() {
  return (
    <main>
      <Container size="lg" py="xl">
        <Title order={2} mb="lg">
          Create account
        </Title>
        <RegisterForm />
      </Container>
    </main>
  )
}
