import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { AuthProvider } from './lib/auth/AuthContext'
import { MobileViewportProvider } from './lib/MobileViewportContext'
import { queryClient } from './lib/query/queryClient'
import { syncEngine } from './lib/offline/syncEngine'
import './index.css'

// Start the offline sync engine
syncEngine.start()

async function clearDevCaches() {
  if (!import.meta.env.DEV || typeof window === 'undefined' || !('caches' in window)) return
  try {
    const cacheKeys = await caches.keys()
    await Promise.all(
      cacheKeys
        .filter((key) => key.includes('workbox') || key.includes('api-cache'))
        .map((key) => caches.delete(key)),
    )
  } catch {
    // Never block the app from rendering
  }
}

void clearDevCaches()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <MobileViewportProvider>
            <App />
          </MobileViewportProvider>
          <Toaster
            position="top-center"
            closeButton
            richColors
            expand={false}
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif' },
              classNames: {
                toast: 'bg-white/95 backdrop-blur-md border-gray-100 shadow-2xl rounded-2xl',
                success: 'border-green-200 bg-green-50 text-green-900',
                error: 'border-red-200 bg-red-50 text-red-900',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
