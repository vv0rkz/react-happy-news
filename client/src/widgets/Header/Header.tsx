import { useLocalStorage } from '@shared/useLocalStorage'
import { useNavigate } from 'react-router-dom'
import styles from './styles.module.css'

const MOCK_STORAGE_KEY = 'happyNews_mockMode'

const Header = (): React.ReactNode => {
  const [isMockEnabled, setIsMockEnabled] = useLocalStorage<boolean>({ key: MOCK_STORAGE_KEY, initialValue: false })
  const navigate = useNavigate()

  const toggleMock = (): void => {
    const next = !isMockEnabled
    // Записываем в localStorage синхронно до reload, иначе useEffect не успеет сохранить
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(next))
    setIsMockEnabled(next)
    // MSW стартует/останавливается при загрузке приложения,
    // поэтому для применения переключателя делаем reload.
    window.location.reload()
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title} onClick={() => navigate('/')}>
          Happy News 🌞
        </h1>
        <button onClick={toggleMock} className={styles.toggleButton}>
          <span className={styles.icon}>{isMockEnabled ? '🔧' : '🌐'}</span>
          <span className={styles.label}>Mock</span>
          <span className={isMockEnabled ? styles.statusOn : styles.statusOff}>{isMockEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </header>
  )
}

export default Header
