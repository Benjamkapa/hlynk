import { useState, useEffect } from 'react'
import { countPendingSales } from './db'

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      countPendingSales().then(setPendingCount)
    }
    const handleOffline = () => {
      setIsOnline(false)
      countPendingSales().then(setPendingCount)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const interval = setInterval(() => {
      countPendingSales().then(setPendingCount)
    }, 5000)

    countPendingSales().then(setPendingCount)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return { isOnline, pendingCount, requiresAuthForSync: false }
}
