import { useState, useEffect, useRef } from 'react'
import { FadeUp } from './Animations'
import { Download, Smartphone, Share, Plus } from 'lucide-react'

// ─── Platform SVG Icons ───────────────────────────────────────────────────────

function AppleIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 814 1000"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.1 269-317.1 70.6 0 129.5 46.4 173.1 46.4 42.8 0 109.6-49.1 192.5-49.1 30.8 0 108.2 2.6 175.6 80.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  )
}

function AndroidIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.2 16.7C12.2 16.7 11.3 16.7 10.7 17.3 10.1 17.9 10.1 18.8 10.1 18.8L10.1 29.9C10.1 29.9 10.1 30.8 10.7 31.4 11.3 32 12.2 32 12.2 32 12.2 32 13.1 32 13.7 31.4 14.3 30.8 14.3 29.9 14.3 29.9L14.3 18.8C14.3 18.8 14.3 17.9 13.7 17.3 13.1 16.7 12.2 16.7ZM35.8 16.7C35.8 16.7 34.9 16.7 34.3 17.3 33.7 17.9 33.7 18.8 33.7 18.8L33.7 29.9C33.7 29.9 33.7 30.8 34.3 31.4 34.9 32 35.8 32 35.8 32 35.8 32 36.7 32 37.3 31.4 37.9 30.8 37.9 29.9 37.9 29.9L37.9 18.8C37.9 18.8 37.9 17.9 37.3 17.3 36.7 16.7 35.8 16.7ZM30.6 8.1L32.9 4C33.1 3.6 33 3.2 32.6 3 32.2 2.8 31.8 2.9 31.6 3.3L29.2 7.4C27.6 6.8 25.8 6.4 24 6.4 22.2 6.4 20.4 6.8 18.8 7.4L16.4 3.3C16.2 2.9 15.8 2.8 15.4 3 15 3.2 14.9 3.6 15.1 4L17.4 8.1C13.6 10.2 11 14 11 18.4L37 18.4C37 14 34.4 10.2 30.6 8.1ZM19.5 14.5C18.7 14.5 18 13.8 18 13 18 12.2 18.7 11.5 19.5 11.5 20.3 11.5 21 12.2 21 13 21 13.8 20.3 14.5 19.5 14.5ZM28.5 14.5C27.7 14.5 27 13.8 27 13 27 12.2 27.7 11.5 28.5 11.5 29.3 11.5 30 12.2 30 13 30 13.8 29.3 14.5 28.5 14.5ZM11 20L11 36C11 37.1 11.9 38 13 38L15 38 15 44C15 44 15 44.9 15.6 45.5 16.2 46.1 17.1 46.1 17.1 46.1 17.1 46.1 18 46.1 18.6 45.5 19.2 44.9 19.2 44 19.2 44L19.2 38 28.8 38 28.8 44C28.8 44 28.8 44.9 29.4 45.5 30 46.1 30.9 46.1 30.9 46.1 30.9 46.1 31.8 46.1 32.4 45.5 33 44.9 33 44 33 44L33 38 35 38C36.1 38 37 37.1 37 36L37 20 11 20Z" />
    </svg>
  )
}

// ─── iOS Share Tip tooltip ────────────────────────────────────────────────────

function IosTip({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 14px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1e293b',
        color: '#fff',
        borderRadius: '16px',
        padding: '18px 22px',
        width: '300px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.30)',
        zIndex: 50,
        animation: 'fadeInUp 0.25s ease',
      }}
    >
      {/* Arrow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderTop: '9px solid #1e293b',
        }}
      />

      <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
        Safari on iPhone / iPad
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Step icon={<Share size={15} />} text='Open this page in Safari' />
        <Step icon={<Share size={15} />} text='Tap the Share icon (bottom bar)' />
        <Step icon={<Plus size={15} />} text='"Add to Home Screen" → Add' />
      </div>
    </div>
  )
}

function Step({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px',
        background: 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: '#e2e8f0',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4 }}>{text}</span>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function GetTheApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [androidInstalled, setAndroidInstalled] = useState(false)
  const [showIosTip, setShowIosTip] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Already installed
    window.addEventListener('appinstalled', () => {
      setAndroidInstalled(true)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setAndroidInstalled(true)
      setDeferredPrompt(null)
    }
  }

  return (
    <>
      {/* keyframe for tooltip */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
        }
      `}</style>

      <section
        id="get-the-app"
        className="py-24 relative overflow-hidden border-t border-slate-200"
        style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}
      >
        {/* Ambient glow blobs */}
        <div aria-hidden style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', bottom: '-80px', right: '-60px',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div className="max-w-3xl mx-auto px-6 md:px-12 relative z-10">

          {/* Header */}
          <FadeUp delay={0.05}>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: 'rgba(16,185,129,0.10)', color: '#059669' }}>
                <Smartphone size={13} />
                Mobile App
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-5 font-ubuntu">
                Get hlynk on your&nbsp;phone
              </h2>
              <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                Install hlynk directly from your browser — no App Store, no Play Store.
                Works offline and loads instantly.
              </p>
            </div>
          </FadeUp>

          {/* Install Buttons */}
          <FadeUp delay={0.12}>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">

              {/* ── Android button ── */}
              <div style={{ position: 'relative' }}>
                <button
                  id="pwa-install-android"
                  onClick={handleAndroidInstall}
                  disabled={!deferredPrompt || androidInstalled}
                  className="group flex items-center gap-4 px-8 py-5 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400"
                  style={{
                    background: androidInstalled
                      ? '#e2e8f0'
                      : deferredPrompt
                        ? 'linear-gradient(135deg, #059669, #10b981)'
                        : 'linear-gradient(135deg, #334155, #475569)',
                    color: '#ffffff',
                    boxShadow: deferredPrompt && !androidInstalled
                      ? '0 8px 32px rgba(16,185,129,0.35), 0 2px 8px rgba(0,0,0,0.08)'
                      : '0 4px 16px rgba(0,0,0,0.10)',
                    cursor: deferredPrompt && !androidInstalled ? 'pointer' : 'default',
                    minWidth: '230px',
                    transform: 'translateY(0)',
                    transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                  onMouseEnter={e => {
                    if (deferredPrompt && !androidInstalled)
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.02)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'
                  }}
                >
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {androidInstalled
                      ? <Download size={22} />
                      : <AndroidIcon size={24} />
                    }
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                      {androidInstalled ? 'Already installed' : deferredPrompt ? 'Tap to install' : 'Open in Chrome'}
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                      Android
                    </div>
                  </div>
                </button>
              </div>

              {/* ── iOS button ── */}
              <div style={{ position: 'relative' }}>
                <button
                  id="pwa-install-ios"
                  onClick={() => setShowIosTip(v => !v)}
                  className="group flex items-center gap-4 px-8 py-5 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                  style={{
                    background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                    color: '#ffffff',
                    boxShadow: '0 8px 32px rgba(99,102,241,0.30), 0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    minWidth: '230px',
                    transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.02)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'
                  }}
                >
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <AppleIcon size={24} />
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                      iPhone &amp; iPad
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                      iOS / Safari
                    </div>
                  </div>
                </button>

                {showIosTip && <IosTip onClose={() => setShowIosTip(false)} />}
              </div>
            </div>
          </FadeUp>

          {/* Bottom note */}
          <FadeUp delay={0.18}>
            <p className="text-center text-xs text-slate-400 font-medium mt-10">
              hlynk is a{' '}
              <span className="font-bold text-slate-500">Progressive Web App</span>
              {' '}— works offline, loads fast, updates automatically. Free forever.
            </p>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
