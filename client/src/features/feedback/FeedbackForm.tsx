import { useState } from 'react'
import { usePostFeedbackMutation } from '@entities/news/api'
import styles from './styles.module.css'

const FeedbackForm = (): React.ReactNode => {
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [postFeedback, { isLoading, isSuccess, isError }] = usePostFeedbackMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim().length < 10) return
    const trimmedEmail = email.trim()
    postFeedback({
      message: message.trim(),
      ...(trimmedEmail !== '' ? { email: trimmedEmail } : {}),
    })
  }

  if (isSuccess) {
    return <p className={styles.success}>Спасибо за отзыв!</p>
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>Обратная связь</h3>

      <textarea
        className={styles.textarea}
        placeholder="Ваш отзыв (минимум 10 символов)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        minLength={10}
      />

      <input
        type="email"
        className={styles.input}
        placeholder="Email (необязательно)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {isError && <p className={styles.error}>Ошибка отправки. Попробуйте ещё раз.</p>}

      <button
        type="submit"
        className={styles.button}
        disabled={isLoading || message.trim().length < 10}
      >
        {isLoading ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  )
}

export default FeedbackForm
