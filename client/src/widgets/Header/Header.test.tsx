import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Header } from './Header'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const MOCK_STORAGE_KEY = 'happyNews_mockMode'

function Providers({ children }: { children: ReactNode }) {
  return <MantineProvider>{children}</MantineProvider>
}

function renderHeader() {
  return render(<Header status="success" />, { wrapper: Providers })
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.stubGlobal('location', { reload: vi.fn() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('отображает заголовок "Happy News 🌞"', () => {
    renderHeader()
    expect(screen.getByRole('heading', { name: /happy news/i })).toBeInTheDocument()
  })

  it('показывает статус "OFF" и иконку "🌐" когда mock выключен', () => {
    renderHeader()
    expect(screen.getByText('OFF')).toBeInTheDocument()
    expect(screen.getByText('🌐')).toBeInTheDocument()
  })

  it('показывает статус "ON" и иконку "🔧" когда mock включён', () => {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(true))
    renderHeader()
    expect(screen.getByText('ON')).toBeInTheDocument()
    expect(screen.getByText('🔧')).toBeInTheDocument()
  })

  it('по клику сохраняет новое значение в localStorage и вызывает reload', async () => {
    const user = userEvent.setup()
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    renderHeader()

    await user.click(screen.getByRole('button', { name: /mock/i }))

    expect(setItemSpy).toHaveBeenCalledWith(MOCK_STORAGE_KEY, JSON.stringify(true))
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  it('при повторном клике переключает mock обратно в OFF', async () => {
    const user = userEvent.setup()
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(true))
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    renderHeader()

    await user.click(screen.getByRole('button', { name: /mock/i }))

    expect(setItemSpy).toHaveBeenCalledWith(MOCK_STORAGE_KEY, JSON.stringify(false))
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  it('вызывает navigate("/") при клике на заголовок', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('heading', { name: /happy news/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('кнопка поиска присутствует в хедере', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: /поиск/i })).toBeInTheDocument()
  })

  it('кнопка настройки источников присутствует в хедере', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: /источники/i })).toBeInTheDocument()
  })
})
