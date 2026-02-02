import { beforeEach, describe, it, vi } from 'vitest'
// Мокаем react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Мокаем MockContext
const mockToggleMock = vi.fn()
vi.mock('@hooks/useMock', () => ({
  useMock: vi.fn(),
}))

describe('Header', () => {
  // Импортируем useMock для динамической подмены

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('отображает заголовок "Happy News 🌞"', () => {
    // TODO: настрой useMock.mockReturnValue({ isMockEnabled: false, toggleMock: mockToggleMock })
    // TODO: render(<Header />) (не нужен BrowserRouter, т.к. уже замокан)
    // TODO: проверь наличие заголовка через getByRole('heading', { name: /happy news/i })
  })

  it('показывает статус "OFF" когда mock выключен', () => {
    // TODO: useMock.mockReturnValue({ isMockEnabled: false, toggleMock: mockToggleMock })
    // TODO: render(<Header />)
    // TODO: проверь наличие текста "OFF"
    // TODO: проверь наличие иконки "🌐"
  })

  it('показывает статус "ON" когда mock включен', () => {
    // TODO: useMock.mockReturnValue({ isMockEnabled: true, toggleMock: mockToggleMock })
    // TODO: render(<Header />)
    // TODO: проверь наличие текста "ON"
    // TODO: проверь наличие иконки "🔧"
  })

  it('вызывает toggleMock при клике на кнопку Mock', async () => {
    // TODO: useMock.mockReturnValue({ isMockEnabled: false, toggleMock: mockToggleMock })
    // TODO: const user = userEvent.setup()
    // TODO: render(<Header />)
    // TODO: найди кнопку через getByRole('button', { name: /mock/i })
    // TODO: await user.click(button)
    // TODO: expect(mockToggleMock).toHaveBeenCalledTimes(1)
  })

  it('вызывает navigate("/") при клике на заголовок', async () => {
    // TODO: useMock.mockReturnValue({ isMockEnabled: false, toggleMock: mockToggleMock })
    // TODO: const user = userEvent.setup()
    // TODO: render(<Header />)
    // TODO: найди заголовок через getByRole('heading')
    // TODO: await user.click(heading)
    // TODO: expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('применяет правильные CSS классы для статуса ON', () => {
    // TODO: useMock.mockReturnValue({ isMockEnabled: true, toggleMock: mockToggleMock })
    // TODO: render(<Header />)
    // TODO: найди элемент со статусом через getByText('ON')
    // TODO: проверь что у него есть класс 'statusOn' через expect(element).toHaveClass('statusOn')
  })

  it('применяет правильные CSS классы для статуса OFF', () => {
    // TODO: useMock.mockReturnValue({ isMockEnabled: false, toggleMock: mockToggleMock })
    // TODO: render(<Header />)
    // TODO: найди элемент со статусом через getByText('OFF')
    // TODO: проверь что у него есть класс 'statusOff'
  })
})
