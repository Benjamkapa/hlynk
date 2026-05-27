import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  LayoutDashboard, Calendar, BarChart2, Users,
  Settings, LogOut, Package, ShoppingCart,
  Zap, PanelLeftClose, PanelLeftOpen, Clock, AlertTriangle,
  Lock, Code, Shield, X, Star, Loader2, Terminal, ShieldCheck
} from "lucide-react";
import { useLocation, Outlet, NavLink, Link } from "react-router-dom";
import TopNav from "./TopNav";
import { providersApi } from "../../lib/api/providers";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  to: string;
  label: string;
  icon: any;
  permission?: string;
  role?: 'PROVIDER' | 'SUPER_ADMIN' | 'STAFF' | 'CUSTOMER';
  plan?: 'PLUS' | 'MAX';
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function ProviderLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Inactivity timer: 5 minutes (300,000 ms) - ONLY ON MOBILE
  useEffect(() => {
    const isSmallScreen = window.innerWidth < 1024;
    if (!isSmallScreen) {
      setIsSidebarOpen(true);
      return;
    }

    let timer: any;
    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsSidebarOpen(false);
      }, 300000);
    };

    if (isSidebarOpen) {
      resetTimer();
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('click', resetTimer);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isSidebarOpen]);

  // Ensure sidebar is open on window resize to desktop
  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navGroups: NavGroup[] = [
    {
      label: 'My Shop',
      items: [
        { to: '/dashboard/sales/new', label: 'New Sale', icon: Zap, permission: 'sales' },
        { to: '/dashboard/sales', label: 'Sales History', icon: Package, end: true, permission: 'sales' },
        { to: '/dashboard/expenses', label: 'Track Expenses', icon: ShoppingCart, permission: 'sales' },
      ],
    },
    {
      label: 'Stock & People',
      items: [
        { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true, permission: 'overview' },
        { to: '/dashboard/products', label: 'Products & Services', icon: Package, permission: 'products' },
        { to: '/dashboard/customers', label: 'Customers', icon: Users, permission: 'customers' },
      ],
    },
    {
      label: 'Reports',
      items: [
        { to: '/dashboard/reports', label: 'Business Reports', icon: BarChart2, permission: 'reports', plan: 'PLUS' }
      ],
    },
    {
      label: 'Team',
      items: [
        { to: '/dashboard/staff', label: 'Staff Management', icon: Users, permission: 'staff', plan: 'PLUS' },
      ],
    },
    {
      label: 'System',
      items: [
        { to: '/dashboard/logs', label: 'Staff Activity', icon: ShieldCheck, permission: 'logs', plan: 'MAX' },
        { to: '/dashboard/subscription', label: 'Billing Plan', icon: Calendar, role: 'PROVIDER' },
        { to: '/dashboard/developer', label: 'M-Pesa Setup', icon: Terminal, role: 'PROVIDER', plan: 'PLUS' },
      ],
    },
  ];

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.map(item => {
      // Super admin sees everything as unlocked
      if (user?.role === 'SUPER_ADMIN') return { ...item, isLocked: false }

      // If user is STAFF, we hide everything they don't have permission for
      if (user?.role === 'STAFF') {
        // Hlynk Rule: Staff ONLY see what they are allowed to use. 
        // If they don't have the permission, hide it (return null).
        if (item.permission && !user.permissions?.includes(item.permission)) {
          return null;
        }

        // Administrative/Owner-only areas are always hidden from staff
        if (item.to.includes('subscription') || item.to.includes('developer') || (item as any).role === 'PROVIDER') {
          return null;
        }
      }

      // Default lock state for everyone else (Providers see everything but locked)
      let isLocked = false

      const currentPlanRaw = user?.subscription?.planName || 'LITE'
      const currentPlan = currentPlanRaw.toUpperCase()
      const isTrial = Number(user?.subscription?.status) === 2 || user?.subscription?.status === 'TRIAL'

      const getPlanWeight = (p: string) => {
        if (p.includes('MAX')) return 3
        if (p.includes('PLUS')) return 2
        return 1
      }

      const userWeight = getPlanWeight(currentPlan)
      const requiredWeight = item.plan ? getPlanWeight(item.plan) : 1

      if (userWeight < requiredWeight && user?.role !== 'STAFF') {
        isLocked = true
      }

      // Role restrictions for non-staff (e.g. Providers seeing special roles)
      if (user?.role !== 'STAFF' && (item as any).role && user?.role !== (item as any).role) {
        isLocked = true
      }

      return { ...item, isLocked }
    }).filter((item): item is any => item !== null)
  })).filter(group => group.items.length > 0);

  const isTrial = Number(user?.subscription?.status) === 2 || user?.subscription?.status === 'TRIAL';
  const targetEndDate = isTrial ? user?.subscription?.trialEndDate : user?.subscription?.endDate;

  const timeRemainingMs = targetEndDate
    ? new Date(targetEndDate).getTime() - new Date().getTime()
    : 0;

  const daysRemaining = Math.max(0, Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24)));
  const isCritical = daysRemaining < 3 && timeRemainingMs > 0;
  const isExpiringSoon = daysRemaining <= 5 && timeRemainingMs > 0;
  const isExpired = Number(user?.subscription?.status) === 1;
  const isTrialExpired = isTrial && isExpired;

  useEffect(() => {
    // Unique key for the current expiry period
    const reviewKey = `hlynk_reviewed_${user?.tenantId}_${targetEndDate}`;
    const alreadyReviewed = localStorage.getItem(reviewKey);

    if (user?.role === 'PROVIDER' && (isExpired || isTrialExpired) && !alreadyReviewed) {
      setShowReviewModal(true);
    } else if (isExpiringSoon && !alreadyReviewed) {
      const timer = setTimeout(() => setShowReviewModal(true), 5000); // 5s delay for better UX
      return () => clearTimeout(timer);
    }
  }, [user, isExpiringSoon, isExpired, isTrialExpired, targetEndDate]);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return toast.error("Please select a rating");
    setIsSubmittingReview(true);
    try {
      await providersApi.submitReview({ rating: reviewRating, reviewText });
      toast.success("Thank you for your feedback!");

      const reviewKey = `hlynk_reviewed_${user?.tenantId}_${targetEndDate}`;
      localStorage.setItem(reviewKey, 'true');
      setShowReviewModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div className={`flex flex-col h-full bg-white transition-all duration-300 ${collapsed ? 'w-[60px] lg:w-[68px]' : 'w-[280px]'}`}>
      <div className={`h-16 lg:h-20 flex items-center ${collapsed ? 'justify-center' : 'px-4'}`}>
        <div className="flex-shrink-0">
          {collapsed ? (
            <img src="/fav.png" alt="hlynk" className="h-6 w-6 lg:h-7 lg:w-7 transition-all object-contain" />
          ) : (
            <img src="/logo.png" alt="hlynk" className="h-6 lg:h-7 w-auto transition-all object-contain" />
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-4 overflow-y-auto overflow-x-hidden pt-4 custom-scrollbar">
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 mb-2 whitespace-nowrap"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {group.items.map((item) => {
                const ItemContent = (
                  <>
                    <div className="relative">
                      <item.icon className={`transition-all ${collapsed ? 'w-[16px] lg:w-[18px] h-[16px] lg:h-[18px]' : 'w-[18px] h-[18px] shrink-0'}`} />
                      {item.isLocked && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                          <Lock size={6} className="text-white fill-white" />
                        </div>
                      )}
                    </div>
                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="text-sm font-bold whitespace-nowrap truncate">{item.label}</span>
                        {item.isLocked && (
                          <span className="text-[7px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase tracking-widest ml-2">
                            {item.plan === 'MAX' ? 'Business Pro' : 'Growth'}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                );

                if (item.isLocked) {
                  return (
                    <div
                      key={item.label}
                      className={`hl-sidebar-item opacity-60 grayscale-[0.8] cursor-not-allowed ${collapsed ? 'justify-center px-0' : ''}`}
                      title={`${item.plan} required`}
                    >
                      {ItemContent}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `hl-sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    {ItemContent}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile Summary */}
      <div className="p-4 mt-auto border-t border-slate-50">
        <AnimatePresence>
          {!collapsed && (
            <div
              className="bg-emerald-900 rounded-[.5rem] p-3 shadow-md shadow-emerald-950/20 mb-3 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">
                    {user?.subscription?.planName === 'MAX' ? 'Business Pro' : user?.subscription?.planName === 'PLUS' ? 'Growth' : 'Starter'} Tier
                  </p>
                  {isCritical && <AlertTriangle size={10} className="text-amber-400 animate-pulse" />}
                </div>
                <CountdownTimer expiryDate={targetEndDate} />
              </div>
            </div>
          )}
        </AnimatePresence>
        <div className="flex gap-2">
          <NavLink to="/dashboard/settings" className="flex-1 h-12 bg-slate-50 rounded-[.5rem] flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100">
            <Settings size={20} />
          </NavLink>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden hl-dash bg-slate-50/50">

      {/* ── REVIEW MODAL ── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[.5rem] w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
            {!isTrialExpired && (
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  const reviewKey = `hlynk_reviewed_${user?.tenantId}_${targetEndDate}`;
                  localStorage.setItem(reviewKey, 'true');
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            )}

            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="fill-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                {isTrialExpired ? "Your Trial has Completed!" : "How are we doing?"}
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {isTrialExpired
                  ? "To keep using hlynk and help us grow, please share a quick rating of your experience so far!"
                  : "Your subscription is renewing soon. We'd love to know how hlynk has helped your business grow!"}
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={40}
                    className={`${reviewRating >= star ? 'text-[#0D4A3E] fill-[#0D4A3E]' : 'text-slate-200 fill-slate-200'} transition-colors`}
                  />
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Your Feedback (Optional)</label>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="What do you love? What could we improve?"
                className="w-full bg-slate-50 border border-slate-100 rounded-[.5rem] p-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none h-28"
              />
            </div>

            <button
              onClick={handleSubmitReview}
              disabled={isSubmittingReview || reviewRating === 0}
              className="w-full h-14 bg-[#0D4A3E] text-white rounded-[.5rem] font-black text-sm uppercase tracking-widest hover:bg-[#0A3D33] transition-all flex items-center justify-center shadow-xl shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingReview ? <Loader2 className="animate-spin" size={20} /> : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* ── MOBILE BACKDROP ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPanEnd={(_, info) => {
          if (window.innerWidth >= 1024) return;
          // Swipe Right to Expand
          if (isCollapsed && !isMobileExpanded && info.offset.x > 40) {
            setIsMobileExpanded(true);
          }
          // Swipe Left to Collapse
          if (isMobileExpanded && info.offset.x < -40) {
            setIsMobileExpanded(false);
          }
        }}
        className={`
          flex flex-col transition-all duration-300
          fixed inset-y-0 left-0 z-[70] lg:relative lg:translate-x-0
          ${!isSidebarOpen ? '-translate-x-full opacity-0 w-0' : 'translate-x-0 opacity-100'}
          ${isCollapsed && !isHovered && !isMobileExpanded ? 'w-[60px] lg:w-[64px]' : 'w-[312px]'}
        `}
      >
        <div className={`
          absolute inset-y-0 left-0 flex flex-col bg-white
          transition-all duration-300 ease-in-out overflow-hidden
          ${isCollapsed && isHovered ? 'w-[280px] shadow-2xl z-[60]' : 'w-full'}
          ${window.innerWidth < 1024 ? 'hl-sidebar-floating' : 'border-r border-slate-100'}
        `}>
          <SidebarContent collapsed={isCollapsed && !isHovered && !isMobileExpanded} />
        </div>
      </motion.aside>

      {/* ── LAUNCHER ICON ── */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-8 left-8 z-[100] h-14 w-14 bg-[#0D4A3E] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all animate-in zoom-in-0 duration-300 "
        >
          <PanelLeftOpen size={24} />
        </button>
      )}


      {/* ── MAIN CONTENT ── */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300 ${isSidebarOpen && isCollapsed && !isHovered && !isMobileExpanded && window.innerWidth < 1024 ? 'pl-[60px]' : 'pl-0'}`}>
        {isCritical && user?.role === 'PROVIDER' && (
          <div className="bg-red-600 text-white px-8 py-3 flex items-center justify-between animate-in slide-in-from-top duration-700 z-[100] shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <AlertTriangle size={18} className="animate-bounce" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">
                  {isTrial ? "Critical: Free Trial Expiry Imminent" : "Critical: Subscription Expiry Imminent"}
                </p>
                <p className="text-[9px] font-medium opacity-80 uppercase tracking-widest leading-none">
                  {isTrial
                    ? `Your free trial expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Purchase a plan now to keep your business running smoothly.`
                    : `Your access expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Renew now to avoid business disruption.`}
                </p>
              </div>
            </div>
            <Link to="/dashboard/subscription" className="px-6 py-2 bg-white text-red-600 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-lg active:scale-95">
              {isTrial ? "Upgrade Now" : "Top Up Now"}
            </Link>
          </div>
        )}
        <TopNav
          isMobileOpen={isMobileOpen}
          onMobileMenuToggle={undefined}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          showMail={true}
          extraActions={
            <Link to="/dashboard/sales/new" className="hidden lg:flex items-center gap-2 px-6 py-3 bg-[#0D4A3E] text-white rounded-[.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#064E3B] hover:-translate-y-0.5 transition-all">
              <Zap size={16} /> Record Sale
            </Link>
          }
        />

        <main className="flex-1 overflow-y-auto px-8 lg:px-12 py-12 bg-slate-50/30 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function CountdownTimer({ expiryDate }: { expiryDate: string | undefined }) {
  const calculate = (date: string) => {
    const distance = new Date(date).getTime() - new Date().getTime();
    if (distance < 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(distance / (1000 * 60 * 60 * 24)),
      h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      s: Math.floor((distance % (1000 * 60)) / 1000)
    };
  };

  const [timeLeft, setTimeLeft] = useState(() => expiryDate ? calculate(expiryDate) : null);

  useEffect(() => {
    if (!expiryDate) return;
    const timer = setInterval(() => setTimeLeft(calculate(expiryDate)), 1000);
    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!timeLeft) return (
    <div className="h-8 flex items-center justify-center gap-1">
      <div className="w-1 h-4 bg-emerald-800 animate-pulse rounded-full" />
      <div className="w-1 h-6 bg-emerald-800 animate-pulse rounded-full delay-75" />
      <div className="w-1 h-4 bg-emerald-800 animate-pulse rounded-full delay-150" />
    </div>
  );

  return (
    <div className="flex justify-between gap-1">
      {[
        { v: timeLeft.d, l: 'd' },
        { v: timeLeft.h, l: 'h' },
        { v: timeLeft.m, l: 'm' },
        { v: timeLeft.s, l: 's' }
      ].map((t, i) => (
        <div key={i} className="flex-1 flex flex-col items-center bg-white/5 rounded-[.5rem] py-1 border border-white/5">
          <span className="text-[11px] font-black text-white hl-mono leading-none">{t.v.toString().padStart(2, '0')}</span>
          <span className="text-[6px] font-black text-emerald-400 uppercase opacity-50">{t.l}</span>
        </div>
      ))}
    </div>
  );
}
