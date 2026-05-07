import type { ZodTypeAny } from 'zod'

export const ok = (description: string, schema: ZodTypeAny) => ({
  description,
  content: { 'application/json': { schema } },
})

export const err = (description: string) => ({ description })
