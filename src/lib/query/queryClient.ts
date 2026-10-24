import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,      // 2 minutes: avoids refetch storms on page navigation / route changes
      gcTime: 1000 * 60 * 20,        // 20 minutes cache retention after unmount
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
