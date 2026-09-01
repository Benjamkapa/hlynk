import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 2,           // 2 seconds: consider stale quickly so UI revalidates seamlessly
      gcTime: 1000 * 60 * 10,        // 10 minutes cache retention
      retry: 1,
      refetchOnWindowFocus: true,    // Instantly refetch active queries when window/tab gains focus
      refetchInterval: 8000,         // Auto-refresh active view data every 8 seconds for live real-time updates
      refetchIntervalInBackground: false, // Save bandwidth when tab is hidden, but refetch immediately on tab focus
    },
    mutations: {
      retry: 0,
    },
  },
})
