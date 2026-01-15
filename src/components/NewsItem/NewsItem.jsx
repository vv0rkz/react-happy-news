import Image from '../Image/Image'
import styles from './styles.module.css'

const NewsItem = ({ item }) => {
  return (
    <div className={styles.item}>
      <Image image={item?.image} className={styles.image} />
      <div className={styles.info}>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.extra}>{item.description}</p>
      </div>
    </div>
  )
}

export default NewsItem
