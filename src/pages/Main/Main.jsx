import { useEffect, useState } from 'react';
import styles from './styles.module.css';
import NewsBanner from '@components/NewsBanner/NewsBanner';
import { getNews } from '@api/apiNews';
import NewsList from '@/components/NewsList/NewsList';

const Main = () => {

  const [news, setNews] = useState([])

  useEffect(()=>{
    const fetchNews = async () => {
      try {
        const fetchedNews = await getNews()
        setNews(fetchedNews)  
        
      } catch (error) {
        setNews(error)
      }
    }
    fetchNews()
  }, [])
  
  return (
    <main className={styles.header}>
      {news?.length > 0 && <NewsBanner item={news[0]}/>} 

      <NewsList news={news}/>
    </main>
  );
};
export default Main