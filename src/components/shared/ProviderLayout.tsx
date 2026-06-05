import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  LayoutDashboard, Calendar, BarChart2, Users,
  Settings, LogOut, Package, ShoppingCart,
  Zap, Clock, AlertTriangle,
  Lock, Shield, X, Star, Loader2, Terminal, ShieldCheck, Receipt, CreditCard
} from "lucide-react";
import { useLocation, Outlet, NavLink, Link } from "react-router-dom";
import TopNav from "./TopNav";
import { providersApi } from "../../lib/api/providers";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const EtimsIcon = ({ className, size = 20 }: { className?: string, size?: number }) => (
  <img src="https://etims.kra.go.ke/assets/images/logo.jpg" alt="eTIMS" style={{ width: size, height: size }} className={`${className || ''} object-contain mix-blend-darken shrink-0`} />
);

const MpesaIcon = ({ className, size = 20 }: { className?: string, size?: number }) => (
  <img src="https://monisnapcontent.kinsta.cloud/wp-content/uploads/2021/09/M-PESA_LOGO-640x467.png?v=1632335437" alt="M-Pesa" style={{ width: size, height: size }} className={`${className || ''} object-contain shrink-0`} />
);

const KcbIcon = ({ className, size = 20 }: { className?: string, size?: number }) => (
  <img src="https://buni.kcbgroup.com/_nuxt/logo.71b8fc4b.svg" alt="KCB" style={{ width: size, height: size }} className={`${className || ''} object-contain shrink-0`} />
);

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

// ─── Breakpoint hook ───────────────────────────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isDesktop;
}

export default function ProviderLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDesktop = useIsDesktop();

  /**
   * Sidebar state — unified, two-axis model:
   *
   *  Desktop:
   *    isCollapsed = true  → icon rail (68px)
   *    isCollapsed = false → full panel (280px)
   *    isHovered = true while isCollapsed → expand temporarily (no click needed)
   *
   *  Mobile:
   *    mobileOpen = false  → icon rail slides in from left (60px)
   *    mobileOpen = true   → full drawer (280px) + backdrop
   *    click-away / nav → mobileOpen = false
   */
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Inactivity auto-collapse on mobile (5 min)
  useEffect(() => {
    if (isDesktop || !mobileOpen) return;
    let t: ReturnType<typeof setTimeout>;
    const reset = () => { clearTimeout(t); t = setTimeout(() => setMobileOpen(false), 300_000); };
    reset();
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("click", reset);
    return () => { clearTimeout(t); window.removeEventListener("mousemove", reset); window.removeEventListener("keydown", reset); window.removeEventListener("click", reset); };
  }, [mobileOpen, isDesktop]);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const navGroups: NavGroup[] = [
    {
      label: 'Main',
      items: [
        { to: '/dashboard/sales/new', label: 'Sell Now', icon: Zap, permission: 'sales' },
        { to: '/dashboard/sales', label: 'History', icon: Package, end: true, permission: 'sales' },
        { to: '/dashboard/expenses', label: 'Expenses', icon: ShoppingCart, permission: 'sales' },
      ],
    },
    {
      label: 'Store & Staff',
      items: [
        { to: '/dashboard', label: 'Home', icon: LayoutDashboard, end: true, permission: 'overview' },
        { to: '/dashboard/products', label: 'Items & Price', icon: Package, permission: 'products' },
        { to: '/dashboard/customers', label: 'Customers', icon: Users, permission: 'customers' },
      ],
    },
    {
      label: 'Performance',
      items: [
        { to: '/dashboard/reports', label: 'View Growth', icon: BarChart2, permission: 'reports', plan: 'PLUS' }
      ],
    },
    {
      label: 'Team',
      items: [
        { to: '/dashboard/staff', label: 'Manage Staff', icon: Users, permission: 'staff', plan: 'PLUS' },
      ],
    },
    {
      label: 'Settings',
      items: [
        { to: '/dashboard/logs', label: 'Staff Activity', icon: ShieldCheck, permission: 'logs', plan: 'MAX' },
        { to: '/dashboard/subscription', label: 'My Plan', icon: Calendar, role: 'PROVIDER' },
        { to: '/dashboard/developer', label: 'Payment Gateway', icon: CreditCard, role: 'PROVIDER', plan: 'PLUS' },
        { to: '/dashboard/etims', label: 'KRA eTIMS', icon: Receipt, role: 'PROVIDER' },
      ],
    },
  ];

  const getPlanWeight = (p: string) => p.includes('MAX') ? 3 : p.includes('PLUS') ? 2 : 1;

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.map(item => {
      if (user?.role === 'SUPER_ADMIN') return { ...item, isLocked: false };

      if (user?.role === 'STAFF') {
        if (item.permission && !user.permissions?.includes(item.permission)) return null;
        if (item.to.includes('subscription') || item.to.includes('developer') || (item as any).role === 'PROVIDER') return null;
      }

      let isLocked = false;
      const currentPlan = (user?.subscription?.planName || 'LITE').toUpperCase();
      const userWeight = getPlanWeight(currentPlan);
      const requiredWeight = item.plan ? getPlanWeight(item.plan) : 1;
      if (userWeight < requiredWeight && user?.role !== 'STAFF') isLocked = true;
      if (user?.role !== 'STAFF' && (item as any).role && user?.role !== (item as any).role) isLocked = true;

      return { ...item, isLocked };
    }).filter((item): item is any => item !== null)
  })).filter(group => group.items.length > 0);

  // Subscription helpers
  const isTrial = Number(user?.subscription?.status) === 2 || user?.subscription?.status === 'TRIAL';
  const targetEndDate = isTrial ? user?.subscription?.trialEndDate : user?.subscription?.endDate;
  const timeRemainingMs = targetEndDate ? new Date(targetEndDate).getTime() - Date.now() : 0;
  const daysRemaining = Math.max(0, Math.ceil(timeRemainingMs / 86_400_000));
  const isCritical = daysRemaining < 3 && timeRemainingMs > 0;
  const isExpiringSoon = daysRemaining <= 5 && timeRemainingMs > 0;
  const isExpired = Number(user?.subscription?.status) === 1;
  const isTrialExpired = isTrial && isExpired;

  useEffect(() => {
    const reviewKey = `hlynk_reviewed_${user?.tenantId}_${targetEndDate}`;
    if (localStorage.getItem(reviewKey)) return;
    if (user?.role === 'PROVIDER' && (isExpired || isTrialExpired)) { setShowReviewModal(true); return; }
    if (isExpiringSoon) { const t = setTimeout(() => setShowReviewModal(true), 5000); return () => clearTimeout(t); }
  }, [user, isExpiringSoon, isExpired, isTrialExpired, targetEndDate]);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return toast.error("Please select a rating");
    setIsSubmittingReview(true);
    try {
      await providersApi.submitReview({ rating: reviewRating, reviewText });
      toast.success("Thank you for your feedback!");
      localStorage.setItem(`hlynk_reviewed_${user?.tenantId}_${targetEndDate}`, 'true');
      setShowReviewModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // The real "is expanded" state for rendering sidebar content
  const sidebarExpanded = isDesktop
    ? (!isCollapsed || isHovered)   // desktop: manual toggle OR hover
    : mobileOpen;                   // mobile: tap toggle only

  // Sidebar width values
  const RAIL_W = isDesktop ? 68 : 60;
  const FULL_W = 280;

  // ── Sidebar inner content ────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`h-16 lg:h-20 flex items-center flex-shrink-0 ${sidebarExpanded ? 'px-5' : 'justify-center'}`}>
        <AnimatePresence mode="wait" initial={false}>
          {sidebarExpanded ? (
            <motion.div
              key="full"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-3 overflow-hidden"
            >
              <img src="/fav.png" alt="hlynk" className="h-8 w-8 lg:h-9 lg:w-9 object-contain" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-slate-900 truncate uppercase tracking-tight leading-none">
                  {user?.businessName}
                </span>
                <span className="text-[10px] font-bold text-emerald-600/40 leading-none mt-1 uppercase tracking-[0.2em]">
                  Management
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.img
              key="icon"
              src="/fav.png"
              alt="hlynk"
              className="h-6 w-6 lg:h-7 lg:w-7 object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto overflow-x-hidden pt-2 custom-scrollbar">
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.p
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mb-2 whitespace-nowrap"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const iconEl = (
                  <div className="relative flex-shrink-0">
                    <item.icon className={`${sidebarExpanded ? 'w-[18px] h-[18px]' : 'w-[18px] h-[18px] lg:w-[20px] lg:h-[20px]'}`} />
                    {item.isLocked && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Lock size={6} className="text-white fill-white" />
                      </div>
                    )}
                  </div>
                );

                const labelEl = sidebarExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between flex-1 min-w-0 ml-3"
                  >
                    <span className="text-sm font-bold whitespace-nowrap truncate">{item.label}</span>
                    {item.isLocked && (
                      <span className="text-[7px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase tracking-widest ml-2 flex-shrink-0">
                        {item.plan === 'MAX' ? 'Pro' : 'Growth'}
                      </span>
                    )}
                  </motion.div>
                );

                // Tooltip shown only on collapsed desktop rail
                const tooltip = !sidebarExpanded && isDesktop && (
                  <div className="absolute left-[calc(100%+10px)] bg-slate-900 text-white px-3 py-1.5 rounded-[.4rem] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 invisible group-hover:visible translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[200] shadow-2xl">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900" />
                  </div>
                );

                const baseClass = `group relative flex items-center rounded-[.45rem] transition-all duration-150 ${sidebarExpanded ? 'px-3 py-2.5' : 'justify-center py-2.5 px-0'}`;

                if (item.isLocked) {
                  return (
                    <div key={item.label} className={`${baseClass} opacity-50 cursor-not-allowed`}>
                      {iconEl}{labelEl}{tooltip}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `${baseClass} ${isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`
                    }
                  >
                    {iconEl}{labelEl}{tooltip}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`flex-shrink-0 p-3 mt-auto border-t border-slate-100 ${sidebarExpanded ? '' : 'flex justify-center'}`}>
        <AnimatePresence>
          {sidebarExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mb-3"
            >
              <Link to="/dashboard/subscription" className="block bg-emerald-900 rounded-[.5rem] p-3 hover:bg-emerald-800 transition-colors shadow-lg relative group">
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors rounded-[.5rem]" />
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">
                    {user?.subscription?.planName === 'MAX' ? 'Business Pro' : user?.subscription?.planName === 'PLUS' ? 'Growth' : 'Starter'} Tier
                  </p>
                  {isCritical && <AlertTriangle size={10} className="text-amber-400 animate-pulse" />}
                </div>
                <CountdownTimer expiryDate={targetEndDate} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <NavLink
          to="/dashboard/settings"
          className={`h-10 bg-slate-50 rounded-[.45rem] flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100 ${sidebarExpanded ? 'w-full' : 'w-10'}`}
        >
          <Settings size={18} />
        </NavLink>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">

      {/* ── REVIEW MODAL ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[.5rem] w-full max-w-md p-8 relative shadow-2xl"
            >
              {!isTrialExpired && (
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    localStorage.setItem(`hlynk_reviewed_${user?.tenantId}_${targetEndDate}`, 'true');
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
                  <button key={star} onClick={() => setReviewRating(star)} className="transition-transform hover:scale-110 focus:outline-none">
                    <Star size={40} className={`${reviewRating >= star ? 'text-[#0D4A3E] fill-[#0D4A3E]' : 'text-slate-200 fill-slate-200'} transition-colors`} />
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE BACKDROP ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isDesktop && mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[65] bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      {isDesktop ? (
        /* ── DESKTOP: sticky rail that expands on hover or toggle ── */
        <motion.aside
          animate={{ width: sidebarExpanded ? FULL_W : RAIL_W }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex-shrink-0 h-screen border-r border-slate-100 bg-white overflow-visible z-[70]"
          style={{ minWidth: RAIL_W }}
        >
          {/* Expand beyond allocated width when hovered-while-collapsed */}
          <motion.div
            animate={{ width: sidebarExpanded ? FULL_W : RAIL_W }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className={`absolute inset-y-0 left-0 bg-white overflow-hidden ${isCollapsed && isHovered ? 'shadow-2xl shadow-slate-200 border-r border-slate-100' : ''}`}
          >
            <SidebarContent />
          </motion.div>
        </motion.aside>
      ) : null /* Mobile: No sidebar — we use bottom nav instead */}

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {isCritical && user?.role === 'PROVIDER' && (
          <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between z-[60] shadow-2xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="animate-bounce" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-0.5">
                  {isTrial ? "Critical: Free Trial Expiry Imminent" : "Critical: Subscription Expiry Imminent"}
                </p>
                <p className="text-[9px] font-medium opacity-80 uppercase tracking-widest leading-none">
                  {isTrial
                    ? `Your free trial expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Purchase a plan now to keep your business running smoothly.`
                    : `Your access expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Renew now to avoid business disruption.`}
                </p>
              </div>
            </div>
            <Link to="/dashboard/subscription" className="ml-4 flex-shrink-0 px-5 py-2 bg-white text-red-600 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-lg active:scale-95">
              {isTrial ? "Upgrade Now" : "Top Up Now"}
            </Link>
          </div>
        )}

        <TopNav
          isMobileOpen={mobileOpen}
          onMobileMenuToggle={() => setMobileOpen(v => !v)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => { setIsCollapsed(v => !v); setIsHovered(false); }}
          showMail={true}
          extraActions={
            <Link
              to="/dashboard/sales/new"
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-[#0D4A3E] text-white rounded-[.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#064E3B] hover:-translate-y-0.5 transition-all"
            >
              <Zap size={15} /> Record Sale
            </Link>
          }
        />

        <main className="flex-1 overflow-y-auto px-4 lg:px-10 py-4 lg:py-8 bg-slate-50/30 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────────── */}
      {!isDesktop && (
        <MobileBottomNav
          user={user}
          targetEndDate={targetEndDate}
        />
      )}
    </div>
  );
}

// ─── Mobile Bottom Navigation ────────────────────────────────────────────────
function MobileBottomNav({ user, targetEndDate }: {
  user: any;
  targetEndDate: string | undefined;
}) {
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!showBanner) return;
    const t = setTimeout(() => setShowBanner(false), 5000);
    return () => clearTimeout(t);
  }, [showBanner]);

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/dashboard/products', label: 'Items', icon: Package, end: false },
    { to: '/dashboard/expenses', label: 'Spends', icon: ShoppingCart, end: false },
    { to: '/dashboard/sales/new', label: 'Sell', icon: Zap, isCenter: true },
    { to: '/dashboard/sales', label: 'History', icon: Clock, end: true },
    { to: '/dashboard/reports', label: 'Growth', icon: BarChart2, end: false, plan: 'PLUS' },
    { to: '/dashboard/settings', label: 'Tools', icon: Settings, end: false },
  ];

  const getPlanWeight = (p: string) => p.includes('MAX') ? 3 : p.includes('PLUS') ? 2 : 1;
  const currentPlan = (user?.subscription?.planName || 'LITE').toUpperCase();
  const userWeight = getPlanWeight(currentPlan);

  const isActive = (item: any) => {
    if (item.end) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const handleLockedClick = (plan: string) => {
    toast.error(`Upgrade to ${plan} to access this feature`, {
      description: "Visit settings to manage your subscription",
      action: {
        label: "Upgrade",
        onClick: () => window.location.href = "/dashboard/subscription"
      }
    });
  };

  return (
    <div className="fixed inset-x-0 bottom-6 z-[95] lg:hidden flex flex-col items-center pointer-events-none">

      {/* Banner */}
      <AnimatePresence>
        {targetEndDate && showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-full max-w-[340px] pointer-events-auto mb-4 px-4"
          >
            <Link to="/dashboard/subscription" className="bg-[#0D4A3E] backdrop-blur-3xl border border-white/10 p-3 rounded-[1.5rem] flex items-center justify-between shadow-[0_20px_50px_rgba(13,74,61,0.4)]">
              <div className="pl-2">
                <p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest leading-none">Subscription Status</p>
                <p className="text-[9px] font-black text-white mt-1 uppercase tracking-tight">Active Plan</p>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-xl">
                <MiniCountdown expiryDate={targetEndDate} />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full px-[1rem] pointer-events-auto">
        <div className="relative h-20 bg-white/95 backdrop-blur-2xl border border-white/60 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-around px-2">

          {navItems.map((item) => {
            const active = isActive(item);
            const isLocked = item.plan && userWeight < getPlanWeight(item.plan);

            if (item.isCenter) {
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className="flex-1 flex flex-col items-center justify-center gap-1 no-tap-highlight"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-emerald-200'
                    }`}>
                    <item.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-[#0D4A3E]'}`} strokeWidth={2.5} />
                  </div>
                  <span className={`text-[11px] font-bold ${active ? 'text-emerald-700' : 'text-[#0D4A3E] opacity-60'}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            }

            if (isLocked) {
              return (
                <button
                  key={item.label}
                  onClick={() => handleLockedClick(item.plan!)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 no-tap-highlight opacity-40 grayscale"
                >
                  <div className="w-11 h-11 rounded-[14px] bg-slate-100 flex items-center justify-center transition-all duration-300">
                    <item.icon className="w-5 h-5 text-slate-400" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className="flex-1 flex flex-col items-center justify-center gap-1 no-tap-highlight"
                onTouchStart={() => setShowBanner(true)}
              >
                <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-300 ${active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-emerald-50'
                  }`}>
                  <item.icon
                    className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-[#0D4A3E]'}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span className={`text-[11px] font-bold transition-all ${active ? 'text-emerald-700 opacity-100' : 'text-[#0D4A3E] opacity-40'
                  }`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}

        </div>
      </div>

    </div>
  );
}

// ─── Mini Countdown (4 segments: d, h, m, s) ────────────────────────────────────
function MiniCountdown({ expiryDate }: { expiryDate: string }) {
  const calc = (d: string) => {
    const dist = new Date(d).getTime() - Date.now();
    if (dist < 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(dist / 86_400_000),
      h: Math.floor((dist % 86_400_000) / 3_600_000),
      m: Math.floor((dist % 3_600_000) / 60_000),
      s: Math.floor((dist % 60_000) / 1000),
    };
  };
  const [t, setT] = useState(() => calc(expiryDate));
  useEffect(() => {
    let raf: number;
    let lastSec = -1;
    const tick = () => {
      const now = calc(expiryDate);
      if (now.s !== lastSec) { lastSec = now.s; setT(now); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [expiryDate]);
  return (
    <div className="flex gap-1.5">
      {[{ v: t.d, l: 'd' }, { v: t.h, l: 'h' }, { v: t.m, l: 'm' }, { v: t.s, l: 's' }].map((seg, i) => (
        <div key={i} className="flex items-baseline gap-0.5">
          <span className="text-[13px] font-black text-white leading-none hl-mono">{seg.v.toString().padStart(2, '0')}</span>
          <span className="text-[8px] font-black text-emerald-400 uppercase">{seg.l}</span>
          {i < 3 && <span className="text-[10px] font-black text-emerald-600 ml-0.5">:</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Countdown Timer ─────────────────────────────────────────────────────────
function CountdownTimer({ expiryDate }: { expiryDate: string | undefined }) {
  const calc = (d: string) => {
    const dist = new Date(d).getTime() - Date.now();
    if (dist < 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(dist / 86_400_000),
      h: Math.floor((dist % 86_400_000) / 3_600_000),
      m: Math.floor((dist % 3_600_000) / 60_000),
      s: Math.floor((dist % 60_000) / 1000),
    };
  };

  const [t, setT] = useState(() => expiryDate ? calc(expiryDate) : null);

  useEffect(() => {
    if (!expiryDate) return;
    let raf: number;
    let lastSec = -1;
    const tick = () => {
      const now = calc(expiryDate);
      if (now.s !== lastSec) { lastSec = now.s; setT(now); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [expiryDate]);

  if (!t) return (
    <div className="h-8 flex items-center justify-center gap-1">
      {[0, 1, 2].map(i => <div key={i} className="w-1 h-4 bg-emerald-800 animate-pulse rounded-full" style={{ animationDelay: `${i * 75}ms` }} />)}
    </div>
  );

  return (
    <div className="flex justify-between gap-1">
      {[{ v: t.d, l: 'd' }, { v: t.h, l: 'h' }, { v: t.m, l: 'm' }, { v: t.s, l: 's' }].map((seg, i) => (
        <div key={i} className="flex-1 flex flex-col items-center bg-white/5 rounded-[.4rem] py-1 border border-white/5">
          <span className="text-[11px] font-black text-white leading-none">{seg.v.toString().padStart(2, '0')}</span>
          <span className="text-[6px] font-black text-emerald-400 uppercase opacity-50">{seg.l}</span>
        </div>
      ))}
    </div>
  );
}