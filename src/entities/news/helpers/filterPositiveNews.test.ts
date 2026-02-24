// src/helpers/filterPositiveNews.test.ts
import { describe, expect, it } from 'vitest'
import { isPositiveNews } from './filterPositiveNews'

describe('isPositiveNews', () => {
  it('пропускает позитивные новости', () => {
    expect(isPositiveNews('Amazing breakthrough in science')).toBe(true)
    expect(isPositiveNews('Volunteers rescued endangered species')).toBe(true)
  })

  it('отсекает негативные новости', () => {
    expect(isPositiveNews('Terrorist attack in city')).toBe(false)
    expect(isPositiveNews('Fire killed 10 people')).toBe(false)
  })

  it('отсекает новости с позитивными словами в негативном контексте', () => {
    expect(isPositiveNews('Rescue team failed to save victims')).toBe(false)
    expect(isPositiveNews('Award-winning journalist killed')).toBe(false)
  })

  it('требует наличие позитивных слов', () => {
    expect(isPositiveNews('The weather is nice today')).toBe(false)
  })
})
