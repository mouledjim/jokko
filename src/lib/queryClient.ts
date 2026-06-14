import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 24 * 60 * 60 * 1000, // conservé 24 h pour le cache hors-ligne persisté
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
})
