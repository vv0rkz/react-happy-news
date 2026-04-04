import cls from 'classnames'
import { useEffect, useState } from 'react'
import styles from './styles.module.css'

const FALLBACK_IMAGE = '/no-photo.svg'
const LOADING_TIMEOUT = 3000

interface ImageProps {
  image: string
  className?: string
}
const Image = ({ image, className }: ImageProps): React.ReactNode => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [imgSrc, setImgSrc] = useState<string>(image || FALLBACK_IMAGE)

  useEffect(() => {
    // Если картинка не загрузилась за 3 сек - показываем fallback
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('⏱️ Превышен таймаут загрузки изображения:', image)
        setImgSrc(FALLBACK_IMAGE)
        setIsLoading(false)
      }
    }, LOADING_TIMEOUT)

    // Очищаем таймер при размонтировании или успешной загрузке
    return () => clearTimeout(timeoutId)
  }, [image, isLoading])

  const handleLoad = (): void => {
    setIsLoading(false)
  }

  const handleError = (): void => {
    console.warn('❌ Ошибка загрузки изображения:', image)
    setImgSrc(FALLBACK_IMAGE)
    setIsLoading(false)
  }

  return (
    <div className={cls(styles.root, className)}>
      {isLoading && <div data-testid="skeleton" className={styles.skeleton} />}
      <img
        data-testid="image"
        src={imgSrc}
        alt="news"
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={cls(styles.image, isLoading && styles.hidden)}
      />
    </div>
  )
}

export default Image

export type { ImageProps }
