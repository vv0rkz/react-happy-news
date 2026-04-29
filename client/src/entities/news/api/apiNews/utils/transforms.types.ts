import type { components } from '@shared/api/openapi'

// TODO: добавить тип источника — зеркало SourceName с сервера (`news.types`)

export enum SourceName {
  Guardian = 'guardian',
  NewsApi = 'newsapi',
  HackerNews = 'hackernews',
}
export const allSourceNames = Object.values(SourceName)

/** Соответствует OpenAPI `components.schemas.NewsItem` и серверному типу NewsItem */
export type NewsItem = components['schemas']['NewsItem']

/** Трансформированные данные новости (для карточек / детальной страницы) */
export type NewsDetailsData = components['schemas']['NewsItem']
