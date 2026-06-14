import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Stack, TextInput } from '@mantine/core'
import { AuthApiError } from '@pages/Auth/lib/authApi'
import { useAuth } from '@pages/Auth/lib/useAuth'
import { registerSchema, type RegisterFormValues } from '@shared/api/authSchemas'
import { useForm } from 'react-hook-form'

export function RegisterForm() {
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const { register: registerUser } = useAuth()

  async function onSubmit(data: RegisterFormValues) {
    try {
      await registerUser(data.email, data.password)
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 409) {
        setError('email', { message: error.message })
        return
      }
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap="md">
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...registerField('email')}
        />
        <TextInput
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...registerField('password')}
        />
        <Button type="submit" loading={isSubmitting}>
          Create account
        </Button>
      </Stack>
    </form>
  )
}
