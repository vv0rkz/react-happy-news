const API_KEY = import.meta.env.VITE_NEWS_API_KEY
const BASE_URL = import.meta.env.VITE_NEWS_BASE_API_URL

// Enum для endpoint'ов
export const ENDPOINTS = {
  SEARCH: 'search',
  DETAIL: 'detail',
}

const DEFAULT_PARAMS = {
  'api-key': API_KEY,
  'show-fields': 'thumbnail,trailText,byline',
}

const ENDPOINT_CONFIG = {
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
    path: (id) => `/${id}`,
    params: {},
    dataPath: 'data.response.content',
  },
}

export const API_CONFIG = {
  baseUrl: BASE_URL,
  apiKey: API_KEY,
  endpoints: ENDPOINT_CONFIG,
}

export const buildRequest = (endpoint, dynamicId = null) => {
  const config = API_CONFIG.endpoints[endpoint]
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
