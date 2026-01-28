import cls from 'classnames'
import { useState } from 'react'
import styles from './styles.module.css'

interface ImageProps {
  image: string
  className?: string
}

export type { ImageProps }

const Image = ({ image, className }: ImageProps): React.ReactNode => {
  const [isLoading, setIsLoading] = useState<boolean>(true)

  return (
    <div className={cls(styles.root, className)}>
      {isLoading && <div className={styles.skeleton} />}
      <img
        src={image}
        alt="news"
        onLoad={(): void => setIsLoading(false)}
        className={cls(styles.image, isLoading && styles.hidden)}
      />
    </div>
  )
}

export default Image
