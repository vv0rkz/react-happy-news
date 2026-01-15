import cls from 'classnames'
import styles from './styles.module.css'

const Skeleton = ({ count = 1, type = 'banner', height, width, className }) => {
  const style = {}
  if (height) style.height = height
  if (width) style.width = width

  return (
    <ul className={styles.root}>
      {[...Array(count)].map((_, index) => (
        <li key={index} className={cls(styles.skeleton, styles[type], className)} style={style} />
      ))}
    </ul>
  )
}

export default Skeleton
