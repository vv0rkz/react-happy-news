import styles from './styles.module.css'

interface ErrorComponentProps {
  error: Error
  onRetry: () => void
}

function ErrorComponent({ error, onRetry }: ErrorComponentProps): React.ReactNode {
  return (
    <div className={styles.main}>
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>📡</div>
        <h2 className={styles.errorTitle}>Ошибка подключения</h2>
        <p className={styles.errorMessage}>{error.message}</p>
        <div className={styles.errorHint}>
          <p>💡 Возможные причины:</p>
          <ul>
            <li>Нет интернета</li>
            <li>CORS блокировка (используй Mock режим)</li>
            <li>API временно недоступен</li>
          </ul>
        </div>
        <button onClick={onRetry} className={styles.retryButton}>
          🔄 Попробовать снова
        </button>
      </div>
    </div>
  )
}

export default ErrorComponent
