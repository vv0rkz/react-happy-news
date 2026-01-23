import { isPositiveNews } from '@helpers/filterPositiveNews'
import axios from 'axios'
import mockNewsData from './mocks/newsData.json'
import mockNewsDetailsData from './mocks/newsDetailsData.json'

const BASE_URL = import.meta.env.VITE_NEWS_BASE_API_URL
const API_KEY = import.meta.env.VITE_NEWS_API_KEY

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const transformNewsDetailsData = (newsItem) => {
  const transformedNewsItem = {
    id: newsItem.id,
    title: newsItem.webTitle,
    image: newsItem.fields?.thumbnail || '',
    description: newsItem.fields?.trailText || '',
    published: newsItem.webPublicationDate,
    author: newsItem.fields?.byline || 'Unknown',
    tag: newsItem.sectionName,
  }
  return transformedNewsItem
}

const transformNewsData = (results) => {
  if (!results || results.length === 0) {
    console.warn('⚠️ Нет новостей для трансформации')
    return []
  }

  const allNews = results.map((newsItem) => ({
    id: newsItem.id,
    title: newsItem.webTitle,
    image: newsItem.fields?.thumbnail || '',
    description: newsItem.fields?.trailText || '',
    published: newsItem.webPublicationDate,
    author: newsItem.fields?.byline || 'Unknown',
    tag: newsItem.sectionName,
  }))

  console.log(`📰 Всего новостей до фильтра: ${allNews.length}`)

  const filteredNews = allNews.filter((news) => isPositiveNews(news.title, news.description))

  console.log(`✅ Позитивных новостей после фильтра: ${filteredNews.length}`)

  if (filteredNews.length === 0) {
    console.warn('⚠️ Фильтр убрал все новости, возвращаем первые 10 без фильтра')
    return allNews.slice(0, 10)
  }

  return filteredNews
}

export const getNews = async (useMock = false) => {
  try {
    if (useMock) {
      console.log('🔧 Используются моковые данные')
      await delay(500)

      const mockResults = mockNewsData?.response?.results
      if (!mockResults) {
        throw new Error('Mock данные повреждены')
      }

      return transformNewsData(mockResults)
    }

    console.log('🌐 Запрос к Guardian API')
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        'api-key': API_KEY,
        'show-fields': 'thumbnail,trailText,byline',
        section: 'science|environment|culture|technology|lifeandstyle',
        'page-size': 50,
      },
    })

    return transformNewsData(response.data.response.results)
  } catch (error) {
    console.error('❌ Ошибка загрузки новостей:', error.message)

    if (useMock && mockNewsData?.response?.results) {
      console.warn('⚠️ Возвращаем mock данные без фильтра из-за ошибки')
      return mockNewsData.response.results.slice(0, 10).map((item) => ({
        id: item.id,
        title: item.webTitle,
        image: item.fields?.thumbnail || '',
        description: item.fields?.trailText || '',
        published: item.webPublicationDate,
        author: item.fields?.byline || 'Unknown',
        tag: item.sectionName,
      }))
    }

    throw error
  }
}

export const getNewsDetail = async (
  id = 'science/ng-interactive/2026/jan/20/the-influencer-racing-to-save-thailands-most-endangered-sea-mammal',
  useMock = false,
) => {
  if (useMock) {
    console.log('🔧 Используются моковые данные')
    await delay(500)

    const mockResults = mockNewsDetailsData?.response?.content
    if (!mockResults) {
      throw new Error('Mock данные повреждены')
    }

    return transformNewsDetailsData(mockResults)
  }

  console.log('🌐 Запрос к Guardian API')
  const response = await axios.get(`${BASE_URL}/${id}`, {
    params: {
      'api-key': API_KEY,
      'show-fields': 'thumbnail,trailText,byline',
    },
  })

  return transformNewsDetailsData(response.data.response.content)
}
