// src/components/Header/Header.jsx
import { useMock } from '@context/MockContext'
import styles from './styles.module.css'

const Header = () => {
  const { isMockEnabled, toggleMock } = useMock()

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>Happy News 🌞</h1>
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
