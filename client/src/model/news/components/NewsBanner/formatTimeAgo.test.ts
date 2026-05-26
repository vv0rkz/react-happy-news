import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatTimeAgo } from './formatTimeAgo'

describe('formatTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-29T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('форматирует секунды (< 68s)', () => {
    const dateString = '2026-01-29T11:59:30Z'
    expect(formatTimeAgo(dateString)).toBe('30s ago')
  })

  it('форматирует минуты (< 60m)', () => {
    const dateString = '2026-01-29T11:45:00Z'
    expect(formatTimeAgo(dateString)).toBe('15m ago')
  })

  it('форматирует часы (< 24h)', () => {
    const dateString = '2026-01-29T09:00:00Z'
    expect(formatTimeAgo(dateString)).toBe('3h ago')
  })

  it('форматирует 1 день', () => {
    const dateString = '2026-01-28T12:00:00Z'
    expect(formatTimeAgo(dateString)).toBe('1 day ago')
  })

  it('форматирует несколько дней', () => {
    const dateString = '2026-01-26T12:00:00Z'
    expect(formatTimeAgo(dateString)).toBe('3 days ago')
  })
})
