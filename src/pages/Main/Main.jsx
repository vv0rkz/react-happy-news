// src/pages/Main/Main.jsx
import Skeleton from '@/components/Skeleton/Skeleton'
import { getNews } from '@api/apiNews'
import NewsBanner from '@components/NewsBanner/NewsBanner'
import NewsList from '@components/NewsList/NewsList'
import { useMock } from '@context/MockContext'
import { useEffect, useState } from 'react'
import styles from './styles.module.css'

const Main = () => {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isMockEnabled } = useMock()

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const fetchedNews = await getNews(isMockEnabled)

        if (!fetchedNews || fetchedNews.length === 0) {
          throw new Error('Новости не загружены')
        }

        setNews(fetchedNews)
      } catch (err) {
        console.error('❌ Ошибка загрузки:', err)
        setError({
          message: err.message || 'Не удалось загрузить новости',
          type: err.response?.status === 401 ? 'auth' : 'network',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [isMockEnabled])

  // Компонент ошибки
  if (error && !isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>{error.type === 'auth' ? '🔐' : '📡'}</div>
          <h2 className={styles.errorTitle}>
            {error.type === 'auth' ? 'Проблема с API ключом' : 'Ошибка подключения'}
          </h2>
          <p className={styles.errorMessage}>{error.message}</p>

          {error.type === 'auth' ? (
            <div className={styles.errorHint}>
              <p>
                💡 Проверь переменную <code>VITE_NEWS_API_KEY</code> в <code>.env</code>
              </p>
              <p>Или включи Mock режим для тестирования</p>
            </div>
          ) : (
            <div className={styles.errorHint}>
              <p>💡 Возможные причины:</p>
              <ul>
                <li>Нет интернета</li>
                <li>CORS блокировка (используй Mock режим)</li>
                <li>API временно недоступен</li>
              </ul>
            </div>
          )}

          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            🔄 Попробовать снова
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : news[0] && <NewsBanner item={news[0]} />}

      {isLoading ? <Skeleton type="item" count={10} height="100px" /> : <NewsList news={news} />}
    </main>
  )
}

export default Main
