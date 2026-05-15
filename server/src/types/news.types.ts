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

export interface NewsItem {
  id: string
  title: string
  image: string
  description: string
  published: string
  author: string
  tag: string
  source: SourceName
  url: string
  body?: string | null
  hasFullContent: boolean
}
