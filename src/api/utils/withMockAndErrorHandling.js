import { transformMockNewsData } from '../apiNews/utils/transforms'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const withMockAndErrorHandling = async ({
  mockFn,
  requestFn,
  transformFn,
  useMock,
  fallbackErrorMsg = 'Ошибка загрузки данных',
}) => {
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
    console.error(`❌ ${fallbackErrorMsg}:`, error.message)

    if (mockFn) {
      const fallbackData = mockFn()
      if (fallbackData) {
        console.warn('⚠️ Возвращаем mock данные без фильтра из-за ошибки')
        return transformMockNewsData(fallbackData)
      }
    }

    throw error
  }
}
