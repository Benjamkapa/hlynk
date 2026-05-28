import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, PackageSearch, Receipt, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { FadeUp } from './Animations'
import { motion, AnimatePresence } from 'framer-motion'

function GoogleG({ disabled = false }: { disabled?: boolean }) {
  return (
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
}

function MockCursorAnimation() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % 4), 3000)
    return () => clearInterval(timer)
  }, [])

  // Positions relative to the content pane (flex-1 after sidebar).
  // Row 1  y≈13%  header: KES left | "+ New Sale" right  → x≈84%
  // Row 2  y≈50%  two equal cards: card1 x≈27% card2 x≈73%
  // Row 3  y≈86%  bottom panel, full-width green bar     → x≈50%
  const positions = [
    { left: '84%', top: '13%' }, // → "+ New Sale" button
    { left: '27%', top: '50%' }, // → Product card 1 (cube)
    { left: '73%', top: '50%' }, // → Product card 2 (chart)
    { left: '50%', top: '86%' }, // → "Sale Recorded" green bar
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden font-ubuntu">
      {/* Moving Cursor */}
      <motion.div
        className="absolute z-50"
        animate={positions[step]}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ translateX: '-50%', translateY: '-50%' }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M1 1L8.5 19L11.5 11.5L19 8.5L1 1Z"
            fill="#0f172a" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        {step === 3 && (
          <motion.span
            style={{ position: 'absolute', inset: -6, borderRadius: '50%', background: 'rgba(16,185,129,0.35)' }}
            initial={{ scale: 0.4, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.div>

      {/* Mock Content */}
      <div style={{
        padding: 'clamp(14px, 3vw, 32px)',
        display: 'flex', flexDirection: 'column',
        gap: 'clamp(8px, 1.5vw, 20px)',
        height: '100%',
      }}>

        {/* Row 1 — header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ height: 6, width: 36, background: '#e2e8f0', borderRadius: 4 }} />
            <p style={{
              margin: 0,
              fontSize: 'clamp(0.8rem, 2vw, 1.15rem)',
              fontWeight: 900, color: '#0f172a',
              fontFamily: 'monospace', letterSpacing: '-0.02em',
            }}>
              KES 12,450
            </p>
          </div>

          <motion.div
            animate={{
              scale: step === 0 ? 1.06 : 1,
              backgroundColor: step === 0 ? 'rgba(16,185,129,0.14)' : 'rgba(255,255,255,0.75)',
              borderColor: step === 0 ? 'rgba(16,185,129,0.55)' : 'rgba(16,185,129,0.25)',
            }}
            transition={{ duration: 0.3 }}
            style={{
              padding: '5px 10px', borderRadius: 7, border: '1px solid',
              fontSize: 'clamp(0.48rem, 1vw, 0.62rem)',
              fontWeight: 900, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#059669', whiteSpace: 'nowrap',
            }}
          >
            + New Sale
          </motion.div>
        </div>

        {/* Row 2 — product cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(6px, 1vw, 14px)' }}>
          {[1, 2].map(i => (
            <motion.div
              key={i}
              animate={{
                borderColor: (step === 1 && i === 1) || (step === 2 && i === 2)
                  ? 'rgba(16,185,129,0.55)' : 'rgba(255,255,255,0.45)',
                scale: (step === 1 && i === 1) || (step === 2 && i === 2) ? 1.02 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'rgba(255,255,255,0.65)',
                borderRadius: 10, border: '1px solid',
                padding: 'clamp(10px, 2vw, 22px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
            >
              <div style={{
                width: 'clamp(24px, 3vw, 40px)', height: 'clamp(24px, 3vw, 40px)',
                borderRadius: 8, background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
              }}>
                {i === 1 ? <PackageSearch size={14} /> : <TrendingUp size={14} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ height: 6, width: 50, background: '#e2e8f0', borderRadius: 3 }} />
                <div style={{ height: 9, width: 34, background: 'rgba(15,23,42,0.08)', borderRadius: 3 }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Row 3 — bottom panel */}
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.65)', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.45)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: 'clamp(10px, 2vw, 18px)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ height: 8, width: 68, background: 'rgba(15,23,42,0.05)', borderRadius: 3 }} />
            <div style={{ height: 8, width: 38, background: 'rgba(16,185,129,0.18)', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, background: '#f1f5f9', borderRadius: 5 }} />
                  <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3 }} />
                </div>
                <div style={{ width: 26, height: 6, background: 'rgba(15,23,42,0.08)', borderRadius: 3 }} />
              </div>
            ))}
          </div>

          <AnimatePresence>
            {step === 3 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute', left: 8, right: 8, bottom: 8,
                  padding: '11px 8px',
                  background: '#059669', borderRadius: 8,
                  fontSize: 'clamp(0.48rem, 1vw, 0.6rem)',
                  fontWeight: 900, letterSpacing: '0.12em',
                  textTransform: 'uppercase', textAlign: 'center',
                  color: '#fff', boxShadow: '0 8px 24px rgba(5,150,105,0.35)',
                }}
              >
                Sale Recorded! + KES 450 Profit
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section style={{
      position: 'relative', minHeight: '85svh',
      display: 'flex', alignItems: 'center',
      paddingTop: 'clamp(80px, 10vw, 120px)',
      paddingBottom: 'clamp(40px, 5vw, 60px)',
      overflow: 'hidden',
    }}>

      {/* Background image — darkened for better visibility */}
      <img
        src="/img.png" alt=""
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)', zIndex: 0, pointerEvents: 'none' }}
      />

      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 clamp(20px, 5vw, 64px)',
        position: 'relative', zIndex: 20, width: '100%',
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 'clamp(40px, 6vw, 96px)' }}
          className="flex-col lg:flex-row"
        >

          {/* ── LEFT — copy ── */}
          <div style={{
            flex: 1, maxWidth: 580, width: '100%',
            display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.5vw, 32px)',
          }}>

            <FadeUp delay={0.1}>
              <h1 style={{
                fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)',
                fontWeight: 900, color: '#f8fafca8',
                letterSpacing: '-0.03em', lineHeight: 0.95,
                fontFamily: "'Ubuntu', sans-serif", margin: 0,
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              }}>
                Run your business.<br />
                <span style={{ color: '#156f5dff' }}>Know your profit.</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              {/* Dark green pill — matches the original aesthetic exactly */}
              <p style={{
                fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
                fontWeight: 500, lineHeight: 1.7,
                color: '#f1fdf9', fontStyle: 'italic',
                background: '#0D4A3E',
                padding: 'clamp(10px, 1.5vw, 14px) clamp(14px, 2vw, 18px)',
                borderRadius: 8,
                maxWidth: 480, margin: 0,
                boxShadow: '0 4px 20px #0d4a3e66',
              }}>
                Stop guessing your numbers. hlynk is the simple, powerful management portal that helps you
                track sales, inventory, and real-time profit in one place.
              </p>
            </FadeUp>

            {/* <FadeUp delay={0.25}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ecfdf5',
                maxWidth: 460,
              }}>
                <span style={{
                  width: 34,
                  height: 34,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 9999,
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
                  flexShrink: 0,
                }}>
                  <GoogleG />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.66)' }}>
                    Fast Access
                  </span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4 }}>
                    Sign in with Google in seconds, or continue with phone if you prefer.
                  </span>
                </div>
              </div>
            </FadeUp> */}

            <FadeUp delay={0.3}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: 'clamp(12px, 1.5vw, 16px) clamp(22px, 2.5vw, 36px)',
                    borderRadius: 14, background: '#0D4A3E', color: '#fff',
                    fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)',
                    fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
                    textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(13,74,62,0.35)',
                    whiteSpace: 'nowrap',
                  }}
                  className="hover:bg-[#064E3B] transition-all group"
                >
                  Start Free Trial
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: 'clamp(12px, 1.5vw, 16px) clamp(18px, 2vw, 28px)',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    color: '#fff',
                    fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)',
                    fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                  className="hover:bg-white/25 transition-all"
                >
                  <GoogleG />
                  Sign In With Google
                </Link>

                {/* <a
                  href="#how"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: 'clamp(12px, 1.5vw, 16px) clamp(18px, 2vw, 28px)',
                    borderRadius: 14,
                    color: '#d1fae5',
                    fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)',
                    fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                  className="hover:text-white transition-all"
                >
                  See The Journey
                </a> */}
              </div>
            </FadeUp>

            {/* Trust badges */}
            <FadeUp delay={0.4}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px' }}>
                {['Google sign-in ready', 'No credit card', 'Cancel anytime'].map(t => (
                  <span key={t} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="6.5" cy="6.5" r="6.5" fill="rgba(16,185,129,0.25)" />
                      <path d="M3.5 6.5l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </FadeUp>

          </div>

          {/* ── RIGHT — dashboard mockup ── */}
          <FadeUp delay={0.5} style={{ flex: 1, width: '100%', maxWidth: 540, position: 'relative' }}>
            {/* Ambient glow behind card */}
            <div style={{
              position: 'absolute', inset: '-40px',
              background: 'radial-gradient(ellipse at 50% 55%, rgba(16,185,129,0.1) 0%, transparent 70%)',
              filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0,
            }} />

            {/* The browser card */}
            <div style={{
              position: 'relative', zIndex: 1,
              background: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)',
              borderRadius: 20, border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}>

              {/* Browser chrome */}
              <div style={{
                background: 'rgba(255,255,255,0.65)',
                padding: '10px 18px',
                display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: '1px solid rgba(255,255,255,0.3)',
              }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#fc5753', '#fdbc40', '#33c748'].map(c => (
                    <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.8 }} />
                  ))}
                </div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.18em', color: '#94a3b8', fontFamily: 'monospace' }}>
                  portal.hlynk.co.ke
                </div>
              </div>

              {/* App body */}
              <div style={{ display: 'flex', height: 'clamp(300px, 40vw, 450px)' }}>

                {/* Mini sidebar — all sizes scale via clamp */}
                <div style={{
                  width: 'clamp(40px, 5vw, 72px)',
                  background: 'rgba(255,255,255,0.4)',
                  borderRight: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: 'clamp(10px, 1.5vw, 24px) 0',
                  gap: 'clamp(10px, 1.5vw, 32px)',
                  flexShrink: 0,
                }}>
                  <img src="/fav.png" alt="" style={{ width: 'clamp(14px, 2vw, 24px)', height: 'clamp(14px, 2vw, 24px)', opacity: 0.4 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1vw, 16px)' }}>
                    {[LayoutDashboard, PackageSearch, Receipt, Users].map((Icon, i) => (
                      <div key={i} style={{
                        width: 'clamp(28px, 3vw, 40px)', height: 'clamp(28px, 3vw, 40px)',
                        borderRadius: 9,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: i === 0 ? 'rgba(16,185,129,0.1)' : 'transparent',
                        color: i === 0 ? '#059669' : '#94a3b8',
                      }}>
                        <Icon size={16} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content pane — cursor positions are relative to THIS div */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
                  <MockCursorAnimation />
                </div>

              </div>
            </div>
          </FadeUp>

        </div>
      </div>
    </section>
  )
}
