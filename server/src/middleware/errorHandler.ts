import type { ErrorRequestHandler } from 'express'

// Global error handler — ловит всё, что попало в next(err) или выброшено в async-роуте
// ⚠️  Сигнатура ОБЯЗАТЕЛЬНО 4 аргумента: (err, req, res, next)
//     Если написать 3 — Express не распознает как error handler, просто проигнорирует
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[Unhandled Error]', err)

  const isProd = process.env.NODE_ENV === 'production'
  const message = err instanceof Error ? err.message : String(err)

  if (isProd) {
    res.status(500).json({ error: 'Internal Server Error' })
  } else {
    res.status(500).json({ error: 'Internal Server Error', message })
  }
}
