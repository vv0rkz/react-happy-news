import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Header from './Header'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const MOCK_STORAGE_KEY = 'happyNews_mockMode'

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
    render(<Header />)
    expect(screen.getByRole('heading', { name: /happy news/i })).toBeInTheDocument()
  })

  it('показывает статус "OFF" и иконку "🌐" когда mock выключен', () => {
    render(<Header />)
    expect(screen.getByText('OFF')).toBeInTheDocument()
    expect(screen.getByText('🌐')).toBeInTheDocument()
  })

  it('показывает статус "ON" и иконку "🔧" когда mock включён', () => {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(true))
    render(<Header />)
    expect(screen.getByText('ON')).toBeInTheDocument()
    expect(screen.getByText('🔧')).toBeInTheDocument()
  })

  it('по клику сохраняет новое значение в localStorage и вызывает reload', async () => {
    const user = userEvent.setup()
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    render(<Header />)

    await user.click(screen.getByRole('button', { name: /mock/i }))

    expect(setItemSpy).toHaveBeenCalledWith(MOCK_STORAGE_KEY, JSON.stringify(true))
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  it('при повторном клике переключает mock обратно в OFF', async () => {
    const user = userEvent.setup()
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(true))
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    render(<Header />)

    await user.click(screen.getByRole('button', { name: /mock/i }))

    expect(setItemSpy).toHaveBeenCalledWith(MOCK_STORAGE_KEY, JSON.stringify(false))
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  it('вызывает navigate("/") при клике на заголовок', async () => {
    const user = userEvent.setup()
    render(<Header />)

    await user.click(screen.getByRole('heading', { name: /happy news/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('применяет класс statusOn когда mock включён', () => {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(true))
    render(<Header />)
    expect(screen.getByText('ON')).toHaveClass('statusOn')
  })

  it('применяет класс statusOff когда mock выключен', () => {
    render(<Header />)
    expect(screen.getByText('OFF')).toHaveClass('statusOff')
  })
})
