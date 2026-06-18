import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, MapPin, Phone, Tag,
  Loader2, Check, ArrowLeft, Star
} from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '../../lib/api/auth'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'
import { platformApi, type PlatformReview } from '../../lib/api/platform'
import { motion, AnimatePresence } from 'framer-motion'

const logo = '/logo.png'
const hlynk = '/hlynk.png'
const authBg = '/img.png'

const COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo/Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita/Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
]

const CATEGORIES = [
  'Accounting & Tax Services',
  'Agrovet',
  'Agricultural Cooperative',
  'Art & Craft Business',
  'Bakery',
  'Barber Shop',
  'Cafe',
  'Car Wash',
  'Car Yard',
  'Catering Services',
  'Church',
  'Clinic',
  'College',
  'Community Organization',
  'Construction Services',
  'Consultancy',
  'Cosmetics Shop',
  'Courier Services',
  'Cyber Cafe',
  'Cyber Security',
  'Dairy Business',
  'Daycare',
  'Dental Clinic',
  'Digital Agency',
  'Driving School',
  'E-commerce Business',
  'Electrical Services',
  'Electronics Shop',
  'Farm',
  'Fashion & Boutique',
  'Fast Food',
  'Financial Services',
  'Freelancer',
  'Furniture Workshop',
  'Garage',
  'Guest House',
  'Hardware Store',
  'Hospital',
  'Hotel',
  'Insurance Agency',
  'Interior Design',
  'Internet Service Provider',
  'IT Services',
  'Legal Services',
  'Lounge & Bar',
  'Manufacturing',
  'Marketing Agency',
  'Mechanic Garage',
  'Microfinance',
  'Mini Mart',
  'Mobile Phone Shop',
  'Mosque',
  'NGO',
  'Online Business',
  'Optical Clinic',
  'Other',
  'Pharmacy',
  'Plumbing Services',
  'Poultry Farm',
  'Printing & Branding',
  'Real Estate Agency',
  'Restaurant',
  'Retail Store',
  'SACCO',
  'Salon',
  'School',
  'Software Development',
  'Spa & Beauty',
  'Supermarket',
  'Tailoring & Fashion Design',
  'Training Centre',
  'Transport Services',
  'Travel Agency',
  'University',
  'Veterinary Clinic',
  'Welding & Fabrication',
  'Wholesale Shop'
]

type RegisterFormState = {
  businessName: string; ownerName: string; phone: string
  category: string; county: string; location: string; planName: 'LITE' | 'PLUS' | 'MAX'
  referralCode?: string;
}

function ReviewCard({ review }: { review: any }) {
  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex gap-0.5 mb-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={12}
            className={review.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
          />
        ))}
      </div>
      <p className="text-[15px] text-white leading-[1.6] font-light italic opacity-95 drop-shadow-sm line-clamp-4">
        "{review.comment}"
      </p>
      {review.businessName && (
        <div className="text-[10px] font-black text-white/50 tracking-[0.2em]">
          {review.businessName}
        </div>
      )}
    </div>
  )
}

function ReviewPanel() {
  const [reviews, setReviews] = useState<PlatformReview[]>([])
  const [idx, setIdx] = useState(0)
  const [isShowing, setIsShowing] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    platformApi.getReviews({ limit: 10 })
      .then(res => { if (res.items?.length) setReviews(res.items) })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!reviews.length) return
    const cycleTime = 1000 * 60 * 5
    const itemDuration = 8000
    let currentIdx = 0
    let itemInterval: any
    let cycleTimeout: any

    const startReviewLoop = () => {
      setIsShowing(true)
      currentIdx = 0
      setIdx(0)
      setVisible(true)
      itemInterval = setInterval(() => {
        setVisible(false)
        setTimeout(() => {
          if (currentIdx >= reviews.length - 1) {
            clearInterval(itemInterval)
            setIsShowing(false)
            cycleTimeout = setTimeout(startReviewLoop, cycleTime)
          } else {
            currentIdx++
            setIdx(currentIdx)
            setVisible(true)
          }
        }, 600)
      }, itemDuration)
    }
    // Show immediately on desktop instead of waiting 5 minutes for first cycle
    startReviewLoop()
    return () => { clearInterval(itemInterval); clearTimeout(cycleTimeout) }
  }, [reviews.length, reviews])

  if (reviews.length === 0 || !isShowing) return null

  return (
    <div className="hidden lg:block">
      <div
        className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-br-[.5rem] rounded-tl-[.5rem] rounded-tr-[.5rem] rounded-bl-[1.5rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.3)] transition-all duration-1000 animate-in fade-in slide-in-from-bottom-4"
        style={{ boxShadow: 'inset 0 0 40px rgba(255,255,255,0.05)', background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[8px] tracking-[0.4em] uppercase font-black text-white/30">Community</span>
          <div className="h-[1px] flex-1 bg-white/5" />
        </div>
        <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
          <ReviewCard review={reviews[idx]} />
        </div>
      </div>
    </div>
  )
}

// Mobile: runs once through reviews then disappears
function MobileReviewStrip() {
  const [reviews, setReviews] = useState<PlatformReview[]>([])
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    platformApi.getReviews({ limit: 10 })
      .then(res => { if (res.items?.length) setReviews(res.items) })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!reviews.length) return
    const t = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(t)
  }, [reviews.length])

  useEffect(() => {
    if (!visible || !reviews.length) return
    const DURATION = 10000
    const FADE = 500
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        if (idx >= reviews.length - 1) {
          setDone(true)
        } else {
          setIdx(i => i + 1)
          setVisible(true)
        }
      }, FADE)
    }, DURATION)
    return () => clearTimeout(t)
  }, [visible, idx, reviews.length])

  if (!reviews.length || done) return null

  const review = reviews[idx]

  return (
    <div className="lg:hidden mx-5 mb-4 mt-auto rounded-3xl flex flex-col justify-center px-6 py-5 min-h-[130px]"
      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.25) 100%)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  className={review.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
                />
              ))}
            </div>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 18, fontWeight: 300, fontStyle: 'italic',
              color: 'rgba(255,255,255,0.92)', lineHeight: 1.65,
              textShadow: '0 1px 6px rgba(0,0,0,0.3)', marginBottom: 10,
            }}>
              "{review.comment}"
            </p>
            {review.businessName && (
              <p style={{
                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.2em', marginBottom: 14,
              }}>
                — {review.businessName}
              </p>
            )}
            <div style={{ display: 'flex', gap: 4 }}>
              {reviews.map((_, i) => (
                <div key={i} style={{
                  height: 2, borderRadius: 2,
                  width: i === idx ? 20 : 4,
                  background: i === idx ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                  transition: 'all 0.4s ease',
                }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 group">
      <label className="text-[12px] font-semibold text-[#64748b] ml-1 transition-colors group-focus-within:text-black">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none transition-colors group-focus-within:text-black">
          <Icon size={14} />
        </div>
        {children}
      </div>
    </div>
  )
}

const inputCls = "w-full h-12 pl-[42px] pr-4 bg-[#f8fafc] border border-[#f1f5f9] rounded-xl outline-none focus:bg-white focus:border-black transition-all text-[14px] font-[inherit] appearance-none"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [requiresRegistration, setRequiresRegistration] = useState(false)
  const [googleCredential, setGoogleCredential] = useState('')
  const [acceptedEula, setAcceptedEula] = useState(() => localStorage.getItem('hlynk_eula_accepted') === 'true')

  useEffect(() => {
    if (user && !requiresRegistration) {
      navigate(user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, requiresRegistration, navigate])

  const urlParams = new URLSearchParams(window.location.search)
  const isTrialRequest = urlParams.get('trial') === 'true'
  const requestedPlan = (urlParams.get('plan') as 'LITE' | 'PLUS' | 'MAX') || 'LITE'
  const requestedDays = urlParams.get('days') || (isTrialRequest ? '14' : '28')
  const urlReferralCode = urlParams.get('ref')?.trim().toUpperCase() || ''

  const [formData, setFormData] = useState<RegisterFormState & { isTrial?: boolean; daysReward?: number }>({
    businessName: '', ownerName: '', phone: '', category: '', county: '',
    location: '', planName: requestedPlan, referralCode: urlReferralCode,
    isTrial: isTrialRequest || !!urlReferralCode,
    daysReward: parseInt(requestedDays)
  })

  const handleGoogleAuth = async (credential: string) => {
    setGoogleLoading(true)
    try {
      const res = await authApi.googleAuth({ credential })
      if (res.data.action === 'REQUIRES_REGISTRATION') {
        setGoogleCredential(credential)
        setFormData(f => ({
          ...f,
          ownerName: res.data.googleDetails.name || '',
          isTrial: isTrialRequest || !!urlReferralCode
        }))
        setRequiresRegistration(true)
        toast.info('Google account verified. Setup your business profile.')
      } else {
        login({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, res.data.user)
        navigate(res.data.user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard', { replace: true })
        toast.success('Welcome Back!')
      }
    } catch (err: any) { toast.error(getErrorMessage(err)) }
    finally { setGoogleLoading(false) }
  }

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const res = await authApi.googleAuth({ credential: googleCredential, registration: formData })
      login({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, res.data.user)
      navigate('/dashboard', { replace: true })

      const isTrial = res.data.user.subscription?.status === 2;
      if (isTrial) {
        toast.success('Your 14-day free trial has started!');
      } else {
        toast.success('Your shop is now live on hlynk!');
      }
    } catch (err: any) { toast.error(getErrorMessage(err)) }
    finally { setFormLoading(false) }
  }

  const eulaWarning = () => toast.warning('Please accept the Terms of Service first.')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        .lp-serif { font-family: 'Cormorant Garamond', serif; }
        .lp-sans  { font-family: 'Outfit', sans-serif; }

        .lp-page {
          min-height: 100vh; width: 100%;
          background-image: url(${authBg});
          background-size: cover; background-position: center;
          background-attachment: fixed;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; box-sizing: border-box;
          position: relative; overflow-x: hidden;
        }
        .lp-container {
          width: 100%; max-width: 1300px; min-height: 740px;
          background: white; border-radius: 2rem; display: flex;
          overflow: hidden; box-shadow: 0 60px 150px rgba(0,0,0,0.8);
          position: relative; z-index: 10;
        }
        .lp-left {
          flex: 1; margin: .5em; position: relative; border-radius: 2rem;
          background-image: url(${authBg}); background-size: cover;
          background-position: center; background-attachment: fixed;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 60px; overflow: hidden;
        }
        .lp-left::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5)); z-index: 1;
        }
        .lp-right {
          width: 650px; background: white; display: flex;
          flex-direction: column; justify-content: center;
          padding: 60px; position: relative; z-index: 10;
        }
        .lp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(48px, 4vw, 72px);
          line-height: 0.95; font-weight: 500; color: white; margin-bottom: 24px;
        }
        .lp-btn-submit {
          width: 100%; height: 56px; background: #000; color: #fff;
          border-radius: 14px; font-weight: 600; font-size: 15px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .lp-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(0,0,0,0.2); }
        .lp-btn-submit:active { transform: translateY(0); }

        /* Shared auth card styling */
        .auth-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 10px;
        }
        .auth-blur {
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%);
          backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.06);
        }

        /*
          .google-btn-wrap — position:relative container used on BOTH mobile and desktop.
          .google-btn-blocker — transparent absolute overlay that sits on top of the Google
          iframe when EULA is unchecked. This is required because pointer-events:none on a
          parent div does NOT propagate into a cross-origin <iframe>'s event loop.
          The blocker intercepts the click at the host-page DOM level before it reaches the iframe.
        */
        .google-btn-wrap {
          position: relative;
          width: 100%;
        }
        .google-btn-wrap > div,
        .google-btn-wrap iframe {
          width: 100% !important;
          max-width: 100% !important;
        }
        .google-btn-blocker {
          position: absolute;
          inset: 0;
          z-index: 10;
          cursor: not-allowed;
          border-radius: 4px;
          /* transparent — visually invisible, blocks events only */
        }

        @media (max-width: 1024px) {
          .lp-left { display: none !important; }

          .lp-page {
            padding: 0;
            background: url(${authBg}) center/cover no-repeat;
            background-attachment: scroll;
            align-items: flex-start;
          }
          .lp-page::before {
            content: ''; position: fixed; inset: 0;
            background: linear-gradient(
              to bottom,
              rgba(13, 74, 62, 0.38) 0%, 
              rgba(13, 74, 62, 0.15) 30%,
              rgba(13, 74, 62, 0.7) 60%, 
              rgba(13, 74, 62, 0.98) 75%,
              rgba(13, 74, 62, 1) 100%
            );
            -webkit-backdrop-filter: blur(2px);
            pointer-events: none; z-index: 0;
          }
          .lp-container {
            min-height: 100dvh; border-radius: 0; box-shadow: none;
            background: transparent; width: 100%; flex-direction: column;
            overflow-y: auto; overflow-x: hidden; position: relative; z-index: 1;
          }
          .lp-right {
            width: 100%; padding: 0; background: transparent;
            justify-content: flex-start; display: flex; flex-direction: column;
          }
          .mob-nav {
            display: flex !important; align-items: center;
            justify-content: space-between; padding: 20px 24px 0;
          }
          .mob-hero { padding: 28px 24px 24px; }
          .mob-hero-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: clamp(44px, 12vw, 54px); font-weight: 400;
            line-height: 1.0; color: #fff; margin-bottom: 8px;
            text-shadow: 0 2px 12px rgba(0,0,0,0.25);
          }
          .mob-hero-title em { font-style: italic; font-weight: 300; }
          .mob-hero-sub { font-size: 13px; color: rgba(255,255,255,0.8); font-weight: 300; line-height: 1.6; }

          .lp-right .lp-right-logo    { display: none !important; }
          .lp-right .lp-right-heading { display: none !important; }
          /* Hide desktop-only auth block on mobile */
          .lp-right .desktop-only     { display: none !important; }

          .lp-right .innerSection {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            flex: 1; border-radius: 1rem; padding: 32px 24px;
          }
        }

        @media (max-width: 500px) {
          .mob-hero { padding: 24px 20px 20px; }
          .mob-nav  { padding: 18px 20px 0; }
          .lp-right .mob-form-wrap { padding: 24px 20px 100px; }
        }
      `}</style>

      <motion.div
        className="lp-page lp-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="lp-container"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── LEFT PANEL (desktop only) ────────────────────────────────────── */}
          <div className="lp-left hidden lg:flex">
            <div className="relative z-10 w-full">
              <div className="h-[2px] w-24 bg-white/50 mb-16" />
              <h1 className="lp-title">
                The Smartest Way <br /> to Grow <br /> Your Biashara
              </h1>
              <p className="text-xl text-white font-light opacity-90 leading-relaxed max-w-sm drop-shadow-lg mb-10">
                Stop the guesswork. Use modern tracking to manage stock and double your business profits.
              </p>
              <div className="flex flex-col gap-5">
                {[
                  'M-Pesa Friendly Sales Tracking',
                  'Zero Manual Record Books Needed',
                  'Automated Insights to Cut Costs',
                  'Instant Setup, No Fees to Start',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-4 text-white group">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/40 transition-colors">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-[15px] font-semibold tracking-wide">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* ReviewPanel now always starts immediately */}
            <div className="relative z-10 w-full max-w-[340px]">
              <ReviewPanel />
            </div>
          </div>

          {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
          <div className="lp-right">

            {/* ═══════════════ MOBILE (hidden on lg+) ════════════════════════ */}
            <AnimatePresence mode="wait">
              {!requiresRegistration ? (
                <motion.div
                  key="mob-login"
                  className="flex flex-col min-h-[100dvh] lg:hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Nav */}
                  <nav className="mob-nav hidden" style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={hlynk} alt="hlynk" style={{ height: 32, objectFit: 'contain' }} />
                    </div>
                    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#0c3d2eff', textDecoration: 'none', letterSpacing: '0.14em' }}>
                      <ArrowLeft size={10} /> Website
                    </a>
                  </nav>

                  {/* Hero - Simplified for Mobile but consistent with Desktop */}
                  <div className="mob-hero" style={{ display: 'block' }}>
                    <h1 className="mob-hero-title pb-1">The Smartest Way <br /> to Grow <br /> Your <em>Biashara</em></h1>
                    <p className="mob-hero-sub mt-2 mb-6">Stop the guesswork. Use modern tracking to manage stock and double your business profits.</p>
                    <div className="flex flex-col gap-2 opacity-80 scale-90 origin-left">
                      {[
                        'M-Pesa Friendly Sales Tracking',
                        'Zero Manual Record Books Needed',
                        'Automated Insights to Cut Costs',
                        'Instant Setup, No Fees to Start',
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 text-white">
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <Check size={10} strokeWidth={4} />
                          </div>
                          <span className="text-[12px] font-medium tracking-wide">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <MobileReviewStrip />

                  {/* ── Mobile EULA + Google button ─────────────────────────
                      Both use .google-btn-wrap + .google-btn-blocker pattern,
                      identical to desktop, to physically block the iframe.
                  ─────────────────────────────────────────────────────────── */}
                  <div className="flex flex-col mt-auto pb-8 z-10 px-6 gap-4">

                    {/* EULA card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="mt-1 accent-[#0D4A3E] w-5 h-5 cursor-pointer rounded-md border-white/20 flex-shrink-0 bg-white/20"
                          checked={acceptedEula}
                          onChange={e => {
                            setAcceptedEula(e.target.checked)
                            if (e.target.checked) localStorage.setItem('hlynk_eula_accepted', 'true')
                            else localStorage.removeItem('hlynk_eula_accepted')
                          }}
                        />
                        <span className="text-[11px] px-1 pt-0.5 font-light text-white/90 leading-relaxed">
                          I agree to the{' '}
                          <a href="/terms-conditions" className="text-white hover:text-emerald-300 font-medium underline transition-colors">Terms of Service</a>
                          ,{' and '}
                          <a href="/privacy-policy" className="text-white hover:text-emerald-300 font-medium underline transition-colors">Privacy Policy</a>
                          {/* , <a href="/google/terms" className="text-white hover:text-emerald-300 font-medium underline transition-colors">Google Terms</a>
                          {' '}and{' '}
                          <a href="/google/privacy" className="text-white hover:text-emerald-300 font-medium underline transition-colors">Notice</a>. */}
                        </span>
                      </label>
                    </div>

                    {/* Google button — blocker overlay when EULA unchecked */}
                    <div className={`w-full transition-all text-center duration-300 ${!acceptedEula ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                      <div className="google-btn-wrap">
                        {!acceptedEula && (
                          <div className="google-btn-blocker" onClick={eulaWarning} />
                        )}
                        <MobileGoogleAuth googleLoading={googleLoading} handleGoogleAuth={handleGoogleAuth} disabled={!acceptedEula} />
                      </div>
                    </div>

                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mob-register"
                  className="flex flex-col min-h-[100dvh] lg:hidden"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  <nav className="mob-nav hidden" style={{ display: 'flex' }}>
                    <img src={hlynk} alt="hlynk" style={{ height: 32, objectFit: 'contain' }} />
                    <button
                      onClick={() => { setRequiresRegistration(false); setGoogleCredential('') }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, background: 'none', border: 'none', textTransform: 'capitalize', letterSpacing: '0.14em', cursor: 'pointer' }}
                    >
                      <ArrowLeft size={10} /> Back
                    </button>
                  </nav>

                  <div className="mob-form-wrap">
                    <div style={{ marginBottom: 28 }}>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 400, color: '#111', lineHeight: 1.05, marginBottom: 8 }}>
                        Setup<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>Your Shop</em>
                      </h2>
                      <p style={{ fontSize: 13, fontWeight: 300 }}>Tell us about your biashara to get started.</p>
                    </div>

                    <form onSubmit={handleRegistrationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }} className="innerSection">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                        <Field label="Biashara Name" icon={Building2}>
                          <input type="text" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className={inputCls} placeholder="e.g. John's Shop" required />
                        </Field>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <Field label="County" icon={MapPin}>
                            <select value={formData.county} onChange={e => setFormData({ ...formData, county: e.target.value })} className={inputCls} required>
                              <option value="">County?</option>
                              {COUNTIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </Field>
                          <Field label="Category" icon={Tag}>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={inputCls} required>
                              <option value="">Type?</option>
                              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </Field>
                        </div>
                        <Field label="Town / Area" icon={MapPin}>
                          <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className={inputCls} placeholder="e.g. Utoma, Beirut" required />
                        </Field>
                        <Field label="M-Pesa Number" icon={Phone}>
                          <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputCls} placeholder="07xx xxx xxx" required />
                        </Field>


                      </div>
                      <button type="submit" disabled={formLoading} className="lp-btn-submit">
                        {formLoading ? <Loader2 size={18} className="animate-spin" /> : 'Launch My Biashara'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══════════════ DESKTOP (hidden on mobile) ════════════════════ */}
            <div className="hidden lg:flex w-full max-w-[380px] mx-auto flex-col h-full">
              <div className="lp-right-logo flex justify-center mb-12">
                <img src={hlynk} alt="hlynk" className="h-12 object-contain" />
                <span style={{ color: '#00694B', fontWeight: 'bold', fontSize: '1.5rem', fontFamily: "'Nunito', sans-serif", margin: '5px' }}>lynk</span>
              </div>

              <AnimatePresence mode="wait">
                {!requiresRegistration ? (
                  <motion.div
                    key="desktop-login"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="lp-right-heading text-center mb-10">
                      <h2 className="lp-serif text-[52px] leading-tight text-black mb-2">Welcome Back</h2>
                      <p className="text-[#94a3b8] font-light text-[15px]">Your business dashboard is just one click away.</p>
                    </div>

                    <div className="auth-card desktop-only">
                      <div className="auth-blur p-6 rounded-2xl">

                        {/* Google button — blocker overlay when EULA unchecked */}
                        <div className={`google-btn-wrap mb-6 transition-all duration-300 ${!acceptedEula ? 'opacity-50 grayscale' : ''}`}>
                          {!acceptedEula && (
                            <div className="google-btn-blocker" onClick={eulaWarning} />
                          )}
                          <GoogleAuthButton
                            text="continue_with"
                            onCredential={handleGoogleAuth}
                            disabled={googleLoading || !acceptedEula}
                          />
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-[1px] flex-1 bg-[#f1f5f9]" />
                          <span className="text-[9px] text-[#cbd5e1] tracking-[0.34em] font-bold uppercase">Biashara Hub</span>
                          <div className="h-[1px] flex-1 bg-[#f1f5f9]" />
                        </div>

                        {/* EULA */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="mt-1 accent-black w-5 h-5 cursor-pointer rounded-md border-gray-200 flex-shrink-0"
                            checked={acceptedEula}
                            onChange={e => {
                              setAcceptedEula(e.target.checked)
                              if (e.target.checked) localStorage.setItem('hlynk_eula_accepted', 'true')
                              else localStorage.removeItem('hlynk_eula_accepted')
                            }}
                          />
                          <span className="text-[11px] px-1 pt-0.5 leading-relaxed font-light text-slate-500">
                            I agree to the{' '}
                            <a href="/terms-conditions" className="hover:text-emerald-600 hover:underline font-medium transition-colors">Terms of Service</a>
                            {' & '}
                            <a href="/privacy-policy" className="hover:text-emerald-600 hover:underline font-medium transition-colors">Privacy Policy</a>
                            {/* , <a href="/google/terms" className="text-black hover:text-emerald-600 underline font-medium transition-colors">Google Terms</a>
                            {' '}and{' '}
                            <a href="/google/privacy" className="text-black hover:text-emerald-600 underline font-medium transition-colors">Notice</a>. */}
                          </span>
                        </label>

                      </div>
                    </div>

                    <a href="/" className="hidden lg:flex items-center mt-8 cursor-pointer text-black font-normal pl-5 hover:underline">
                      <ArrowLeft size={12} className="mr-2" />
                      Back to Website
                    </a>
                  </motion.div>
                ) : (
                  <motion.div
                    key="desktop-register"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                  >
                    <form onSubmit={handleRegistrationSubmit} className="flex flex-col h-full">
                      <div className="text-center mb-8">
                        <h2 className="lp-serif text-[42px] leading-tight text-black mb-2">Setup Shop</h2>
                        <p className="text-gray-400 font-light text-sm">Tell us about your biashara to get started.</p>
                      </div>
                      <div className="flex flex-col gap-4 mb-8">
                        <Field label="Biashara Name" icon={Building2}>
                          <input type="text" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className={inputCls} placeholder="e.g. Mama Mboga Pro" required />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="County Location" icon={MapPin}>
                            <select value={formData.county} onChange={e => setFormData({ ...formData, county: e.target.value })} className={inputCls} required>
                              <option value="">Where is your shop?</option>
                              {COUNTIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </Field>
                          <Field label="Biashara Category" icon={Tag}>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={inputCls} required>
                              <option value="">What do you do?</option>
                              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </Field>
                        </div>
                        <Field label="Specific Town/Area" icon={MapPin}>
                          <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className={inputCls} placeholder="e.g. Westlands, Nairobi" required />
                        </Field>
                        <Field label="M-Pesa Number" icon={Phone}>
                          <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputCls} placeholder="07xx xxx xxx" required />
                        </Field>


                      </div>
                      <button type="submit" disabled={formLoading} className="lp-btn-submit">
                        {formLoading ? <Loader2 size={18} className="animate-spin" /> : 'Launch My biashara'}
                      </button>
                      <button type="button" disabled={formLoading} onClick={() => { setRequiresRegistration(false); setGoogleCredential('') }} className="text-left mt-8 cursor-pointer text-black font-normal pl-5 hover:underline">
                        Back to Login
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </>
  )
}

function MobileGoogleAuth({
  googleLoading,
  handleGoogleAuth,
  disabled,
}: {
  googleLoading: boolean
  handleGoogleAuth: (credential: string) => void
  disabled?: boolean
}) {
  return (
    <GoogleAuthButton
      text="continue_with"
      variant="pill-centered"
      onCredential={handleGoogleAuth}
      disabled={googleLoading || disabled}
      className=""
    />
  )
}