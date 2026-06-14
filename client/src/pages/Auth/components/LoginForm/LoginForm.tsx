import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Stack, TextInput } from '@mantine/core'
import { useAuth } from '@pages/Auth/lib/useAuth'
import { loginSchema, type LoginFormValues } from '@shared/api/authSchemas'
import { useForm } from 'react-hook-form'

export function LoginForm() {
  const {
    register: registerForm,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const { login } = useAuth()

  async function onSubmit(data: LoginFormValues) {
    await login(data.email, data.password)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap="md">
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...registerForm('email')}
        />
        <TextInput
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...registerForm('password')}
        />
        <Button type="submit" loading={isSubmitting}>
          Log in
        </Button>
      </Stack>
    </form>
  )
}
