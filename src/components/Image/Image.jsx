import cls from 'classnames'
import { useState } from 'react'
import styles from './styles.module.css'

const Image = ({ image, className }) => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cls(styles.root, className)}>
      {isLoading && <div className={styles.skeleton} />}
      <img
        src={image}
        alt="news"
        onLoad={() => setIsLoading(false)}
        className={cls(styles.image, {
          [styles.hidden]: isLoading,
        })}
      />
    </div>
  )
}

export default Image
