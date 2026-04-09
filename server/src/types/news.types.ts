export enum SourceName {
  Guardian = 'guardian',
  NewsApi = 'newsapi',
  HackerNews = 'hackernews',
}
export const allSourceNames = Object.values(SourceName)

export interface NewsItem {
  id: string
  title: string
  image: string
  description: string
  published: string
  author: string
  tag: string
  source: SourceName
}
