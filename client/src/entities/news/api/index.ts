// Фасад для работы с API через RTK Query.
// Оставляем знакомый импорт `@api`, но под капотом уже RTK Query.

export type { NewsDetailsData } from './apiNews/utils/transforms.types'
export { useGetNewsDetailQuery, useGetNewsQuery, usePostFeedbackMutation } from './rtk/newsApi'
