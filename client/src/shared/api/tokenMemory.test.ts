import { beforeEach, describe, expect, it } from 'vitest'
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenMemory'

describe('tokenMemory', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('set/get/clear access token', () => {
    expect(getAccessToken()).toBeNull()

    setAccessToken('x')
    expect(getAccessToken()).toBe('x')

    clearAccessToken()
    expect(getAccessToken()).toBeNull()
  })
})
