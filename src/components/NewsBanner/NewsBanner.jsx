import { formatTimeAgo } from '@helpers/formatTimeAgo'
import styles from './styles.module.css'
import Image from '../Image/Image'

const NewsBanner = ({ item }) => {

  return (
    <header className={styles.header}>
      <Image image={item?.image}/>
    
      <h1 className={styles.title}>{item.title}</h1>
      <p className={styles.extra}>{formatTimeAgo(item.published)} by {item.author}</p>
    </header> 
  )

}

export default NewsBanner