import Skeleton from '@/components/Skeleton/Skeleton'
import { getNews } from '@api/apiNews'
import NewsBanner from '@components/NewsBanner/NewsBanner'
import { useEffect, useState } from 'react'
import NewsList from '../../components/NewsList/NewsList'
import styles from './styles.module.css'

const Main = () => {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true)
      try {
        const fetchedNews = await getNews()
        setNews(fetchedNews)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNews()
  }, [])

  return (
    <main className={styles.main}>
      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : <NewsBanner item={news[0]} />}

      {isLoading ? <Skeleton type="item" count={10} height="100px" /> : <NewsList news={news} />}
    </main>
  )
}

export default Main
