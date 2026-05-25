import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, MapPin, Phone, Tag,
  Loader2, Check, ShieldCheck, Lock, Sparkles, ArrowLeft, X
} from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '../../lib/api/auth'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'
import { platformApi, type PlatformReview } from '../../lib/api/platform'
import StarRating from '../../components/shared/StarRating'
import { FadeUp } from '../../components/landing/Animations'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const logo = '/logo.png'
const authBg = '/img.png'

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita/Taveta', 'Garissa',
  'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui',
  'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', "Murang'a", 'Kiambu', 'Turkana',
  'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo/Marakwet', 'Nandi', 'Baringo',
  'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira',
]

const CATEGORIES = [
  'Retail Store', 'Barber & Salon', 'Cleaning Services', 'Plumbing',
  'Electrical', 'Mechanic', 'Consultancy', 'Tailoring', 'Restaurant', 'Hotel', 'Hospital', 'School', 'College', 'University', 'Other',
]

type RegisterFormState = {
  businessName: string; ownerName: string; phone: string
  category: string; county: string; location: string; planName: 'LITE' | 'PLUS' | 'MAX'
  referredBy?: string;
}

function ReviewCard({ review }: { review: any }) {
  return (
    <div className="flex flex-col gap-3 p-1">
      <p className="text-[15px] text-white leading-[1.6] font-light italic opacity-95 drop-shadow-sm line-clamp-4">
        "{review.comment}"
      </p>
      {review.businessName && (
        <div className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">
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
  const [mounted, setMounted] = useState(false)

  // Initial Fetch
  useEffect(() => {
    platformApi.getReviews({ limit: 10 })
      .then(res => {
        if (res.items?.length) setReviews(res.items)
      })
      .catch(console.error)
  }, [])

  // 5 Minute Interval Logic
  useEffect(() => {
    if (!reviews.length) return

    const cycleTime = 1000 * 60 * 5 // 5 minutes
    const itemDuration = 8000 // 8s per review

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
            // Cycle finished
            clearInterval(itemInterval)
            setIsShowing(false)
            // Schedule next cycle
            cycleTimeout = setTimeout(startReviewLoop, cycleTime)
          } else {
            currentIdx++
            setIdx(currentIdx)
            setVisible(true)
          }
        }, 600)
      }, itemDuration)
    }

    // First cycle after 5 minutes
    cycleTimeout = setTimeout(startReviewLoop, cycleTime)

    return () => {
      clearInterval(itemInterval)
      clearTimeout(cycleTimeout)
    }
  }, [reviews.length, reviews])

  if (reviews.length === 0 || !isShowing) return null

  const DesktopPanel = (
    <div 
      className={`
        bg-white/5 backdrop-blur-[20px] border border-white/10 
        rounded-br-[.5rem] rounded-tl-[.5rem] rounded-tr-[.5rem] rounded-bl-[1.5rem] 
        p-8 shadow-[0_30px_100px_rgba(0,0,0,0.3)] 
        transition-all duration-1000 animate-in fade-in slide-in-from-bottom-4
      `}
      style={{
        boxShadow: 'inset 0 0 40px rgba(255,255,255,0.05)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[8px] tracking-[0.4em] uppercase font-black text-white/30">Community</span>
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <ReviewCard review={reviews[idx]} />
      </div>
    </div>
  )

  const MobileWidget = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: -20 }}
      className="lg:hidden fixed bottom-6 left-6 z-[100] w-[calc(100%-48px)] max-w-[320px] bg-black/60 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-6 shadow-2xl overflow-hidden"
    >
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)' }}
      />
      
      <button 
        onClick={() => setIsShowing(false)}
        className="absolute top-4 right-4 h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5"
      >
        <X size={12} />
      </button>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
        <span className="text-[9px] tracking-[0.3em] uppercase font-black text-white/40">Community</span>
      </div>

      <div className="relative z-10 transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
        <ReviewCard review={reviews[idx]} />
      </div>

      <div className="mt-6 flex justify-between items-center relative z-10">
        <div className="flex gap-1">
          {reviews.slice(0, 5).map((_, i) => (
            <div key={i} className={`h-0.5 rounded-full transition-all duration-500 ${i === idx % 5 ? 'w-3 bg-white' : 'w-0.5 bg-white/10'}`} />
          ))}
        </div>
      </div>
    </motion.div>
  )

  return (
    <>
      <div className="hidden lg:block">
        {DesktopPanel}
      </div>
      <div className="lg:hidden">
        {MobileWidget}
      </div>
    </>
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
  const [googleProfile, setGoogleProfile] = useState<{ email: string; name: string; picture: string } | null>(null)
  const [acceptedEula, setAcceptedEula] = useState(() => localStorage.getItem('hlynk_eula_accepted') === 'true')
  const [platformStats, setPlatformStats] = useState({ totalBusinesses: 1000, averageRating: 4.9 })

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && !requiresRegistration) {
      navigate(user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, requiresRegistration, navigate])

  useEffect(() => {
    platformApi.getStats()
      .then(res => res && res.success && res.data && setPlatformStats(res.data))
      .catch(() => { })
  }, [])

  const urlParams = new URLSearchParams(window.location.search);
  const requestedPlan = (urlParams.get('plan') as 'LITE' | 'PLUS' | 'MAX') || 'LITE';

  const [formData, setFormData] = useState<RegisterFormState>({
    businessName: '', ownerName: '', phone: '', category: '', county: '', location: '', planName: requestedPlan, referredBy: ''
  })

  const handleGoogleAuth = async (credential: string) => {
    setGoogleLoading(true)
    try {
      const res = await authApi.googleAuth({ credential })
      if (res.data.action === 'REQUIRES_REGISTRATION') {
        setGoogleCredential(credential)
        setGoogleProfile(res.data.googleDetails)
        setFormData(f => ({ ...f, ownerName: res.data.googleDetails.name || '' }))
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
      toast.success('Your shop is now live on hynk!')
    } catch (err: any) { toast.error(getErrorMessage(err)) }
    finally { setFormLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        .lp-serif { font-family: 'Cormorant Garamond', serif; }
        .lp-sans { font-family: 'Outfit', sans-serif; }

        .lp-page {
          min-height: 100vh;
          width: 100%;
          background-image: url(${authBg});
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          position: relative;
          overflow-x: hidden;
        }

        .lp-container {
          width: 100%;
          max-width: 1300px;
          min-height: 740px;
          background: white;
          border-radius: 2rem;
          display: flex;
          overflow: hidden;
          box-shadow: 0 60px 150px rgba(0,0,0,0.8);
          position: relative;
          z-index: 10;
        }

        .lp-left {
          flex: 1;
          margin: .5em;
          position: relative;
          border-radius: 2rem;
          background-image: url(${authBg});
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          overflow: hidden;
        }

        .lp-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5));
          z-index: 1;
        }

        .lp-right {
          width: 650px;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          position: relative;
          z-index: 10;
        }

        .lp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(48px, 4vw, 72px);
          line-height: 0.95;
          font-weight: 500;
          color: white;
          margin-bottom: 24px;
        }

        .lp-btn-submit {
          width: 100%; height: 56px;
          background: #000; color: #fff;
          border-radius: 14px; font-weight: 600; font-size: 15px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .lp-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(0,0,0,0.2); }
        .lp-btn-submit:active { transform: translateY(0); }

        @media (max-width: 1024px) {
          .lp-left { display: none; }
          .lp-right { width: 100%; padding: 48px; height: auto; min-height: 600px; }
          .lp-container { min-height: auto; border-radius: 2rem; flex-direction: column; overflow-y: auto; max-height: 95vh; }
        }

        @media (max-width: 500px) {
          .lp-page { padding: 12px; }
          .lp-container { border-radius: 2rem; }
          .lp-right { padding: 40px 24px; }
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
          {/* Left section: The "Window" inside the white card */}
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
                  'Instant Setup, No Fees to Start'
                ].map((item, i) => (
                  <div key={item} className="flex items-center gap-4 text-white group">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/40 transition-colors">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-[15px] font-semibold tracking-wide">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 w-full max-w-[340px]">
              <ReviewPanel />
            </div>
          </div>

          <div className="lp-right">
            <div className="w-full max-w-[380px] mx-auto flex flex-col h-full">
              <div className="flex justify-center mb-12">
                <img src={logo} alt="hlynk" className="h-12 object-contain" />
              </div>

              <AnimatePresence mode="wait">
                {!requiresRegistration ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="text-center mb-10">
                      <h2 className="lp-serif text-[52px] leading-tight text-black mb-2">Welcome Back</h2>
                      <p className="text-[#94a3b8] font-light text-[15px]">Your business dashboard is just one click away.</p>
                    </div>

                    <div className={acceptedEula ? 'opacity-100' : 'opacity-80 pointer-events-none grayscale'}>
                      <GoogleAuthButton text="continue_with" onCredential={handleGoogleAuth} disabled={googleLoading || !acceptedEula} />
                    </div>

                    <div className="flex items-center gap-4 my-8">
                      <div className="h-[1px] flex-1 bg-[#f1f5f9]" />
                      <span className="text-[9px] text-[#cbd5e1] tracking-[0.34em] font-bold uppercase">Biashara Hub</span>
                      <div className="h-[1px] flex-1 bg-[#f1f5f9]" />
                    </div>

                    <label className="flex items-start gap-4 mb-10 cursor-pointer group">
                      <input type="checkbox" className="mt-1 accent-black w-5 h-5 cursor-pointer rounded-md border-gray-200"
                        checked={acceptedEula} onChange={e => {
                          setAcceptedEula(e.target.checked)
                          if (e.target.checked) localStorage.setItem('hlynk_eula_accepted', 'true')
                          else localStorage.removeItem('hlynk_eula_accepted')
                        }} />
                      <span className="text-[12px] px-2 pt-1 leading-relaxed font-light">
                        I agree to the <a href="/terms-conditions" className="text-black hover:text-emerald-600 underline transition-colors">Terms of Service</a> and <a href="/privacy-policy" className="text-black hover:text-emerald-600 underline transition-colors">Privacy Policy</a>
                      </span>
                    </label>

                    <a href="/" className="text-right flex items-center mt-8 cursor-pointer text-black font-normal pl-5 hover:underline">
                      <ArrowLeft size={12} className="mr-2" />
                      Back to Website
                    </a>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
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

                      <button
                        type="button"
                        disabled={formLoading}
                        onClick={() => {
                          setRequiresRegistration(false)
                          setGoogleCredential('')
                          setGoogleProfile(null)
                        }}
                        className="text-left mt-8 cursor-pointer text-black font-normal pl-5 hover:underline"
                      >
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