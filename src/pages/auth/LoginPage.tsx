import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, MapPin, Phone, Tag, User, Loader2, Check, ShieldCheck, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '../../lib/api/auth'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'
import { providersApi } from '../../lib/api/providers'

const logo = '/logo.png'

// ─── Other constants ──────────────────────────────────────────────────────────

const COUNTIES = [
  'Nairobi','Mombasa','Kwale','Kilifi','Tana River','Lamu','Taita/Taveta','Garissa',
  'Wajir','Mandera','Marsabit','Isiolo','Meru','Tharaka-Nithi','Embu','Kitui',
  'Machakos','Makueni','Nyandarua','Nyeri','Kirinyaga',"Murang'a",'Kiambu','Turkana',
  'West Pokot','Samburu','Trans Nzoia','Uasin Gishu','Elgeyo/Marakwet','Nandi','Baringo',
  'Laikipia','Nakuru','Narok','Kajiado','Kericho','Bomet','Kakamega','Vihiga','Bungoma',
  'Busia','Siaya','Kisumu','Homa Bay','Migori','Kisii','Nyamira',
]

const CATEGORIES = [
  'Retail Store','Barber & Salon','Cleaning Services','Plumbing',
  'Electrical','Mechanic','Consultancy','Other',
]

type RegisterFormState = {
  businessName: string; ownerName: string; phone: string
  category: string; county: string; location: string; planName: 'STARTER'
}

// ─── Star icon ────────────────────────────────────────────────────────────────

function StarIcon({ filled, size = 10 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill={filled ? '#0D4A3E' : '#e2e8f0'}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

// ─── Single review card ───────────────────────────────────────────────────────

function ReviewCard({ review }: { review: any }) {
  const bgColors = ['#E1F5EE', '#EEEDFE', '#FAEEDA', '#FAECE7']
  const tcColors = ['#085041', '#3C3489', '#633806', '#712B13']
  const colorIndex = (review.id?.charCodeAt(0) || 0) % bgColors.length
  const initials = review.ownerName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'P'

  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(15,23,42,0.08)',
      borderRadius: 12,
      padding: '16px 14px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: bgColors[colorIndex], color: tcColors[colorIndex],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, flexShrink: 0,
          letterSpacing: '-0.02em',
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>{review.ownerName}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{review.businessName}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 1 }}>
        {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < review.rating} size={12} />)}
      </div>
      <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, fontStyle: 'italic' }}>"{review.reviewText}"</div>
    </div>
  )
}

// a gradient color fady background on the bottom right corer from the center
function GradientBackground() {
  const gradientBackgroundStyle = `
    linear-gradient(
      135deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.5) 50%,
      rgba(255,255,255,0) 100%
    )
  `;
  return (
    <div style={{
      background: gradientBackgroundStyle,
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 300,
      zIndex: 10,
      pointerEvents: 'none',
    }}></div>
  )
}

// ─── Review panel (animated, floating bottom-right) ───────────────────────────

type AnimPhase = 'entering' | 'visible' | 'exiting'

function ReviewPanel() {
  const [reviews, setReviews] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const [phase, setPhase] = useState<AnimPhase>('visible')
  const pausedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    providersApi.getReviews().then(res => {
      if (res.data && res.data.length > 0) {
        setReviews(res.data)
      }
    }).catch(console.error)
  }, [])

  const advance = (to?: number) => {
    if (reviews.length <= 1) return
    setPhase('exiting')
    setTimeout(() => {
      const next = to !== undefined ? to : (currentIndex + 1) % reviews.length
      setDisplayedIndex(next)
      setCurrentIndex(next)
      setPhase('entering')
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('visible')))
    }, 400)
  }

  const goTo = (idx: number) => {
    if (idx === currentIndex || phase !== 'visible') return
    advance(idx)
  }

  useEffect(() => {
    if (reviews.length <= 1) return
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) advance()
    }, 6000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [currentIndex, reviews.length])

  if (reviews.length === 0) return null

  const style: React.CSSProperties = {
    opacity: phase === 'visible' ? 1 : 0,
    transform: phase === 'entering'
      ? 'translateY(24px) scale(0.95)'
      : phase === 'exiting'
      ? 'translateY(-24px) scale(0.95)'
      : 'translateY(0px) scale(1)',
    filter: phase === 'visible' ? 'blur(0px)' : 'blur(4px)',
    transition: phase === 'visible'
      ? 'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1), filter 0.5s ease'
      : 'opacity 0.4s ease, transform 0.4s ease, filter 0.4s ease',
    pointerEvents: phase === 'visible' ? 'auto' : 'none',
    willChange: 'opacity, transform',
    position: 'absolute',
    width: '100%',
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 52,
        right: 24,
        width: 240,
        zIndex: 15,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div style={{ textAlign: 'center' }}>
        {/* <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
          Trusted by providers
        </div> */}
        <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', gap: 6 }}>
          {/* <span style={{ fontSize: 20, fontWeight: 700, color: '#0D4A3E', letterSpacing: '-0.03em' }}>4.9</span> */}
          {/* <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 1 }}>
              {[...Array(5)].map((_, i) => <StarIcon key={i} filled size={12} />)}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Global Rating</div>
          </div> */}
        </div>
      </div>

      <div style={{ width: '100%', height: 160, position: 'relative' }}>
        <div style={style}>
          <ReviewCard review={reviews[displayedIndex]} />
        </div>
      </div>

      {reviews.length > 1 && (
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: -10 }}>
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Review ${i + 1}`}
              style={{
                height: 5,
                width: i === currentIndex ? 20 : 5,
                borderRadius: 9999,
                background: i === currentIndex ? '#0D4A3E' : '#cbd5e1',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.3s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8', paddingLeft: 1 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        {children}
      </div>
    </div>
  )
}

const inputCls = [
  'w-full h-10 pl-[33px] pr-3 rounded-[10px]',
  'text-[13px] font-normal text-slate-800 placeholder:text-slate-400',
  'bg-slate-50 border border-slate-200 outline-none appearance-none',
  'transition-all focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-600/10',
].join(' ')

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [googleLoading, setGoogleLoading] = useState(false)
  const [formLoading,   setFormLoading]   = useState(false)
  const [requiresRegistration, setRequiresRegistration] = useState(false)
  const [googleCredential,     setGoogleCredential]     = useState('')
  const [googleProfile, setGoogleProfile] = useState<{ email: string; name: string; picture: string } | null>(null)

  const [formData, setFormData] = useState<RegisterFormState>({
    businessName: '', ownerName: '', phone: '',
    category: '', county: '', location: '', planName: 'STARTER',
  })

  const set = (k: keyof RegisterFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormData(f => ({ ...f, [k]: e.target.value }))

  const finishLogin = (data: { accessToken: string; refreshToken: string; user: any }) => {
    login({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user)
    navigate(data.user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard', { replace: true })
  }

  const handleGoogleAuth = async (credential: string) => {
    setGoogleLoading(true)
    try {
      const res = await authApi.googleAuth({ credential })
      if (res.data.action === 'REQUIRES_REGISTRATION') {
        setGoogleCredential(credential)
        setGoogleProfile(res.data.googleDetails)
        setFormData(f => ({ ...f, ownerName: res.data.googleDetails.name || '' }))
        setRequiresRegistration(true)
        toast.info('Google account verified. Complete your business profile to continue.')
      } else {
        finishLogin(res.data)
        toast.success('Welcome back!')
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const res = await authApi.googleAuth({ credential: googleCredential, registration: formData })
      toast.success('Business account created successfully!')
      finishLogin(res.data)
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');
        .lp-root { font-family: 'Geist', sans-serif; }
        .lp-serif { font-family: 'Instrument Serif', serif; }
        .lp-gbtn { transition: border-color .15s, box-shadow .15s, transform .12s; }
        .lp-gbtn:hover { border-color: #0D4A3E !important; box-shadow: 0 2px 12px rgba(13,74,62,0.09); transform: translateY(-1px); }
        .lp-sbtn { transition: background .15s, transform .12s, box-shadow .15s; }
        .lp-sbtn:hover:not(:disabled) { background: #0a3d33 !important; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(13,74,62,0.22); }
        .lp-footer a { transition: color .13s; }
        .lp-footer a:hover { color: #0D4A3E !important; }
        .lp-trust-card { transition: border-color .15s, background .15s; }
        .lp-trust-card:hover { background: rgba(13,74,62,0.07) !important; border-color: rgba(13,74,62,0.18) !important; }
      `}</style>

      <div className="lp-root min-h-screen bg-white flex flex-col" style={{ position: 'relative' }}>

        {/* ── Centered login area ── */}
        <div
          className="flex-1 flex items-center justify-center px-5"
          style={{ paddingBottom: 56 }}
        >
          <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

            {/* Logo */}
            <div style={{ marginBottom: 34 }}>
              <img src={logo} alt="Logo" style={{ height: 36, objectFit: 'contain' }} />
            </div>

            {!requiresRegistration ? (
              <>
                {/* ── Headline ── */}
                <h1 className="lp-serif" style={{
                  fontSize: 34, fontWeight: 400, lineHeight: 1.18,
                  letterSpacing: '-0.01em', color: '#0f172a', marginBottom: 8,
                }}>
                  Welcome<br />
                  <em style={{ fontStyle: 'italic', color: '#0D4A3E' }}>back.</em>
                </h1>

                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 28, maxWidth: 320 }}>
                  Sign in with your Google account. New accounts are guided through setup automatically.
                </p>

                {/* ── Google button ── */}
                <div style={{ width: '100%', maxWidth: 320 }}>
                  <GoogleAuthButton text="continue_with" disabled={googleLoading} onCredential={handleGoogleAuth} />
                </div>

                {/* ── Divider ── */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', maxWidth: 320, margin: '16px 0 0',
                }}>
                  <div style={{ flex: 1, height: '0.5px', background: 'rgba(15,23,42,0.08)' }} />
                  <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>secure · no password needed</span>
                  <div style={{ flex: 1, height: '0.5px', background: 'rgba(15,23,42,0.08)' }} />
                </div>

                {/* ── Trust cards ── */}
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 8,
                  width: '100%', maxWidth: 320, marginTop: 14, textAlign: 'left',
                }}>
                  {[
                    {
                      icon: ShieldCheck,
                      text: 'Google handles authentication. We never store your password.',
                    },
                    {
                      icon: Smartphone,
                      text: 'Works on mobile and desktop. Your data syncs automatically.',
                    },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="lp-trust-card"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 11,
                        padding: '11px 14px', borderRadius: 10,
                        background: 'rgba(13,74,62,0.04)',
                        border: '0.5px solid rgba(13,74,62,0.10)',
                      }}
                    >
                      <Icon size={15} style={{ color: '#0D4A3E', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.55 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <form onSubmit={handleRegistrationSubmit} style={{ width: '100%', textAlign: 'left' }}>
                <h1 className="lp-serif" style={{ fontSize: 28, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.01em', color: '#0f172a', marginBottom: 6, textAlign: 'center' }}>
                  Complete your<br />
                  <em style={{ fontStyle: 'italic', color: '#0D4A3E' }}>business profile.</em>
                </h1>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                  One-time setup — takes less than a minute.
                </p>

                {/* Verified pill */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, marginBottom: 20,
                  background: 'rgba(13,74,62,0.05)', border: '0.5px solid rgba(13,74,62,0.14)',
                }}>
                  {googleProfile?.picture && (
                    <img src={googleProfile.picture} alt="" referrerPolicy="no-referrer"
                      style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0D4A3E', marginBottom: 1 }}>
                      Google verified
                    </span>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {googleProfile?.email}
                    </span>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#0D4A3E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={10} color="white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Fields grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <Field label="Business Name" icon={Building2}>
                    <input type="text" placeholder="Westlands Salon" value={formData.businessName} onChange={set('businessName')} className={inputCls} required />
                  </Field>
                  <Field label="Owner Name" icon={User}>
                    <input type="text" placeholder="Jane Doe" value={formData.ownerName} onChange={set('ownerName')} className={inputCls} required />
                  </Field>
                  <Field label="Category" icon={Tag}>
                    <select value={formData.category} onChange={set('category')} className={inputCls} required>
                      <option value="">Select…</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="County" icon={MapPin}>
                    <select value={formData.county} onChange={set('county')} className={inputCls} required>
                      <option value="">Select…</option>
                      {COUNTIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Phone" icon={Phone}>
                    <input type="tel" placeholder="0712 345 678" value={formData.phone} onChange={set('phone')} className={inputCls} required />
                  </Field>
                  <Field label="Area / Location" icon={MapPin}>
                    <input type="text" placeholder="Greenhouse Mall" value={formData.location} onChange={set('location')} className={inputCls} required />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="lp-sbtn w-full h-[46px] rounded-xl text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#0D4A3E', border: 'none' }}
                >
                  {formLoading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                  {formLoading ? 'Creating account…' : 'Create account'}
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* ── Gradient Background ── */}
        <GradientBackground />

        {/* ── Floating review panel ── */}
        <ReviewPanel />

        {/* ── Footer ── */}
        <div
          className="lp-footer"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '10px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: '4px 20px', zIndex: 20,
          }}
        >
          {[
            ['Terms & Conditions', '/terms-conditions'],
            ['Privacy Policy',     '/privacy-policy'],
            ['Google Terms',       '/google/terms'],
            ['Google Privacy',     '/google/privacy'],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'capitalize', color: '#94a3b8', textDecoration: 'none' }}
            >
              {label}
            </a>
          ))}
        </div>

      </div>
    </>
  )
}