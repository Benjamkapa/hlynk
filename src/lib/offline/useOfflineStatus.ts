import { useState, useEffect } from 'react'
import { countPendingSales } from './db'

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check pending count periodically
    const checkPending = async () => {
      const count = await countPendingSales()
      setPendingCount(count)
    }

    checkPending()
    const interval = setInterval(checkPending, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return { isOnline, pendingCount }
}
