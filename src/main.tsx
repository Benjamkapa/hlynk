import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { AuthProvider } from './lib/auth/AuthContext'
import { queryClient } from './lib/query/queryClient'
import { syncEngine } from './lib/offline/syncEngine'
import './index.css'

// Start the offline sync engine
syncEngine.start()

async function clearDevServiceWorkers() {
  if (!import.meta.env.DEV || typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    const controllerActive = Boolean(navigator.serviceWorker.controller)

    await Promise.all(registrations.map((registration) => registration.unregister()))

    if ('caches' in window) {
      const cacheKeys = await caches.keys()
      await Promise.all(
        cacheKeys
          .filter((key) => key.includes('workbox') || key.includes('api-cache'))
          .map((key) => caches.delete(key)),
      )
    }

    const url = new URL(window.location.href)
    const resetParam = 'hl_dev_sw_reset'

    if (controllerActive && !url.searchParams.has(resetParam)) {
      url.searchParams.set(resetParam, '1')
      window.location.replace(url.toString())
      return
    }

    if (!controllerActive && url.searchParams.has(resetParam)) {
      url.searchParams.delete(resetParam)
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)
    }
  } catch {
    // Dev-only cleanup should never block the app from rendering.
  }
}

void clearDevServiceWorkers()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif' },
              classNames: {
                success: 'border-green-200 bg-green-50',
                error: 'border-red-200 bg-red-50',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
