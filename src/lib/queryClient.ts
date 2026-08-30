import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 24 * 60 * 60 * 1000, // conservé 24 h pour le cache hors-ligne persisté
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
