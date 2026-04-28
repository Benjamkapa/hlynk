import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { loadGoogleIdentityScript } from '../../lib/google/identity'

interface GoogleAuthButtonProps {
  clientId?: string
  disabled?: boolean
  text?: 'continue_with' | 'signin_with' | 'signup_with'
  onCredential: (credential: string) => Promise<void> | void
}

const LABEL: Record<NonNullable<GoogleAuthButtonProps['text']>, string> = {
  continue_with: 'Continue with Google',
  signin_with: 'Sign in with Google',
  signup_with: 'Sign up with Google',
}

export default function GoogleAuthButton({
  clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID,
  disabled = false,
  text = 'signin_with',
  onCredential,
}: GoogleAuthButtonProps) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const callbackRef = useRef(onCredential)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    let cancelled = false
    let resizeObserver: ResizeObserver | null = null

    if (!clientId || !shellRef.current || !buttonRef.current) return

    const renderGoogleButton = () => {
      if (!buttonRef.current || !window.google?.accounts?.id) return

      buttonRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text,
        width: Math.max(260, Math.floor(shellRef.current?.offsetWidth ?? 320) - 32),
        logo_alignment: 'left',
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

        if (typeof ResizeObserver !== 'undefined' && shellRef.current) {
          resizeObserver = new ResizeObserver(() => renderGoogleButton())
          resizeObserver.observe(shellRef.current)
        }
      })
      .catch(() => {
        if (!cancelled) setIsReady(false)
      })

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      if (buttonRef.current) {
        buttonRef.current.innerHTML = ''
      }
    }
  }, [clientId, text])

  if (!clientId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
        Add <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        ref={shellRef}
        className={`rounded-xl border border-slate-100 bg-slate-50/90 p-4 shadow-sm shadow-slate-200/40 transition-all ${
          disabled ? 'pointer-events-none opacity-60 ' : ' hover:bg-white hover:shadow-emerald-900/5'
        }`}
      >
        <div className="mb-1 flex items-center justify-between gap-3 px-1 ">
          {isLoading && <Loader2 size={16} className="animate-spin text-emerald-600" />}
        </div>

        <div
          ref={buttonRef}
          className={`flex min-h-[44px] items-center justify-center rounded-xl bg-white/80 ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
        />
      </div>

      {!isReady && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
          <Loader2 size={16} className="animate-spin text-emerald-600" />
          Preparing Google sign-in...
        </div>
      )}
    </div>
  )
}
