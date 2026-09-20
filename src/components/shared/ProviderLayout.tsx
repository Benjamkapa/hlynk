import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  Home, Calendar, BarChart2, Users,
  Settings, LogOut, Package, ShoppingCart,
  Zap, Clock, LibraryBig, AlertTriangle, User, CircleEllipsis,
  Lock, Shield, X, Terminal, ShieldCheck, Receipt, CreditCard,
  Hotel, Building, CalendarCheck, Sparkles, Plus, DollarSign,
  Tag, Wrench, TrendingUp, Wallet, Grid, MoreHorizontal
} from "lucide-react";
import { useLocation, Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import TopNav from "./TopNav";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MobileGestures } from "./MobileGestures";
import { hasOfflinePin } from "../../lib/offline/offlinePin";
import { Modal } from "./Modal";

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
  module?: 'POS' | 'HOSPITALITY';
  end?: boolean;
  isComingSoon?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

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
  const { user, logout, lock } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

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


  const userModules = useMemo(() => {
    let mods: string[] = [];
    if (Array.isArray(user?.activeModules)) mods = user.activeModules;
    else if (typeof user?.activeModules === 'string') {
      try { mods = JSON.parse(user.activeModules); } catch (_) { }
    }
    if (!mods.length) mods = ['POS'];
    return mods;
  }, [user]);

  const navGroups: NavGroup[] = [
    {
      label: 'Main',
      items: [
        { to: '/dashboard', label: 'Home', icon: Home, end: true, permission: 'overview' },
      ],
    },
    {
      label: 'Sales & Money',
      items: [
        { to: '/dashboard/sales/new', label: 'Make a Sale', icon: Plus, permission: 'sales', module: 'POS' },
        { to: '/dashboard/sales', label: 'Sales History', icon: Receipt, end: true, permission: 'sales', module: 'POS' },
        { to: '/dashboard/expenses', label: 'Expenses & Costs', icon: DollarSign, permission: 'sales', module: 'POS' },
      ],
    },
    {
      label: 'Products & Clients',
      items: [
        { to: '/dashboard/products', label: 'Products & Pricing', icon: Tag, permission: 'products', module: 'POS' },
        { to: '/dashboard/customers', label: 'Customers & Clients', icon: Users, permission: 'customers' },
      ],
    },
    {
      label: 'Bookings & Rentals',
      items: [
        { to: '/dashboard/hospitality', label: 'Rental Overview', icon: Hotel, end: true, permission: 'hospitality', module: 'HOSPITALITY' },
        { to: '/dashboard/hospitality/bookings', label: 'Bookings & Reservations', icon: CalendarCheck, permission: 'hospitality', module: 'HOSPITALITY' },
        { to: '/dashboard/hospitality/properties', label: 'Rooms, Vehicles & Assets', icon: Building, permission: 'properties', module: 'HOSPITALITY' },
        { to: '/dashboard/hospitality/operations', label: 'Housekeeping & Tasks', icon: Wrench, permission: 'operations', module: 'HOSPITALITY' },
      ],
    },
    {
      label: 'Analytics & Growth',
      items: [
        { to: '/dashboard/reports', label: 'Reports & Growth', icon: TrendingUp, permission: 'reports', plan: 'PLUS' }
      ],
    },
    {
      label: 'Team Management',
      items: [
        { to: '/dashboard/staff', label: 'Staff & Roles', icon: Users, permission: 'staff', plan: 'PLUS' },
      ],
    },
    {
      label: 'Account & Settings',
      items: [
        { to: '/dashboard/logs', label: 'Audit & Staff Activity', icon: ShieldCheck, permission: 'logs', plan: 'MAX' },
        { to: '/dashboard/subscription', label: 'Subscription Plan', icon: CreditCard, role: 'PROVIDER' },
        { to: '/dashboard/developer', label: 'M-Pesa & Payments', icon: Wallet, role: 'PROVIDER', plan: 'PLUS' },
      ],
    },
  ];

  const getPlanWeight = (p: string) => p.includes('MAX') ? 3 : p.includes('PLUS') ? 2 : 1;

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.map(item => {
      if (item.module && !userModules.includes(item.module)) return null;

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

  const isTrial = Number(user?.subscription?.status) === 2 || user?.subscription?.status === 'TRIAL';
  const targetEndDate = isTrial ? user?.subscription?.trialEndDate : user?.subscription?.endDate;
  const timeRemainingMs = targetEndDate ? new Date(targetEndDate).getTime() - Date.now() : 0;
  const daysRemaining = Math.max(0, Math.ceil(timeRemainingMs / 86_400_000));
  const isCritical = daysRemaining < 3 && timeRemainingMs > 0;
  const isExpiringSoon = daysRemaining <= 5 && timeRemainingMs > 0;
  const isExpired = Number(user?.subscription?.status) === 1;
  const isTrialExpired = isTrial && isExpired;


  const sidebarExpanded = isDesktop ? (!isCollapsed || isHovered) : mobileOpen;
  const RAIL_W = isDesktop ? 68 : 60;
  const FULL_W = 220;

  const sidebarContent = useMemo(() => (
    <div className="flex flex-col h-full">
      <div className={`h-16 lg:h-20 flex items-center flex-shrink-0 pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+0.75rem))] lg:pt-0 ${sidebarExpanded ? 'px-5' : 'justify-center'}`}>
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
                <span className="text-sm text-emerald-900 font-bold text-[#00694B] truncate tracking-tight leading-none">
                  {user?.businessName}
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
                    {item.isComingSoon ? (
                      <span className="text-[7px] font-black bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full uppercase tracking-widest ml-2 flex-shrink-0">
                        Soon
                      </span>
                    ) : item.isLocked && (
                      <span className="text-[7px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase tracking-widest ml-2 flex-shrink-0">
                        {item.plan === 'MAX' ? 'Pro' : 'Growth'}
                      </span>
                    )}
                  </motion.div>
                );

                const tooltip = !sidebarExpanded && isDesktop && (
                  <div className="absolute left-[calc(100%+10px)] bg-slate-900 text-white px-3 py-1.5 rounded-[.4rem] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 invisible group-hover:visible translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[200] shadow-2xl">
                    {item.label} {item.isComingSoon ? '(Coming Soon)' : ''}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900" />
                  </div>
                );

                const baseClass = `group relative flex items-center rounded-[.45rem] transition-all duration-150 ${sidebarExpanded ? 'px-3 py-2.5' : 'justify-center py-2.5 px-0'}`;

                if (item.isComingSoon) {
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `${baseClass} opacity-50 grayscale hover:opacity-80 cursor-pointer ${isActive ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:bg-slate-50'}`
                      }
                    >
                      {iconEl}{labelEl}{tooltip}
                    </NavLink>
                  );
                }

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
                    {isTrial ? 'Trial Mode' : (user?.subscription?.planName === 'MAX' ? 'Business Pro' : user?.subscription?.planName === 'PLUS' ? 'Growth' : 'Starter')} Tier
                  </p>
                  {isCritical && <AlertTriangle size={10} className="text-amber-400 animate-pulse" />}
                </div>
                <CountdownTimer expiryDate={targetEndDate} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="group relative w-full flex justify-center mt-2">
          <button
            onClick={() => setShowProfileModal(true)}
            className={`flex items-center gap-3 transition-colors ${sidebarExpanded ? 'w-full hover:bg-slate-100 p-2 rounded-md border border-slate-100/50' : 'hover:scale-110 p-1 bg-slate-50 rounded-md border border-slate-100'}`}
            title="Profile & Options"
          >
            <div className="relative flex-shrink-0">
              <img
                src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=0D4A3E&color=fff`}
                alt="Profile"
                className={`rounded-md object-cover border border-slate-200 ${sidebarExpanded ? 'w-8 h-8' : 'w-8 h-8'}`}
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                <div className="bg-emerald-500 w-1.5 h-1.5 rounded-full" />
              </div>
            </div>
            
            {sidebarExpanded && (
              <div className="flex-1 min-w-0 text-left flex justify-between items-center pr-1">
                <div className="min-w-0 truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Provider'}</p>
                  <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5 group-hover:text-emerald-700 transition-colors">Profile & Options</p>
                </div>
                <LibraryBig size={14} className="text-slate-400 group-hover:text-emerald-700 flex-shrink-0 transition-colors" />
              </div>
            )}
          </button>
          {!sidebarExpanded && isDesktop && (
            <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-md text-xs font-semibold opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all pointer-events-none whitespace-nowrap z-[200] shadow-sm">
              Account & Profile
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900" />
            </div>
          )}
        </div>
      </div>
    </div>
  ), [sidebarExpanded, filteredGroups, user, isTrial, isCritical, targetEndDate, logout]);

  return (
    <MobileGestures>
      <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50/50">

      <AnimatePresence>
        {!isDesktop && mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[65] bg-slate-900/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
        )}
      </AnimatePresence>

      {isDesktop && (
        <motion.aside
          animate={{ width: sidebarExpanded ? FULL_W : RAIL_W }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex-shrink-0 h-screen border-r border-slate-100 bg-white overflow-visible z-[70]"
          style={{ minWidth: RAIL_W }}
        >
          <motion.div
            animate={{ width: sidebarExpanded ? FULL_W : RAIL_W }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className={`absolute inset-y-0 left-0 bg-white overflow-hidden ${isCollapsed && isHovered ? 'shadow-2xl shadow-slate-200 border-r border-slate-100' : ''}`}
          >
            {sidebarContent}
          </motion.div>
        </motion.aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {isCritical && user?.role === 'PROVIDER' && (
          <div className="bg-red-600 text-white px-6 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] flex items-center justify-between z-[60] shadow-2xl flex-shrink-0">
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
            <Link to="/dashboard/subscription" className="ml-4 flex-shrink-0 px-5 py-2 glass-btn text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
              {isTrial ? "Upgrade Now" : "Top Up Now"}
            </Link>
          </div>
        )}

        <TopNav
          isCollapsed={isCollapsed}
          onToggleCollapse={() => { setIsCollapsed(v => !v); setIsHovered(false); }}
          extraActions={
            <Link
              to="/dashboard/sales/new"
            // className="hidden lg:flex items-center gap-2 px-5 py-2.5 glass-btn-primary rounded-xl font-black text-xs uppercase tracking-widest hover:-translate-y-0.5 transition-all"
            >
              {/* <Zap size={15} /> Record Sale */}
            </Link>
          }
        />

        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-8 bg-slate-50/30 pb-28 lg:pb-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {!isDesktop && (
        <MobileBottomNav
          user={user}
          targetEndDate={targetEndDate}
          filteredGroups={filteredGroups}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />
      )}

      <FloatingExpiryWidget
        user={user}
        targetEndDate={targetEndDate}
        isTrial={isTrial}
        daysRemaining={daysRemaining}
        isCritical={isCritical}
      />

      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Account & Profile Options"
        maxWidth="sm"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <img
              src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=0D4A3E&color=fff`}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-emerald-600/20 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || user?.businessName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {user?.role === 'SUPER_ADMIN' ? 'Admin' : (user?.subscription?.planName || 'Business')}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => {
                setShowProfileModal(false);
                navigate(user?.role === 'SUPER_ADMIN' ? '/admin/settings' : '/dashboard/settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 transition-colors border border-slate-100"
            >
              <User size={16} className="text-emerald-600" /> View Profile & Business Info
            </button>

            {hasOfflinePin() && (
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  lock();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
              >
                <Lock size={16} className="text-slate-500" /> Lock Screen (PIN)
              </button>
            )}

            <button
              onClick={async () => {
                setShowProfileModal(false);
                if (window.confirm("Are you sure you want to log out?")) {
                  await logout();
                  if (navigator.onLine) {
                    navigate('/login');
                  } else {
                    toast.info('Session locked. Enter your PIN to continue.');
                  }
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
            >
              <LogOut size={16} /> Log Out of System
            </button>
          </div>
        </div>
      </Modal>
      </div>
    </MobileGestures>
  );
}

function MobileBottomNav({ user, targetEndDate, filteredGroups = [], onOpenMobileMenu }: {
  user: any;
  targetEndDate: string | undefined;
  filteredGroups?: NavGroup[];
  onOpenMobileMenu?: () => void;
}) {
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, lock } = useAuth();

  useEffect(() => {
    setShowMoreSheet(false);
    setShowProfileSheet(false);
  }, [location.pathname]);

  const userModules = useMemo(() => {
    let mods: string[] = [];
    if (Array.isArray(user?.activeModules)) mods = user.activeModules;
    else if (typeof user?.activeModules === 'string') {
      try { mods = JSON.parse(user.activeModules); } catch (_) { }
    }
    if (!mods.length) mods = ['POS'];
    return mods;
  }, [user]);

  const hasPos = userModules.includes('POS');
  const hasHosp = userModules.includes('HOSPITALITY');

  const homeItem = useMemo(() => {
    return { to: hasHosp && !hasPos ? '/dashboard/hospitality' : '/dashboard', label: 'Home', icon: Home, end: true };
  }, [hasPos, hasHosp]);

  const primaryLeftItem = useMemo(() => {
    if (hasHosp && !hasPos) {
      return { to: '/dashboard/hospitality/properties', label: 'Units & Assets', icon: Building, end: false };
    }
    return { to: '/dashboard/products', label: 'Products', icon: Tag, end: false };
  }, [hasPos, hasHosp]);

  const centerCtaItem = useMemo(() => {
    if (hasHosp && !hasPos) {
      return { to: '/dashboard/hospitality/bookings', label: 'New Booking', icon: CalendarCheck, end: false };
    }
    return { to: '/dashboard/sales/new', label: 'Make Sale', icon: Plus, end: false };
  }, [hasPos, hasHosp]);

  const overflowItems = useMemo(() => {
    const mainPaths = [homeItem.to, primaryLeftItem.to, centerCtaItem.to];
    const items: NavItem[] = [];

    filteredGroups.forEach(group => {
      group.items.forEach(item => {
        if (!mainPaths.includes(item.to) && !items.some(x => x.to === item.to)) {
          items.push(item);
        }
      });
    });

    if (items.length > 0) return items;

    return [
      { to: '/dashboard/sales',        label: 'Sales History',     icon: Receipt },
      { to: '/dashboard/expenses',     label: 'Expenses & Costs',  icon: DollarSign },
      { to: '/dashboard/staff',        label: 'Staff & Team',      icon: Users },
      { to: '/dashboard/customers',    label: 'Customers & Clients', icon: Users },
      { to: '/dashboard/reports',      label: 'Reports & Growth',  icon: TrendingUp },
      { to: '/dashboard/developer',    label: 'M-Pesa & Payments', icon: Wallet },
      { to: '/dashboard/subscription', label: 'Subscription Plan', icon: CreditCard },
    ];
  }, [filteredGroups, homeItem.to, primaryLeftItem.to, centerCtaItem.to]);

  const isOverflowActive = overflowItems.some(item =>
    location.pathname === item.to || location.pathname.startsWith(item.to + '/')
  );

  const renderNavItem = (item: any) => (
    <NavLink
      key={item.label}
      to={item.to}
      end={item.end}
      className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
    >
      {({ isActive }) => (
        <>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-emerald-50' : 'bg-transparent'}`}>
            <item.icon
              className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-[#0D4A3E]' : 'text-[#0D4A3E] opacity-35'}`}
              strokeWidth={isActive ? 2.5 : 2}
            />
          </div>
          <span className={`text-[9px] font-bold transition-all truncate w-full text-center ${isActive ? 'text-[#0D4A3E]' : 'text-slate-400'}`}>
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] lg:hidden flex flex-col items-center pointer-events-none">
      <AnimatePresence>
        {(showMoreSheet || showProfileSheet) && (
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[93] bg-slate-900/25 pointer-events-auto"
            onClick={() => { setShowMoreSheet(false); setShowProfileSheet(false); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMoreSheet && (
          <motion.div
            key="more-sheet"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-3 z-[94] bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] pointer-events-auto max-h-[75vh] flex flex-col"
          >
            <div className="glass-sheet rounded-[.75rem] overflow-hidden border border-white/40 flex flex-col max-h-full bg-white/95 backdrop-blur-xl">
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
                <p className="text-xs font-semibold text-slate-400">All Features & Options</p>
                <button
                  onClick={() => setShowMoreSheet(false)}
                  className="glass-btn w-6 h-6 rounded-full flex items-center justify-center text-slate-400 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2 overflow-y-auto max-h-[50vh] custom-scrollbar">
                {overflowItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-md transition-all no-tap-highlight ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                    <span className="text-[11px] leading-tight truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileSheet && (
          <motion.div
            key="profile-sheet"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-3 z-[94] bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] pointer-events-auto"
          >
            <div className="glass-sheet rounded-[1rem] overflow-hidden border border-white/40 p-3 shadow-2xl bg-white/95 backdrop-blur-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100/60">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=0D4A3E&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-emerald-600/20 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || user?.businessName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileSheet(false)}
                  className="glass-btn w-7 h-7 rounded-full flex items-center justify-center text-slate-400 transition-all flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-2 space-y-1.5 mt-1">
                <Link
                  to={user?.role === 'SUPER_ADMIN' ? '/admin/settings' : '/dashboard/settings'}
                  onClick={() => setShowProfileSheet(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <User size={16} className="text-emerald-600" /> My Profile & Settings
                </Link>

                {hasOfflinePin() && (
                  <button
                    onClick={() => {
                      setShowProfileSheet(false);
                      lock();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <Lock size={16} className="text-slate-500" /> Lock Screen (PIN)
                  </button>
                )}

                <button
                  onClick={async () => {
                    setShowProfileSheet(false);
                    await logout();
                    if (navigator.onLine) {
                      navigate('/login');
                    } else {
                      toast.info('Session locked. Enter your PIN to continue.');
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full pointer-events-auto bg-white rounded-t-[1.5rem] pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom,0.6rem))] border-t border-slate-100 shadow-[0_-10px_35px_rgba(0,0,0,0.06)]">
        <div className="flex items-end justify-evenly w-full px-4">
          {renderNavItem(homeItem)}
          {renderNavItem(primaryLeftItem)}
          <NavLink
            key={centerCtaItem.label}
            to={centerCtaItem.to}
            end={centerCtaItem.end}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
          >
            {({ isActive }) => (
              <>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 -mt-2 shadow-md
                  ${isActive ? 'bg-emerald-500 shadow-emerald-500/40 text-white' : 'bg-[#0D4A3E] text-white shadow-emerald-900/30 hover:bg-emerald-800'}`}
                >
                  <centerCtaItem.icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className={`text-[9px] font-bold transition-all truncate w-full text-center mt-0.5 ${isActive ? 'text-[#0D4A3E]' : 'text-slate-400'}`}>
                  {centerCtaItem.label}
                </span>
              </>
            )}
          </NavLink>
          <button
            key="more-btn"
            onClick={() => {
              setShowProfileSheet(false);
              setShowMoreSheet(v => !v);
            }}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${showMoreSheet || isOverflowActive ? 'bg-emerald-50' : 'bg-transparent'}`}>
              <CircleEllipsis className={`w-[18px] h-[18px] transition-colors ${showMoreSheet || isOverflowActive ? 'text-[#0D4A3E]' : 'text-[#0D4A3E] opacity-35'}`} />
            </div>
            <span className={`text-[9px] font-bold transition-all truncate w-full text-center ${showMoreSheet || isOverflowActive ? 'text-[#0D4A3E]' : 'text-slate-400'}`}>More</span>
          </button>
          <button
            key="profile-btn"
            onClick={() => {
              setShowMoreSheet(false);
              setShowProfileSheet(v => !v);
            }}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 overflow-hidden ${showProfileSheet || location.pathname.includes('/settings') ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}`}>
              <img
                src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=0D4A3E&color=fff`}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
              />
            </div>
            <span className={`text-[9px] font-bold transition-all truncate w-full text-center ${showProfileSheet || location.pathname.includes('/settings') ? 'text-[#0D4A3E]' : 'text-slate-400'}`}>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

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
          <span className="text-[11px] font-black text-white leading-none">{seg.v.toString().padStart(2, '00')}</span>
          <span className="text-[6px] font-black text-emerald-400 uppercase opacity-50">{seg.l}</span>
        </div>
      ))}
    </div>
  );
}

function FloatingExpiryWidget({
  user,
  targetEndDate,
  isTrial,
  daysRemaining,
  isCritical,
}: {
  user: any;
  targetEndDate: string | undefined;
  isTrial: boolean;
  daysRemaining: number;
  isCritical: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (user?.role !== 'PROVIDER' || !targetEndDate) return null;

  return (
    <div className="fixed bottom-32 lg:bottom-8 right-4 lg:right-8 z-[90] pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 right-0 w-72 rounded-2xl bg-slate-900 text-white p-5 shadow-2xl border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
                <span className="text-[10px] font-black tracking-widest text-emerald-400">
                  {isTrial ? 'Free Trial' : (user?.subscription?.planName || 'Standard')} Tier
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5">Subscription Expiry Countdown:</p>
              <CountdownTimer expiryDate={targetEndDate} />
            </div>

            <div className="text-[10px] text-slate-400 leading-tight">
              Expiry Date: <span className="text-slate-200 font-semibold">{new Date(targetEndDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </div>

            <Link
              to="/dashboard/subscription"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              {isTrial ? 'Upgrade Subscription' : 'Manage / Top Up Plan'}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group relative grid h-12 w-12 place-items-center rounded-full shadow-2xl transition-all duration-300 active:scale-95 ${
          isCritical
            ? 'bg-red-600 text-white shadow-red-600/40 ring-4 ring-red-400/30'
            : 'bg-emerald-900 text-emerald-300 hover:bg-emerald-800 shadow-emerald-950/40 border border-emerald-700/50'
        }`}
        title="Provider Subscription Expiry Countdown"
      >
        <Clock size={20} className="transition-transform group-hover:rotate-12" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black font-mono text-slate-950 shadow-md border-2 border-white">
          {daysRemaining}d
        </span>
      </button>
    </div>
  );
}
