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
          ux_mode: 'popup',
        })

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

  const isButtonDisabled = disabled || isLoading || isOffline || !isReady

  return (
    <div className="relative w-full h-[56px] rounded-xl overflow-hidden shadow-sm group select-none">
      {/* Custom styled UI matching the app's look and feel */}
      <div
        className={`absolute inset-0 flex items-center justify-center gap-3 border-2 border-slate-100 bg-white hover:bg-slate-50 transition-all text-slate-700
          ${isButtonDisabled ? 'opacity-60 bg-slate-50' : 'cursor-pointer'}
        `}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin text-slate-400" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className={`transition-transform ${!isButtonDisabled ? 'group-hover:scale-110' : ''}`}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        <span className="font-black text-[15px] font-thin tracking-[0.15em] mt-0.5">
          {isLoading ? 'Processing...' : (isOffline ? 'Offline - Check Connection' : (!isReady ? 'Connecting Google...' : (text === 'signup_with' ? 'Sign Up With Google' : 'Sign In With Google')))}
        </span>
      </div>

      {/* Invisible Google iframe wrapper to handle real authentication clicks securely */}
      <div 
        className={`absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-auto ${isButtonDisabled ? 'hidden' : ''}`}
        style={{ opacity: 0.001 }}
        title=""
      >
        <div ref={containerRef} className="w-[120%] h-[150%] transform scale-150 flex items-center justify-center" />
      </div>
    </div>
  )
}

