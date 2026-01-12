import { formatTimeAgo } from '../../helpers/formatTimeAgo'
import styles from './styles.module.css'

const NewsBanner = ({ item }) => {

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{item.title}</h1>
      <p className={styles.extra}>{formatTimeAgo(item.published)} by {item.author}</p>
    </header> 
  )

}

export default NewsBanner