/// <reference types="vite/client" />

/** Доступные API endpoints */
export enum ENDPOINTS {
  SEARCH = 'search',
  DETAIL = 'detail',
}

/** Конфигурация одного endpoint'а */
interface EndpointConfig {
  method: string
  path: string | ((id: string | null) => string)
  params: Record<string, string | number>
  dataPath: string
}

/** Конфигурация HTTP запроса */
export interface RequestConfig {
  method: string
  url: string
  params: Record<string, string | number>
  dataPath: string
}

const API_KEY: string = import.meta.env.VITE_NEWS_API_KEY
const BASE_URL: string = import.meta.env.VITE_NEWS_BASE_API_URL

const DEFAULT_PARAMS = {
  'api-key': API_KEY,
  'show-fields': 'thumbnail,trailText,byline',
}

const ENDPOINT_CONFIG: Record<ENDPOINTS, EndpointConfig> = {
  [ENDPOINTS.SEARCH]: {
    method: 'GET',
    path: '/search',
    params: {
      section: 'science|environment|culture|technology|lifeandstyle',
      'page-size': 50,
    },
    dataPath: 'data.response.results',
  },
  [ENDPOINTS.DETAIL]: {
    method: 'GET',
    path: (id: string | null) => `/${id}`,
    params: {},
    dataPath: 'data.response.content',
  },
}

export const API_CONFIG = {
  baseUrl: BASE_URL,
  apiKey: API_KEY,
  endpoints: ENDPOINT_CONFIG,
}

export const buildRequest = (endpoint: ENDPOINTS, dynamicId: string | null = null): RequestConfig => {
  const config = ENDPOINT_CONFIG[endpoint]
  const path = typeof config.path === 'function' ? config.path(dynamicId) : config.path

  return {
    method: config.method,
    url: `${API_CONFIG.baseUrl}${path}`,
    params: {
      ...DEFAULT_PARAMS,
      ...config.params,
    },
    dataPath: config.dataPath,
  }
}
