import cls from 'classnames'
import styles from './styles.module.css'

interface SkeletonProps {
  count?: number
  type?: 'banner' | 'item'
  height?: string
  width?: string
  className?: string
}

const Skeleton = ({ count = 1, type = 'banner', height, width, className }: SkeletonProps): React.ReactNode => {
  const style: Record<string, string> = {}
  if (height) style.height = height
  if (width) style.width = width

  return (
    <ul className={styles.root}>
      {[...Array(count)].map((_, index: number) => (
        <li key={index} className={cls(styles.skeleton, styles[type], className)} style={style} />
      ))}
    </ul>
  )
}

export default Skeleton
