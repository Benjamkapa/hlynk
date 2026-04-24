import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User, Phone, ArrowRight, Building2, MapPin, Tag, Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../../lib/api/auth";
import { useAuth } from "../../lib/auth/AuthContext";

const COUNTIES = [
  "Nairobi", "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita/Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo/Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira"
];

const CATEGORIES = [
  "Barber & Salon", "Cleaning Services", "Plumbing", "Electrical", "Mechanic", "Moving", "Construction", "Consultancy", "Other"
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'SUPER_ADMIN' ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);
  const planName = (searchParams.get('plan') || 'TRIAL').toUpperCase();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authApi.register(formData);
      toast.success("Account created! Please verify your phone.");
      navigate(`/verify?phone=${encodeURIComponent(formData.phone)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-2xl relative z-10 py-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <img src="/logo.png" alt="hlynk logo" className="h-12 w-auto transition-transform group-hover:scale-105" />
          </Link>

          <h1 className="text-3xl font-bold text-[#161E2A] mb-2">Grow your business</h1>
          <p className="text-[#7A8896] text-sm font-nunito">Join the network of professional service providers</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#E5E9EC] shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7A8896] ml-1">Business Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8896]">
                    <Building2 size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Westlands Salon"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-[#F5F7F8] border border-[#E5E9EC] rounded-2xl py-4 pl-12 pr-4 text-[#161E2A] focus:outline-none focus:ring-2 focus:ring-[#20C997]/20 focus:border-[#20C997] transition-all font-nunito"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7A8896] ml-1">Owner Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8896]">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-[#F5F7F8] border border-[#E5E9EC] rounded-2xl py-4 pl-12 pr-4 text-[#161E2A] focus:outline-none focus:ring-2 focus:ring-[#20C997]/20 focus:border-[#20C997] transition-all font-nunito"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7A8896] ml-1">Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8896]">
                    <Tag size={18} />
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#F5F7F8] border border-[#E5E9EC] rounded-2xl py-4 pl-12 pr-4 text-[#161E2A] focus:outline-none focus:ring-2 focus:ring-[#20C997]/20 focus:border-[#20C997] transition-all appearance-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7A8896] ml-1">County</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8896]">
                    <MapPin size={18} />
                  </div>
                  <select
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className="w-full bg-[#F5F7F8] border border-[#E5E9EC] rounded-2xl py-4 pl-12 pr-4 text-[#161E2A] focus:outline-none focus:ring-2 focus:ring-[#20C997]/20 focus:border-[#20C997] transition-all appearance-none"
                    required
                  >
                    <option value="">Select County</option>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7A8896] ml-1">Exact Location / Area</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8896]">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Greenhouse Mall, 2nd Floor, Adams"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#F5F7F8] border border-[#E5E9EC] rounded-2xl py-4 pl-12 pr-4 text-[#161E2A] focus:outline-none focus:ring-2 focus:ring-[#20C997]/20 focus:border-[#20C997] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7A8896] ml-1">Phone Number (M-Pesa)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8896]">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#F5F7F8] border border-[#E5E9EC] rounded-2xl py-4 pl-12 pr-4 text-[#161E2A] focus:outline-none focus:ring-2 focus:ring-[#20C997]/20 focus:border-[#20C997] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7A8896] ml-1">Email (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8896]">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F5F7F8] border border-[#E5E9EC] rounded-2xl py-4 pl-12 pr-4 text-[#161E2A] focus:outline-none focus:ring-2 focus:ring-[#20C997]/20 focus:border-[#20C997] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7A8896] ml-1">Create Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8896]">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#F5F7F8] border border-[#E5E9EC] rounded-2xl py-4 pl-12 pr-4 text-[#161E2A] focus:outline-none focus:ring-2 focus:ring-[#20C997]/20 focus:border-[#20C997] transition-all"
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#20C997] text-white font-bold shadow-lg shadow-[#20C997]/20 hover:bg-[#1ab785] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-[#F5F7F8] pt-8">
            <p className="text-sm text-[#7A8896] font-ubuntu ">
              Already have an account?{" "}
              <Link to="/login" className="text-[#20C997] font-bold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

