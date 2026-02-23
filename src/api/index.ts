// Фасад для работы с API через RTK Query.
// Оставляем знакомый импорт `@api`, но под капотом уже RTK Query.

export type { NewsDetailsData } from '@/api/apiNews/utils/transforms.types'
export {
  useGetNewsQuery,
  useGetNewsDetailQuery,
} from '@/api/rtk/newsApi'
