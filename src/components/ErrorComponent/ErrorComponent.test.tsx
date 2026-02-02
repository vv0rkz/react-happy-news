import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ErrorComponent from './ErrorComponent'

describe('ErrorComponent', () => {
  const mockError = new Error('Ошибка подключения к серверу')
  const mockOnRetry = vi.fn()

  it('вызывает onRetry при клике на кнопку', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<ErrorComponent error={mockError} onRetry={mockOnRetry} />)
    await user.click(getByRole('button', { name: /Попробовать снова/ }))
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })
})
