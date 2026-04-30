import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User, Phone, ArrowRight, Building2, MapPin, Tag, Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../../lib/api/auth";
import { useAuth } from "../../lib/auth/AuthContext";
import { getErrorMessage } from "../../lib/utils/error";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { decodeGoogleCredential, type DecodedGoogleCredential } from "../../lib/google/identity";

const COUNTIES = [
  "Nairobi", "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita/Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo/Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira"
];

const CATEGORIES = [
  "Retail Store", "Barber & Salon", "Cleaning Services", "Plumbing", "Electrical", "Mechanic", "Consultancy", "Other"
];

type RegisterFormState = {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  password: string;
  category: string;
  county: string;
  location: string;
  planName: "TRIAL" | "BASIC";
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'SUPER_ADMIN' ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const planName = (searchParams.get('plan') || 'TRIAL').toUpperCase() === 'BASIC' ? 'BASIC' : 'TRIAL';
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleCredential, setGoogleCredential] = useState("");
  const [googleProfile, setGoogleProfile] = useState<DecodedGoogleCredential | null>(null);
  const [formData, setFormData] = useState<RegisterFormState>({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    category: "",
    county: "",
    location: "",
    planName: planName,
  });

  const finishLogin = (data: { accessToken: string; refreshToken: string; user: any }) => {
    login(
      {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
      data.user,
    );

    navigate(data.user.role === 'SUPER_ADMIN' ? "/admin" : "/dashboard", { replace: true });
  };

  const handleGoogleCredential = async (credential: string) => {
    setGoogleLoading(true);

    try {
      const decoded = decodeGoogleCredential(credential);
      setGoogleCredential(credential);
      setGoogleProfile(decoded);
      setFormData((current) => ({
        ...current,
        ownerName: current.ownerName || decoded?.name || current.ownerName,
        email: decoded?.email || current.email,
      }));
      toast.success("Google account connected. Finish the business details below.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const clearGoogleSelection = () => {
    setGoogleCredential("");
    setGoogleProfile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (googleCredential) {
        const res = await authApi.googleAuth({
          credential: googleCredential,
          registration: {
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            phone: formData.phone,
            category: formData.category,
            county: formData.county,
            location: formData.location,
            planName: formData.planName as "TRIAL" | "BASIC",
          },
        });

        toast.success("Account created with Google.");
        finishLogin(res.data);
        return;
      }

      await authApi.register(formData);
      toast.success("Account created! Please verify your phone.");
      navigate(`/verify?phone=${encodeURIComponent(formData.phone)}`);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isBusy = loading || googleLoading;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[640px] space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <img src="/logo.png" alt="HudumaLynk" className="h-14 w-auto mx-auto" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter pt-1 font-ubuntu">Create Account</h1>
          <p className="text-slate-500 font-medium text-sm">Join the network of professional service providers</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">

          {googleCredential && (
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700">Google Sign-Up Active</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {googleProfile?.email || "Google account connected"} will be used for sign-in.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Finish the business profile below and we&apos;ll skip password creation and phone OTP.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearGoogleSelection}
                  className="shrink-0 rounded-full border border-emerald-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 transition-colors hover:bg-white"
                >
                  Use OTP Instead
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. Westlands Salon"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Owner Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* County */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">County</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <select
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select County</option>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:text-slate-300 hl-mono"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:text-slate-300"
                    disabled={Boolean(googleCredential)}
                  />
                </div>
                {googleCredential && (
                  <p className="px-1 text-xs font-medium text-slate-400">Your verified Google email will be used for this account.</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Exact Location / Area</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. Greenhouse Mall, 2nd Floor, Adams"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              {!googleCredential ? (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Create Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                      type="password"
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:text-slate-300"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              ) : (
                <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password Skipped</p>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    This account will rely on Google sign-in instead of password creation and OTP verification.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-5 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isBusy ? <Loader2 size={16} className="animate-spin" /> : googleCredential ? 'Create With Google' : 'Create Business Account'}
              {!isBusy && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {!googleCredential && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-300">Or continue with</span>
                </div>
              </div>
              <GoogleAuthButton text="signup_with" disabled={isBusy} onCredential={handleGoogleCredential} />
            </>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-300">Already a member?</span>
            </div>
          </div>

          <Link 
            to="/login" 
            className="w-full py-1 border-2 border-slate-50 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            Log In To Portal
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-[13px] font-thin text-slate-900 tracking-widest">
          Secure encryption enabled — &copy; {new Date().getFullYear()} hlynk
        </p>
      </div>
    </div>
  );
}
