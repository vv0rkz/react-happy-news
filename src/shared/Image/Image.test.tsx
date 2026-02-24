import { fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Image from './Image'

const IMAGE_URL = 'https://example.com/image.jpg'

describe('Image', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('показывает skeleton во время загрузки', () => {
    const { getByTestId } = render(<Image image={IMAGE_URL} />)
    // Зачем: проверяем условный рендеринг — это логика
    expect(getByTestId('skeleton')).toBeInTheDocument()
  })

  it('скрывает skeleton после успешной загрузки', async () => {
    const { queryByTestId, getByTestId } = render(<Image image={IMAGE_URL} />)
    const image = getByTestId('image')
    fireEvent.load(image)
    expect(queryByTestId('skeleton')).not.toBeInTheDocument()
    // Зачем: проверяем изменение состояния при событии
  })

  // it('показывает fallback при ошибке загрузки', async () => {
  //   // TODO: render(<Image image="broken.jpg" />)
  //   // TODO: найди img
  //   // TODO: fireEvent.error(img)
  //   // TODO: await waitFor(() => expect(img).toHaveAttribute('src', '/no-photo.svg'))
  //   // Зачем: ключевая логика — обработка ошибок
  // })

  // it('показывает fallback после таймаута 3 секунды', async () => {
  //   // TODO: render(<Image image="slow.jpg" />)
  //   // TODO: найди img
  //   // TODO: vi.advanceTimersByTime(3000) — промотай время на 3 сек
  //   // TODO: await waitFor(() => expect(img).toHaveAttribute('src', '/no-photo.svg'))
  //   // Зачем: самая важная логика — таймаут fallback
  // })

  // it('НЕ показывает fallback если картинка загрузилась до таймаута', async () => {
  //   // TODO: render(<Image image="fast.jpg" />)
  //   // TODO: найди img
  //   // TODO: fireEvent.load(img) — загрузилась успешно
  //   // TODO: vi.advanceTimersByTime(3000) — промотаем время
  //   // TODO: expect(img).toHaveAttribute('src', 'fast.jpg') — src НЕ изменился
  //   // Зачем: проверяем что таймер очищается после успешной загрузки
  // })

  // it('имеет атрибут loading="lazy"', () => {
  //   // TODO: render(<Image image="test.jpg" />)
  //   // TODO: найди img
  //   // TODO: expect(img).toHaveAttribute('loading', 'lazy')
  //   // Зачем: важная оптимизация — стоит зафиксировать в тесте
  // })
})
