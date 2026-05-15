import type { components } from '@shared/api/openapi'

export enum SourceName {
  Guardian = 'guardian',
  Rss = 'rss',
}
export const allSourceNames = Object.values(SourceName)

/** Соответствует OpenAPI `components.schemas.NewsItem` и серверному типу NewsItem */
export type NewsItem = components['schemas']['NewsItem']

/** Трансформированные данные новости (для карточек / детальной страницы) */
export type NewsDetailsData = components['schemas']['NewsItem']
