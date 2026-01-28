import axios from 'axios'
import { z } from 'zod'
import type { RequestConfig } from '../apiConfig'
import { buildRequest, ENDPOINTS } from '../apiConfig'
import { RawNewsItemArraySchema, RawNewsItemSchema, type RawNewsItem } from '../schemas'
import { withMockAndErrorHandling } from '../utils/withMockAndErrorHandling'
import mockNewsData from './mocks/newsData.json'
import mockNewsDetailsData from './mocks/newsDetailsData.json'
import { transformNewsData, transformNewsDetailsData } from './utils/transforms'
import type { NewsDetailsData } from './utils/transforms.types'

// Утилита для выполнения axios запроса
const makeRequest = <T extends z.ZodSchema>(
  { method, url, params, dataPath }: RequestConfig,
  schema: T,
): Promise<z.infer<T>> => {
  return axios({ method, url, params }).then((response) => {
    let data = response.data
    for (const key of dataPath.split('.')) {
      data = data?.[key]
    }
    return schema.parse(data)
  })
}

class ApiNews {
  async getNews(useMock: boolean = false): Promise<NewsDetailsData[]> {
    const requestConfig = buildRequest(ENDPOINTS.SEARCH, null)

    return withMockAndErrorHandling<NewsDetailsData[], RawNewsItem[]>({
      mockFn: () => mockNewsData?.response?.results,
      requestFn: () => makeRequest(requestConfig, RawNewsItemArraySchema),
      transformFn: transformNewsData,
      useMock,
      fallbackErrorMsg: 'Ошибка загрузки новостей',
    })
  }

  async getNewsDetail(
    id: string = 'science/ng-interactive/2026/jan/20/the-influencer-racing-to-save-thailands-most-endangered-sea-mammal',
    useMock: boolean = false,
  ): Promise<NewsDetailsData> {
    const requestConfig = buildRequest(ENDPOINTS.DETAIL, id)

    return withMockAndErrorHandling<NewsDetailsData, RawNewsItem>({
      mockFn: () => mockNewsDetailsData?.response?.content,
      requestFn: () => makeRequest(requestConfig, RawNewsItemSchema),
      transformFn: transformNewsDetailsData,
      useMock,
      fallbackErrorMsg: 'Ошибка загрузки деталей новости',
    })
  }
}

export const apiNews = new ApiNews()
