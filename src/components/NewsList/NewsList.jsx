import styles from './styles.module.css';
import NewsItem from '../NewsItem/NewsItem';

const NewsList = ({ news }) => {
  return (
    <div className={styles.list}>
      {news.map(item=> <NewsItem key={item.id} item={item}/>)}
    </div>
  );
};
export default NewsList