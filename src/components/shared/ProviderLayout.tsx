import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  LayoutDashboard, Calendar, BarChart2, Users,
  Settings, LogOut, Package, ShoppingCart,
  Zap, PanelLeftClose, PanelLeftOpen, Clock, AlertTriangle,
  Lock
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navGroups: NavGroup[] = [
    {
      label: 'Storefront',
      items: [
        { to: '/dashboard/sales/new', label: 'Record Sale', icon: Zap, permission: 'sales' },
        { to: '/dashboard/sales', label: 'Sales History', icon: Package, end: true, permission: 'sales' },
        { to: '/dashboard/expenses', label: 'Expenses', icon: ShoppingCart, permission: 'sales' },
      ],
    },
    {
      label: 'Inventory',
      items: [
        { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true, permission: 'overview' },
        { to: '/dashboard/products', label: 'Products & Stock', icon: Package, permission: 'products' },
        { to: '/dashboard/customers', label: 'Customers', icon: Users, permission: 'customers' },
      ],
    },
    {
      label: 'Insights',
      items: [
        { to: '/dashboard/reports', label: 'Business Reports', icon: BarChart2, permission: 'reports', plan: 'PLUS' },
        { to: '/dashboard/subscription', label: 'Billing Plan', icon: Calendar, role: 'PROVIDER' },
      ],
    },
    {
      label: 'Team',
      items: [
        { to: '/dashboard/staff', label: 'Staff Management', icon: Users, role: 'PROVIDER', plan: 'MAX' },
      ],
    },
  ];

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.map(item => {
      // Super admin sees everything as unlocked
      if (user?.role === 'SUPER_ADMIN') return { ...item, isLocked: false }
      
      // If item is role-restricted (e.g. Billing for PROVIDER only)
      if ((item as any).role && user?.role !== (item as any).role) return null

      // Plan restrictions
      const currentPlan = user?.subscription?.planName || 'LITE'
      let isLocked = false
      if (item.plan === 'MAX' && currentPlan !== 'MAX') isLocked = true
      if (item.plan === 'PLUS' && !['PLUS', 'MAX'].includes(currentPlan)) isLocked = true

      // If user is STAFF, check permissions
      if (user?.role === 'STAFF') {
        if ((item as any).permission && !user.permissions?.includes((item as any).permission)) {
          // If they don't have permission, they shouldn't even see the locked version if it's a security thing
          // But for "missed utilities", we might want to show them?
          // Let's hide if no permission, but lock if no plan.
          return null
        }
      }
      
      return { ...item, isLocked }
    }).filter((item): item is any => item !== null)
  })).filter(group => group.items.length > 0);

  const timeRemainingMs = user?.subscription?.endDate 
    ? new Date(user.subscription.endDate).getTime() - new Date().getTime()
    : 0;

  const daysRemaining = Math.max(0, Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24)));
  const isCritical = daysRemaining < 3 && timeRemainingMs > 0;
  const isExpiringSoon = daysRemaining <= 5 && timeRemainingMs > 0;

  useEffect(() => {
    if (isExpiringSoon && !localStorage.getItem('hlynk_has_reviewed')) {
      const timer = setTimeout(() => setShowReviewModal(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isExpiringSoon]);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return toast.error("Please select a rating");
    setIsSubmittingReview(true);
    try {
      await providersApi.submitReview({ rating: reviewRating, reviewText });
      toast.success("Thank you for your feedback!");
      localStorage.setItem('hlynk_has_reviewed', 'true');
      setShowReviewModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div className={`flex flex-col h-full bg-white transition-all duration-300 ${collapsed ? 'w-[90px]' : 'w-[280px]'}`}>
      <div className={`pt-10 pb-12 flex items-center transition-all duration-300 ${collapsed ? 'justify-center' : 'px-8'}`}>
        <Link to="/" className="flex items-center gap-3">
          {collapsed ? (
            <img src="/fav.png" alt="hlynk" className="h-8 w-8" />
          ) : (
            <img src="/logo.png" alt="hlynk" className="h-10 w-auto" />
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto overflow-x-hidden pt-4 custom-scrollbar">
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 mb-4 whitespace-nowrap"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `hl-sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''} ${item.isLocked ? 'opacity-60 grayscale-[0.5]' : ''}`
                  }
                >
                  <div className="relative">
                    <item.icon size={20} className={collapsed ? '' : 'shrink-0'} />
                    {item.isLocked && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Lock size={6} className="text-white fill-white" />
                      </div>
                    )}
                  </div>
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="font-bold whitespace-nowrap truncate">{item.label}</span>
                      {item.isLocked && (
                        <span className="text-[7px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase tracking-widest ml-2">Pro</span>
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile Summary */}
      <div className="p-4 mt-auto border-t border-slate-50">
         <AnimatePresence>
           {!collapsed && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="bg-emerald-900 rounded-[8px] p-4 border border-emerald-800 shadow-2xl shadow-emerald-950/20 mb-4 relative overflow-hidden group"
             >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Clock size={48} className="text-white" />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-3">
                       <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">
                         {user?.subscription?.planName} {user?.subscription?.isTrial ? '(TRIAL)' : 'STATUS'}
                       </p>
                       {isCritical && <AlertTriangle size={12} className="text-amber-400 animate-pulse" />}
                    </div>
                   <CountdownTimer expiryDate={user?.subscription?.endDate} />
                   <p className="text-[8px] text-emerald-500/60 font-black uppercase tracking-[0.1em] mt-3 text-center">Remaining System Access</p>
                </div>
             </motion.div>
           )}
         </AnimatePresence>
         <div className="flex gap-2">
            <NavLink to="/dashboard/settings" className="flex-1 h-12 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100">
               <Settings size={20} />
            </NavLink>
            <button 
              onClick={() => logout()}
              className="h-12 w-12 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100"
            >
               <LogOut size={20} />
            </button>
         </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden hl-dash bg-slate-50/50">
      
      {/* ── REVIEW MODAL ── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => {
                setShowReviewModal(false);
                localStorage.setItem('hlynk_has_reviewed', 'true');
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="fill-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">How are we doing?</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Your subscription is renewing soon. We'd love to know how HudumaLynk has helped your business grow!
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
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none h-28"
              />
            </div>

            <button
              onClick={handleSubmitReview}
              disabled={isSubmittingReview || reviewRating === 0}
              className="w-full h-14 bg-[#0D4A3E] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#0A3D33] transition-all flex items-center justify-center shadow-xl shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:w-[280px]'}
          ${isCollapsed ? 'lg:w-[90px]' : 'lg:w-[280px]'}
        `}
      >
        <div className={`
          absolute inset-y-0 left-0 bg-white border-r border-slate-100 flex flex-col
          transition-all duration-300 ease-in-out overflow-hidden
          ${isCollapsed && isHovered ? 'w-[280px] shadow-2xl z-[60]' : 'w-full'}
        `}>
          <SidebarContent collapsed={isCollapsed && !isHovered} />
        </div>
      </aside>

      {/* ── MOBILE SWIPE HANDLE ── */}
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 50) setIsMobileOpen(true);
        }}
        className="fixed inset-y-0 left-0 w-4 z-[60] lg:hidden cursor-grab active:cursor-grabbing"
      />

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {isCritical && user?.role === 'PROVIDER' && (
          <div className="bg-red-600 text-white px-8 py-3 flex items-center justify-between animate-in slide-in-from-top duration-700 z-[100] shadow-2xl">
             <div className="flex items-center gap-4">
               <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <AlertTriangle size={18} className="animate-bounce" />
               </div>
               <div>
                <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">Critical: Subscription Expiry Imminent</p>
                <p className="text-[9px] font-medium opacity-80 uppercase tracking-widest leading-none">Your access expires in {daysRemaining} days. Renew now to avoid business disruption.</p>
               </div>
             </div>
             <Link to="/dashboard/subscription" className="px-6 py-2 bg-white text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-lg active:scale-95">
               Top Up Now
             </Link>
          </div>
        )}
        <TopNav 
          onMobileMenuToggle={() => setIsMobileOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          showMail={true}
          extraActions={
            <Link to="/dashboard/sales/new" className="hidden lg:flex items-center gap-2 px-6 py-3 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#064E3B] hover:-translate-y-0.5 transition-all">
               <Zap size={16} /> Record Sale
            </Link>
          }
        />

        <main className="flex-1 overflow-y-auto px-8 lg:px-12 py-12 bg-slate-50/30 relative">
          <Outlet />

          {/* ── Transparent Background Footer ── */}
          <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 pointer-events-none z-[40] flex justify-center bg-gradient-to-t from-white/90 to-transparent backdrop-blur-[2px]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60 select-none">
              {user?.businessName || 'HudumaLynk Provider Workspace'}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function CountdownTimer({ expiryDate }: { expiryDate: string | undefined }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    if (!expiryDate) return;

    const calculate = () => {
      const distance = new Date(expiryDate).getTime() - new Date().getTime();
      
      if (distance < 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);

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
    <div className="grid grid-cols-4 gap-1.5">
      {[
        { v: timeLeft.d, l: 'Days' },
        { v: timeLeft.h, l: 'Hrs' },
        { v: timeLeft.m, l: 'Min' },
        { v: timeLeft.s, l: 'Sec' }
      ].map((t, i) => (
        <div key={i} className="flex flex-col items-center bg-emerald-950/40 rounded-xl py-2 border border-white/5 backdrop-blur-md">
          <span className="text-[12px] font-black text-white hl-mono leading-none mb-1">{t.v.toString().padStart(2, '0')}</span>
          <span className="text-[7px] font-black text-emerald-400 uppercase tracking-tighter opacity-70">{t.l}</span>
        </div>
      ))}
    </div>
  );
}
