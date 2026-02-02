import { useMock } from '@hooks/useMock'
import { useNavigate } from 'react-router-dom'
import styles from './styles.module.css'

const Header = (): React.ReactNode => {
  const { isMockEnabled, toggleMock } = useMock()
  const navigate = useNavigate()
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
