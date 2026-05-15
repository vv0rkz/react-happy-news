import type { components } from '@shared/api/openapi'

export enum SourceName {
  Guardian = 'guardian',
  PositiveNews = 'positive-news',
  ReasonsToBeCheerful = 'reasons-to-be-cheerful',
  Upworthy = 'upworthy',
  Mongabay = 'mongabay',
  TheConversation = 'the-conversation',
  AtlasObscura = 'atlas-obscura',
  ScienceAlert = 'science-alert',
}
export const allSourceNames = Object.values(SourceName)

/** Соответствует OpenAPI `components.schemas.NewsItem` и серверному типу NewsItem */
export type NewsItem = components['schemas']['NewsItem']

/** Трансформированные данные новости (для карточек / детальной страницы) */
export type NewsDetailsData = components['schemas']['NewsItem']
