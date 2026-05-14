import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут — данные считаются свежими
      retry: 2, // 2 попытки при ошибке
      refetchOnWindowFocus: false, // не перезапрашивать при возврате на вкладку
    },
  },
})
