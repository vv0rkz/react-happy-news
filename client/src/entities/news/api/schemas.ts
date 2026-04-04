import { z } from 'zod'

/** Схема сырых данных новости от Guardian API */
export const RawNewsItemSchema = z.object({
  id: z.string(),
  webTitle: z.string(),
  webPublicationDate: z.string(),
  sectionName: z.string(),
  fields: z
    .object({
      thumbnail: z.string().optional(),
      trailText: z.string().optional(),
      byline: z.string().optional(),
    })
    .nullish(),
})

export type RawNewsItem = z.infer<typeof RawNewsItemSchema>

export const RawNewsItemArraySchema = z.array(RawNewsItemSchema)
