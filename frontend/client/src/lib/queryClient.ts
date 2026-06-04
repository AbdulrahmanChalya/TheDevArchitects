// queryClient.ts — one React Query client for the whole app.
//
// Used by Home (destinations, recommendations) and package pages (fetchTripPackages).
// staleTime: 5 min — avoids refetching JSON on every navigation.
// retry: 1 — one retry if a fetch fails.
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})
