import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,          // 30 seconds: avoids refetch storms on window focus / route changes
      gcTime: 1000 * 60 * 10,        // 10 minutes cache retention
      retry: 1,
      refetchOnWindowFocus: false,   // Disabled globally — enable per-query only where live data is critical
      refetchIntervalInBackground: false, // Never poll when tab is hidden
      // refetchInterval: NOT set globally — apply per-query only for truly live views (e.g. notifications)
    },
    mutations: {
      retry: 0,
    },
  },
})
