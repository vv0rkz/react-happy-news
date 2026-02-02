import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatTimeAgo } from './formatTimeAgo'

describe('formatTimeAgo', () => {
  beforeEach(() => {
    // Фиксируем текущее время на 2026-01-29 12:00:00
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-29T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('форматирует секунды (< 68s)', () => {
    const dateString = '2026-01-29T11:59:30Z' // 30 секунд назад
    expect(formatTimeAgo(dateString)).toBe('30s ago')
  })

  it('форматирует минуты (< 60m)', () => {
    const dateString = '2026-01-29T11:45:00Z' // 15 минут назад
    expect(formatTimeAgo(dateString)).toBe('15m ago')
  })

  it('форматирует часы (< 24h)', () => {
    const dateString = '2026-01-29T09:00:00Z' // 3 часа назад
    expect(formatTimeAgo(dateString)).toBe('3h ago')
  })

  it('форматирует 1 день', () => {
    const dateString = '2026-01-28T12:00:00Z' // 1 день назад
    expect(formatTimeAgo(dateString)).toBe('1 day ago')
  })

  it('форматирует несколько дней', () => {
    const dateString = '2026-01-26T12:00:00Z' // 3 дня назад
    expect(formatTimeAgo(dateString)).toBe('3 days ago')
  })
})
