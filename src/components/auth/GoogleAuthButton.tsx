import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { loadGoogleIdentityScript } from '../../lib/google/identity'

interface GoogleAuthButtonProps {
  clientId?: string
  disabled?: boolean
  text?: 'continue_with' | 'signin_with' | 'signup_with'
  onCredential: (credential: string) => Promise<void> | void
}

export default function GoogleAuthButton({
  clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID,
  disabled = false,
  text = 'signin_with',
  onCredential,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const callbackRef = useRef(onCredential)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let resizeObserver: ResizeObserver | null = null

    if (!clientId || !containerRef.current || isOffline) return

    const renderGoogleButton = () => {
      if (!containerRef.current || !window.google?.accounts?.id || cancelled) return

      containerRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 320,
      })
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) return
            setIsLoading(true)
            try {
              await callbackRef.current(response.credential)
            } finally {
              setIsLoading(false)
            }
          },
          auto_select: false,
          ux_mode: 'popup'
        });

        renderGoogleButton()
        setIsReady(true)

        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
          resizeObserver = new ResizeObserver(() => renderGoogleButton())
          resizeObserver.observe(containerRef.current)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsReady(false)
          setIsOffline(true)
        }
      })

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [clientId, text, isOffline])

  if (!clientId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
        Add <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[48px]">
      {isLoading ? (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-[12px] h-[48px] px-6 text-sm font-medium text-slate-500 shadow-sm animate-pulse w-[320px] justify-center">
          <Loader2 size={16} className="animate-spin text-slate-400" />
          <span>Processing...</span>
        </div>
      ) : isOffline ? (
        <div className="text-xs text-red-500 font-bold uppercase tracking-wider bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 w-[320px] text-center">
          Offline - Check Connection
        </div>
      ) : !isReady ? (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-[12px] h-[48px] px-6 text-sm font-medium text-slate-400 shadow-sm animate-pulse w-[320px] justify-center">
          <Loader2 size={16} className="animate-spin text-slate-300" />
          <span>Connecting Google...</span>
        </div>
      ) : (
        <div ref={containerRef} className="w-[320px] max-w-full flex justify-center hover:opacity-95 transition-opacity" />
      )}
    </div>
  )
}

