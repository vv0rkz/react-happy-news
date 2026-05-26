import { useEffect, useState } from 'react'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL

type LiveStatus = 'connecting' | 'connected' | 'error' | 'closed'

interface UseLiveReadersReturn {
  count: number
  status: LiveStatus
}

export function useLiveReaders(articleId: string): UseLiveReadersReturn {
  const [status, setStatus] = useState<LiveStatus>('connecting')
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const url = `${BASE_URL}/api/news/readers?articleId=${encodeURIComponent(articleId)}`
    const es = new EventSource(url)

    es.onopen = () => {
      setStatus('connected')
    }
    es.onmessage = (e: MessageEvent<string>) => {
      setCount((JSON.parse(e.data) as { count: number }).count)
    }
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setStatus('error')
      }
    }

    return () => {
      es.close()
      setStatus('closed')
    }
  }, [articleId])

  return { count, status }
}
