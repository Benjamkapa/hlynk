import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { loadGoogleIdentityScript } from '../../lib/google/identity'

interface GoogleAuthButtonProps {
  clientId?: string
  disabled?: boolean
  className?: string
  text?: 'continue_with' | 'signin_with' | 'signup_with'
  variant?: 'default' | 'pill-right-icon'
  onCredential: (credential: string) => Promise<void> | void
}

export default function GoogleAuthButton({
  clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID,
  disabled = false,
  className = '',
  text = 'signin_with',
  variant = 'default',
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
      const btnWidth = containerRef.current.getBoundingClientRect().width || 320
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        text,
        width: btnWidth,
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

  const buttonText = isLoading ? 'Processing...' : (isOffline ? 'Offline - Check Connection' : (!isReady ? 'Connecting Google...' : (text === 'signup_with' ? 'Sign Up With Google' : 'Proceed With Google')))
  
  const iconMarkup = isLoading ? (
    <Loader2 size={18} className="animate-spin text-slate-400" />
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className={`transition-transform ${!disabled ? 'group-hover:scale-110' : ''}`}>
      <defs>
        <linearGradient id="gl-red-yellow" x1="0%" y1="0%" x2="0%" y2="70%">
          <stop offset="0%" stopColor="#EA4335" />
          <stop offset="50%" stopColor="#EA4335" />
          <stop offset="100%" stopColor="#FBBC05" />
        </linearGradient>
        <linearGradient id="gl-yellow-green" x1="0%" y1="0%" x2="0%" y2="70%">
          <stop offset="0%" stopColor="#FBBC05" />
          <stop offset="50%" stopColor="#FBBC05" />
          <stop offset="100%" stopColor="#34A853" />
        </linearGradient>
        <linearGradient id="gl-green-blue" x1="0%" y1="0%" x2="70%" y2="0%">
          <stop offset="0%" stopColor="#34A853" />
          <stop offset="50%" stopColor="#34A853" />
          <stop offset="100%" stopColor="#4285F4" />
        </linearGradient>
      </defs>
      <path fill="url(#gl-red-yellow)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      <path fill="url(#gl-yellow-green)" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="url(#gl-green-blue)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    </svg>
  )

  const isButtonDisabled = disabled || isLoading || isOffline || !isReady

  return (
    <div className={`relative w-full h-[48px] ${variant === 'pill-right-icon' ? 'rounded-full' : 'rounded-[12px]'} group select-none ${className}`}>
      {/* Custom styled UI matching the app's look and feel */}
      <div
        className={`absolute inset-0 flex items-center transition-all ${
          variant === 'default' ? 'justify-center gap-3' : 'justify-between pl-6 pr-1'
        } ${
          isButtonDisabled 
            ? 'opacity-80 bg-slate-50 shadow-lg ' 
            : `cursor-pointer ${variant === 'default' ? 'bg-[#faf8f5] shadow-lg group-hover:shadow-[0_2px_12px_rgba(122,111,90,0.1)]' : 'bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]'}`
        }`}
        style={{ borderRadius: 'inherit' }}
      >
        {variant === 'default' ? (
          <>
            {iconMarkup}
            <span className="text-[13px] font-medium tracking-[0.03em] text-[#1a1714]">
              {buttonText}
            </span>
          </>
        ) : (
          <>
            <span className="text-[14px] font-bold tracking-[0.02em] text-[#0D4A3E]">
              {buttonText}
            </span>
            <div className="w-10 h-10 rounded-full bg-slate-50 shadow-inner flex items-center justify-center group-hover:bg-white transition-colors">
              {iconMarkup}
            </div>
          </>
        )}
      </div>

      {/* Invisible Google iframe wrapper to handle real authentication clicks securely */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-auto ${isButtonDisabled ? 'hidden' : ''}`}
        style={{ opacity: 0.01 }}
        title=""
      >
        <div ref={containerRef} className="w-[120%] h-[150%] transform scale-150 flex items-center justify-center" data-auto_select="false" />
      </div>
    </div>
  )
}

