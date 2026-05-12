import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, MapPin, Phone, Tag,
  Loader2, Check, ShieldCheck, Lock, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '../../lib/api/auth'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'
import { platformApi, type PlatformReview } from '../../lib/api/platform'
import StarRating from '../../components/shared/StarRating'

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
  'Electrical', 'Mechanic', 'Consultancy', 'Other',
]

type RegisterFormState = {
  businessName: string; ownerName: string; phone: string
  category: string; county: string; location: string; planName: 'STARTER'
}

function ReviewCard({ review }: { review: any }) {
  return (
    <div className="flex flex-col gap-3">
      <StarRating rating={review.rating || 5} size={11} />
      <p className="text-[13px] text-white leading-relaxed font-light italic opacity-90 drop-shadow-sm">
        "{review.comment}"
      </p>
      <div className="text-[11px] font-semibold text-white/50">
        {review.name} {review.businessName ? `· ${review.businessName}` : ''}
      </div>
    </div>
  )
}

function ReviewPanel() {
  const [reviews, setReviews] = useState<PlatformReview[]>([])
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Fetch directly from database platform_reviews table
    platformApi.getReviews({ limit: 10 })
      .then(res => {
        if (res.items?.length) {
          setReviews(res.items)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch reviews:', err)
      })
  }, [])

  useEffect(() => {
    if (reviews.length <= 1) return
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % reviews.length)
        setVisible(true)
      }, 400)
    }, 6000)
    return () => clearInterval(t)
  }, [reviews.length])

  // Only render if we have actual database reviews
  if (reviews.length === 0) return null

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6 shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-white/40">From the Community</span>
        <div className="h-[1px] flex-1 bg-white/10" />
      </div>
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
        <ReviewCard review={reviews[idx]} />
      </div>
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
  const { login } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [requiresRegistration, setRequiresRegistration] = useState(false)
  const [googleCredential, setGoogleCredential] = useState('')
  const [googleProfile, setGoogleProfile] = useState<{ email: string; name: string; picture: string } | null>(null)
  const [acceptedEula, setAcceptedEula] = useState(() => localStorage.getItem('hlynk_eula_accepted') === 'true')
  const [platformStats, setPlatformStats] = useState({ totalBusinesses: 1000, averageRating: 4.9 })

  useEffect(() => {
    // Fetch stats from DB
    platformApi.getStats()
      .then(res => res && res.success && res.data && setPlatformStats(res.data))
      .catch(() => { })
  }, [])

  const [formData, setFormData] = useState<RegisterFormState>({
    businessName: '', ownerName: '', phone: '', category: '', county: '', location: '', planName: 'STARTER',
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
      toast.success('Your shop is now live on HudumaLynk!')
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
          background-color: #000;
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
          margin: 2px;
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
          border: 3px solid white;
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
          width: 540px;
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
          font-weight: 300;
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
          .lp-right { width: 100%; padding: 48px; }
          .lp-container { min-height: auto; border-radius: 2rem; }
        }

        @media (max-width: 500px) {
          .lp-page { padding: 12px; }
          .lp-container { border-radius: 2rem; }
          .lp-right { padding: 40px 24px; }
        }
      `}</style>

      <div className="lp-page lp-sans">
        <div className="lp-container">

          {/* Left section: The "Window" inside the white card */}
          <div className="lp-left hidden lg:flex">
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-4 mb-16">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                   <Sparkles size={12} className="text-white" />
                   <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-white">Platform Goal</span>
                </div>
                <div className="h-[1px] w-24 bg-white/20" />
              </div>
              
              <h1 className="lp-title">
                The Smartest Way <br /> to Grow <br /> Your Biashara
              </h1>
              
              <p className="text-xl text-white font-light opacity-90 leading-relaxed max-w-sm drop-shadow-lg mb-10">
                Stop the guesswork. Join 1,000+ owners using modern tracking to manage stock and double their profits.
              </p>

              <div className="flex flex-col gap-5">
                 {[
                   'M-Pesa Friendly Sales Tracking',
                   'Zero Manual Record Books Needed',
                   'Automated Insights to Cut Costs',
                   'Instant Setup, No Fees to Start'
                 ].map((item, i) => (
                   <div key={item} className="flex items-center gap-4 text-white group" style={{ opacity: 0, animation: `lp-text-in 0.8s forwards ${0.7 + (i * 0.1)}s` }}>
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

          {/* Right section: the white form */}
          <div className="lp-right">
            <div className="w-full max-w-[380px] mx-auto flex flex-col h-full">

              <div className="flex justify-center mb-12">
                <img src={logo} alt="HudumaLynk" className="h-12 object-contain sm:h-12 md:h-12 lg:h-12" />
              </div>

              {!requiresRegistration ? (
                <>
                  <div className="text-center mb-10">
                    <h2 className="lp-serif text-[52px] leading-tight text-black mb-2">Welcome Back</h2>
                    <p className="text-[#94a3b8] font-light text-[15px]">Your business dashboard is just one click away.</p>
                  </div>

                  <div className={acceptedEula ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}>
                    <GoogleAuthButton text="continue_with" onCredential={handleGoogleAuth} disabled={googleLoading || !acceptedEula} />
                  </div>

                  <div className="flex items-center gap-4 my-8">
                    <div className="h-[1px] flex-1 bg-[#f1f5f9]" />
                    <span className="text-[9px] text-[#cbd5e1] tracking-[0.34em] font-bold uppercase">Biashara Hub</span>
                    <div className="h-[1px] flex-1 bg-[#f1f5f9]" />
                  </div>

                  <div className="bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl p-5 mb-8 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-black border border-gray-100">
                      <ShieldCheck size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Security Guaranteed</div>
                      <div className="text-[13px] text-gray-500 font-light leading-none">Your business data is 100% private.</div>
                    </div>
                  </div>

                  <label className="flex items-start gap-4 mb-10 cursor-pointer group">
                    <input type="checkbox" className="mt-1 accent-black w-5 h-5 cursor-pointer rounded-md border-gray-200"
                      checked={acceptedEula} onChange={e => {
                        setAcceptedEula(e.target.checked)
                        if (e.target.checked) localStorage.setItem('hlynk_eula_accepted', 'true')
                        else localStorage.removeItem('hlynk_eula_accepted')
                      }} />
                    <span className="text-[12px] px-2 pt-1 leading-relaxed font-light">
                      I agree to the <a href="/terms-conditions" className="text-black border-b border-gray-100 hover:border-black transition-colors">Terms of Service</a> and <a href="/privacy-policy" className="text-black border-b border-gray-100 hover:border-black transition-colors">Privacy Policy</a>
                    </span>
                  </label>

                  <div className="mt-auto pt-8 border-t border-gray-50">
                    <p className="text-[11px] text-[#cbd5e1] tracking-[0.1em] font-bold uppercase text-center">
                      Join {platformStats.totalBusinesses?.toLocaleString()}+ Kenyan businesses growing today.
                    </p>
                  </div>
                </>
              ) : (
                <form onSubmit={handleRegistrationSubmit} className="flex flex-col h-full">
                  <div className="text-center mb-8">
                    <h2 className="lp-serif text-[42px] leading-tight text-black mb-2">Setup Shop</h2>
                    <p className="text-gray-400 font-light text-sm">Tell us about your biashara to get started.</p>
                  </div>

                  <div className="bg-[#f8fafc] rounded-2xl p-4 mb-6 flex items-center gap-4 border border-[#f1f5f9]">
                    {googleProfile?.picture && <img src={googleProfile.picture} alt="" className="w-11 h-11 rounded-full border-2 border-white shadow-md" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-widest mb-1">Verify Ownership</div>
                      <div className="text-[14px] text-black font-bold truncate">{googleProfile?.email}</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-lg">
                      <Check size={12} color="white" strokeWidth={4} />
                    </div>
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
                    <Field label="M-Pesa Number" icon={Phone}>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputCls} placeholder="07xx xxx xxx" required />
                    </Field>
                  </div>

                  <button type="submit" disabled={formLoading} className="lp-btn-submit">
                    {formLoading ? <Loader2 size={18} className="animate-spin" /> : 'Launch My biashara'}
                  </button>

                  <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-200 tracking-widest font-bold uppercase">
                      Instant Setup · No Credit Card Required · Fully Automated
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}