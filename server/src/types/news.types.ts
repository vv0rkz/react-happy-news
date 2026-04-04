export interface NewsItem {
  id: string
  title: string
  image: string
  description: string
  published: string
  author: string
  tag: string
  source: 'guardian' | 'newsapi' | 'hackernews'
}
