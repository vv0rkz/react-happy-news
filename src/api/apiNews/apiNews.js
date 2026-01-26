import axios from 'axios'
import { buildRequest, ENDPOINTS } from '../apiConfig'
import { withMockAndErrorHandling } from '../utils/withMockAndErrorHandling'
import mockNewsData from './mocks/newsData.json'
import mockNewsDetailsData from './mocks/newsDetailsData.json'
import { transformNewsData, transformNewsDetailsData } from './utils/transforms'

// Утилита для выполнения axios запроса
const makeRequest = ({ method, url, params, dataPath }) => {
  return axios({
    method,
    url,
    params,
  }).then((response) => {
    // Извлечение нужной части данных из ответа по пути
    const pathParts = dataPath.split('.')
    return pathParts.reduce((data, key) => data?.[key], response)
  })
}

class ApiNews {
  async getNews(useMock = false) {
    const requestConfig = buildRequest(ENDPOINTS.SEARCH)

    return withMockAndErrorHandling({
      mockFn: () => mockNewsData?.response?.results,
      requestFn: () => makeRequest(requestConfig),
      transformFn: transformNewsData,
      useMock,
      fallbackErrorMsg: 'Ошибка загрузки новостей',
    })
  }

  async getNewsDetail(
    id = 'science/ng-interactive/2026/jan/20/the-influencer-racing-to-save-thailands-most-endangered-sea-mammal',
    useMock = false,
  ) {
    const requestConfig = buildRequest(ENDPOINTS.DETAIL, id)

    return withMockAndErrorHandling({
      mockFn: () => mockNewsDetailsData?.response?.content,
      requestFn: () => makeRequest(requestConfig),
      transformFn: transformNewsDetailsData,
      useMock,
      fallbackErrorMsg: 'Ошибка загрузки деталей новости',
    })
  }
}

export const apiNews = new ApiNews()
