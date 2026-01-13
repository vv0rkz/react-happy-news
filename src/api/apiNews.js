import axios from 'axios'
import { isPositiveNews } from '@helpers/filterPositiveNews'

const BASE_URL = import.meta.env.VITE_NEWS_BASE_API_URL
const API_KEY = import.meta.env.VITE_NEWS_API_KEY

export const getNews = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        'api-key': API_KEY,
        'show-fields': 'thumbnail,trailText,byline',
        section: 'science|environment|culture|technology|lifeandstyle',
        'page-size': 50,
      },
    })

    const allNews = response.data['response']['results'].map((newsItem) => ({
      id: newsItem.id,
      title: newsItem.webTitle,
      image: newsItem.fields.thumbnail,
      description: newsItem.fields.trailText || '',
      published: newsItem.webPublicationDate,
      author: newsItem.byline,
      tag: newsItem.sectionName,
    }))

    const positiveNews = allNews.filter((news) => isPositiveNews(news.title, news.description))

    console.log('positiveNews', positiveNews)

    return positiveNews
  } catch (error) {
    console.log(error)
  }
}
