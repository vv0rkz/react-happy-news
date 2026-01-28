import { isPositiveNews } from '@helpers/filterPositiveNews'
import type { RawNewsItem } from '../../schemas'
import type { NewsDetailsData } from './transforms.types'

export const transformNewsDetailsData = (newsItem: RawNewsItem): NewsDetailsData => {
  return {
    id: newsItem.id,
    title: newsItem.webTitle,
    image: newsItem.fields?.thumbnail || '',
    description: newsItem.fields?.trailText || '',
    published: newsItem.webPublicationDate,
    author: newsItem.fields?.byline || 'Unknown',
    tag: newsItem.sectionName,
  }
}

export const transformNewsData = (results: RawNewsItem[]): NewsDetailsData[] => {
  if (!results || results.length === 0) {
    console.warn('⚠️ Нет новостей для трансформации')
    return []
  }

  const allNews = results.map(transformNewsDetailsData)

  console.log(`📰 Всего новостей до фильтра: ${allNews.length}`)

  const filteredNews = allNews.filter((news) => isPositiveNews(news.title, news.description))

  console.log(`✅ Позитивных новостей после фильтра: ${filteredNews.length}`)

  if (filteredNews.length === 0) {
    console.warn('⚠️ Фильтр убрал все новости, возвращаем первые 10 без фильтра')
    return allNews.slice(0, 10)
  }

  return filteredNews
}

export const transformMockNewsData = (results: RawNewsItem[]): NewsDetailsData[] => {
  if (!results || results.length === 0) return []

  return results.slice(0, 10).map(transformNewsDetailsData)
}
