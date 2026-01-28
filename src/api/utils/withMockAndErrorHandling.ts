/** Параметры для withMockAndErrorHandling */
interface WithMockAndErrorHandlingParams<T, D = unknown> {
  mockFn: () => D
  requestFn: () => Promise<D>
  transformFn: (data: D) => T
  useMock: boolean
  fallbackErrorMsg?: string
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const withMockAndErrorHandling = async <T, D = unknown>({
  mockFn,
  requestFn,
  transformFn,
  useMock,
  fallbackErrorMsg = 'Ошибка загрузки данных',
}: WithMockAndErrorHandlingParams<T, D>): Promise<T> => {
  try {
    if (useMock) {
      console.log('🔧 Используются моковые данные')
      await delay(500)

      const mockData = mockFn()
      if (!mockData) {
        throw new Error('Mock данные повреждены')
      }

      return transformFn(mockData)
    }

    console.log('🌐 Запрос к Guardian API')
    const response = await requestFn()

    return transformFn(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ ${fallbackErrorMsg}:`, errorMessage)

    if (mockFn) {
      const fallbackData = mockFn()
      if (fallbackData) {
        console.warn('⚠️ Возвращаем mock данные без фильтра из-за ошибки')
        return transformFn(fallbackData)
      }
    }

    throw error
  }
}
