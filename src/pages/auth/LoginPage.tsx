import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Phone, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../../lib/api/auth";
import { useAuth } from "../../lib/auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await authApi.login(formData);
      login(
        { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
        res.data.user
      );
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <img src="/logo.png" alt="hlynk logo" className="h-12 w-auto transition-transform group-hover:scale-105" />
          </Link>
          
          <h1 className="text-3xl font-bold text-[#161E2A] mb-2 font-ubuntu">Welcome back</h1>
          <p className="text-[#7A8896] text-sm font-nunito">Access your business dashboard</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#E5E9EC] shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#7A8896] ml-1 font-mulish">Phone Number</label>
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
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7A8896] font-mulish">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#20C997] hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8896]">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#F5F7F8] border border-[#E5E9EC] rounded-2xl py-4 pl-12 pr-4 text-[#161E2A] focus:outline-none focus:ring-2 focus:ring-[#20C997]/20 focus:border-[#20C997] transition-all"
                  required
                />
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
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-[#F5F7F8] pt-8">
            <p className="text-sm text-[#7A8896]" style={{ fontFamily: "'Mulish', sans-serif" }}>
              Don't have an account?{" "}
              <Link to="/register" className="text-[#20C997] font-bold hover:underline">
                Create One
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
