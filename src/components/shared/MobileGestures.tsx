import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export function MobileGestures({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [swipeBackProgress, setSwipeBackProgress] = useState(0)

  const touchStartRef = useRef<{ x: number; y: number; isLeftEdge: boolean; isAtTop: boolean }>({
    x: 0,
    y: 0,
    isLeftEdge: false,
    isAtTop: false
  })

  // Block accidental page refresh when offline to protect active operations
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!navigator.onLine) {
        e.preventDefault()
        e.returnValue = 'You are currently offline. Refreshing may interrupt active offline operations.'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      const isLeftEdge = touch.clientX <= 35
      const isAtTop = window.scrollY === 0

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        isLeftEdge,
        isAtTop
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      // 1. Edge Swipe Back Gesture (Swiping right from left edge)
      if (touchStartRef.current.isLeftEdge && deltaX > 0 && Math.abs(deltaY) < Math.abs(deltaX) * 0.8) {
        const progress = Math.min(100, (deltaX / 120) * 100)
        setSwipeBackProgress(progress)
      } else {
        setSwipeBackProgress(0)
      }

      // 2. Pull Downwards to Refresh Gesture (Requires strong deliberate pull at absolute top & online)
      // Disallow pull to refresh when offline
      if (!navigator.onLine) {
        setPullDistance(0)
        return
      }

      if (touchStartRef.current.isAtTop && deltaY > 80 && Math.abs(deltaX) < deltaY * 0.5 && !isRefreshing) {
        const dist = Math.min(130, (deltaY - 80) * 0.4)
        setPullDistance(dist)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      // Handle Swipe Back trigger
      if (swipeBackProgress > 60) {
        navigate(-1)
      }
      setSwipeBackProgress(0)

      // Handle Pull to Refresh trigger (Higher threshold: requires dist > 110)
      if (pullDistance > 110 && !isRefreshing && navigator.onLine) {
        setIsRefreshing(true)
        setPullDistance(70)
        setTimeout(() => {
          window.location.reload()
        }, 600)
      } else {
        if (pullDistance > 0 && !navigator.onLine) {
          toast.info('Pull-to-refresh disabled in offline mode to preserve session state.')
        }
        setPullDistance(0)
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [navigate, pullDistance, swipeBackProgress, isRefreshing])

  return (
    <div className="relative min-h-screen">
      {/* Pull to refresh visual indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 bg-[#0D4A3E] text-white px-4 py-2 rounded-full shadow-xl text-xs font-bold transition-all"
          style={{ transform: `translate(-50%, ${isRefreshing ? 16 : Math.min(40, pullDistance * 0.4)}px)` }}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
          <span>{isRefreshing ? 'Refreshing…' : pullDistance > 110 ? 'Release to refresh' : 'Pull lower to refresh'}</span>
        </div>
      )}

      {/* Swipe back visual indicator */}
      {swipeBackProgress > 0 && (
        <div
          className="fixed top-1/2 left-2 -translate-y-1/2 z-[200] flex items-center justify-center w-10 h-10 bg-[#0D4A3E] text-white rounded-full shadow-2xl transition-all"
          style={{ opacity: swipeBackProgress / 100, transform: `translateY(-50%) scale(${0.7 + (swipeBackProgress / 100) * 0.4})` }}
        >
          <ArrowLeft size={20} />
        </div>
      )}

      {children}
    </div>
  )
}
