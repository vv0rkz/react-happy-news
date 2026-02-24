/** Пути для RTK Query запросов */
export const NEWS_API_PATHS = {
  search: '/search',
  detail: (id: string) => `/${id}`,
} as const

/**
 * URL-паттерны для MSW-хэндлеров.
 * detail использует вайлдкард (*), потому что Guardian API IDs содержат слэши:
 * например "environment/2026/jan/14/article-name"
 */
export const NEWS_MSW_PATTERNS = {
  search: '/search',
  detail: '/*',
} as const
