import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import {
  LayoutDashboard, BarChart2, Users,
  Settings, HelpCircle, CreditCard, MessageSquare,
  Briefcase, ShieldCheck, Activity, DollarSign, Landmark, X,
  Bell, Loader2
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import TopNav from './TopNav'
import { motion, AnimatePresence } from 'framer-motion'
import { getPushSubscriptionState, subscribeToPushNotifications } from '../../lib/notifications/pushService'
import { toast } from 'sonner'

// ─── Breakpoint hook ───────────────────────────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return isDesktop
}

interface NavItem {
  to: string
  label: string
  icon: any
  end?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export default function AdminLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const isDesktop = useIsDesktop()

  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pushStatus, setPushStatus] = useState<'subscribed' | 'denied' | 'prompt' | 'unsupported' | 'ios_browser'>('subscribed')
  const [isPushLoading, setIsPushLoading] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Auto-close mobile menu after 5 min of inactivity
  useEffect(() => {
    if (isDesktop || !mobileOpen) return
    let t: ReturnType<typeof setTimeout>
    const reset = () => { clearTimeout(t); t = setTimeout(() => setMobileOpen(false), 300_000) }
    reset()
    window.addEventListener('mousemove', reset)
    window.addEventListener('keydown', reset)
    window.addEventListener('click', reset)
    return () => { clearTimeout(t); window.removeEventListener('mousemove', reset); window.removeEventListener('keydown', reset); window.removeEventListener('click', reset) }
  }, [mobileOpen, isDesktop])

  useEffect(() => {
    getPushSubscriptionState().then(status => {
      setPushStatus(status)
      if ('Notification' in window && (Notification.permission === 'granted' || Notification.permission === 'default')) {
        subscribeToPushNotifications()
          .then(() => setPushStatus('subscribed'))
          .catch(err => console.warn('[AdminPush] Auto-subscribe notice:', err?.message))
      }
    })
  }, [])

  const handleEnablePush = async () => {
    setIsPushLoading(true)
    try {
      await subscribeToPushNotifications()
      setPushStatus('subscribed')
      toast.success('System notifications enabled!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to enable notifications')
      const status = await getPushSubscriptionState()
      setPushStatus(status)
    } finally {
      setIsPushLoading(false)
    }
  }

  const navGroups: NavGroup[] = [
    {
      label: 'System Control',
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/system-performance', label: 'Performance', icon: Activity },
        { to: '/admin/financials', label: 'Financials', icon: DollarSign },
        { to: '/admin/payments', label: 'Payments', icon: Landmark },
      ],
    },
    {
      label: 'Operations',
      items: [
        { to: '/admin/businesses', label: 'Businesses', icon: Briefcase },
        { to: '/admin/user-operations', label: 'Users', icon: Users },
        { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
        { to: '/admin/community-reviews', label: 'Reviews', icon: MessageSquare },
      ],
    },
    {
      label: 'Governance',
      items: [
        { to: '/admin/forensic-audit', label: 'Forensic Audit', icon: ShieldCheck },
        { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
      ],
    },
  ]

  const sidebarExpanded = isDesktop ? (!isCollapsed || isHovered) : mobileOpen
  const RAIL_W = isDesktop ? 68 : 60
  const FULL_W = 260

  const sidebarContent = useMemo(() => (
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
                <span className="text-sm font-bold text-[#00694B] truncate tracking-tight leading-none">
                  {user?.businessName}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Admin console</span>
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

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto overflow-x-hidden pt-2 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.p
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-[10px] font-semibold text-slate-400 px-3 mb-2 whitespace-nowrap"
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
                  </div>
                )

                const labelEl = sidebarExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between flex-1 min-w-0 ml-3"
                  >
                    <span className="text-sm font-bold whitespace-nowrap truncate">{item.label}</span>
                  </motion.div>
                )

                const tooltip = !sidebarExpanded && isDesktop && (
                  <div className="absolute left-[calc(100%+10px)] bg-slate-900 text-white px-3 py-1.5 rounded-md text-xs font-semibold opacity-0 group-hover:opacity-100 invisible group-hover:visible translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[200] shadow-sm">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900" />
                  </div>
                )

                const baseClass = `group relative flex items-center rounded-md transition-all duration-150 ${sidebarExpanded ? 'px-3 py-2.5' : 'justify-center py-2.5 px-0'}`

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
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className={`flex-shrink-0 p-3 mt-auto border-t border-slate-100 ${sidebarExpanded ? '' : 'flex justify-center'}`}>
        <AnimatePresence>
          {sidebarExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mb-3"
            >
              <Link
                to="/admin/help"
                className="block bg-slate-900 rounded-[.5rem] p-3 hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle size={16} className="text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-semibold leading-none mb-0.5">Help center</p>
                    <p className="text-xs font-bold text-white truncate">Docs &amp; guides</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <NavLink
          to="/admin/settings"
          className={`h-10 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100 ${sidebarExpanded ? 'w-full' : 'w-10'}`}
        >
          <Settings size={18} />
        </NavLink>
      </div>
    </div>
  ), [sidebarExpanded, navGroups, user])

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50/50">

      {/* ── Mobile Backdrop ── */}
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

      {/* ── Sidebar ── */}
      {isDesktop ? (
        // Desktop: rail that expands on hover or pin toggle
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
            className={`absolute inset-y-0 left-0 bg-white overflow-hidden ${isCollapsed && isHovered ? 'shadow-sm border-r border-slate-100' : ''}`}
          >
            {sidebarContent}
          </motion.div>
        </motion.aside>
      ) : (
        // Mobile: slide-in drawer (same as ProviderLayout)
        <AnimatePresence>
          {mobileOpen && (
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -FULL_W }}
              animate={{ x: 0 }}
              exit={{ x: -FULL_W }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 h-full bg-white z-[70] shadow-sm"
              style={{ width: FULL_W }}
            >
              {sidebarContent}
            </motion.aside>
          )}
        </AnimatePresence>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Push Notifications Banner */}
        <AnimatePresence>
          {pushStatus !== 'subscribed' && pushStatus !== 'unsupported' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-900 text-white z-[100] border-b pt-5 border-white/10 flex-shrink-0"
            >
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-emerald-800 p-2 rounded-md flex-shrink-0">
                    <Bell size={16} className="text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-emerald-300 leading-none mb-1">
                      {pushStatus === 'ios_browser' ? 'Action required' : 'Security recommendation'}
                    </p>
                    <p className="text-sm font-bold truncate">
                      {pushStatus === 'ios_browser'
                        ? "To enable alerts on iOS, tap 'Share' then 'Add to Home Screen'."
                        : "Enable system push alerts to monitor platform activity even when offline."}
                    </p>
                  </div>
                </div>
                {pushStatus !== 'ios_browser' && (
                  <button
                    onClick={handleEnablePush}
                    disabled={isPushLoading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                  >
                    {isPushLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} strokeWidth={2} />}
                    Activate alerts
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TopNav
          isMobileOpen={mobileOpen}
          onMobileMenuToggle={() => setMobileOpen(v => !v)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => { setIsCollapsed(v => !v); setIsHovered(false) }}
        />

        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-8 bg-slate-50/30 pb-28 lg:pb-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      {!isDesktop && <MobileBottomAdminNav />}
    </div>
  )
}

// ─── Mobile Bottom Navigation ────────────────────────────────────────────────
// Symmetric layout: 3 items — center (primary) — 3 items = 7 buttons total.
// The last slot on the right opens the "More" sheet with everything else.
function MobileBottomAdminNav() {
  const location = useLocation()
  const [showMoreSheet, setShowMoreSheet] = useState(false)

  useEffect(() => { setShowMoreSheet(false) }, [location.pathname])

  const leftItems = [
    { to: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/admin/businesses', label: 'Business', icon: Briefcase, end: false },
    { to: '/admin/user-operations', label: 'Users', icon: Users, end: false },
  ]

  const centerItem = { to: '/admin/financials', label: 'Finance', icon: DollarSign, end: false }

  const rightItems = [
    { to: '/admin/subscriptions', label: 'Subs', icon: CreditCard, end: false },
    { to: '/admin/payments', label: 'Payments', icon: Landmark, end: false },
  ]

  const overflowItems = [
    { to: '/admin/community-reviews', label: 'Reviews', icon: MessageSquare },
    { to: '/admin/forensic-audit', label: 'Forensic Audit', icon: ShieldCheck },
    { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
    { to: '/admin/system-performance', label: 'Performance', icon: Activity },
  ]

  const isOverflowActive = overflowItems.some(item =>
    location.pathname === item.to || location.pathname.startsWith(item.to + '/')
  )

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
          <span className={`text-[9px] font-medium transition-all truncate w-full text-center ${isActive ? 'text-[#0D4A3E]' : 'text-[#0D4A3E] opacity-35'}`}>
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  )

  const renderCenterItem = (item: any) => (
    <NavLink
      key={item.label}
      to={item.to}
      end={item.end}
      className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
    >
      {({ isActive }) => (
        <>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 -mt-4
            ${isActive ? 'bg-emerald-500 shadow-sm' : 'bg-[#0D4A3E] shadow-sm'}`}
          >
            <item.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className={`text-[9px] font-medium transition-all truncate w-full text-center ${isActive ? 'text-emerald-600' : 'text-[#0D4A3E] opacity-50'}`}>
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  )

  return (
    <>
      {/* More Sheet Backdrop */}
      <AnimatePresence>
        {showMoreSheet && (
          <motion.div
            key="more-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[93] bg-slate-900/30 backdrop-blur-[2px] lg:hidden"
            onClick={() => setShowMoreSheet(false)}
          />
        )}
      </AnimatePresence>

      {/* More Sheet Panel */}
      <AnimatePresence>
        {showMoreSheet && (
          <motion.div
            key="more-sheet"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-3 z-[94] lg:hidden bottom-[calc(5.5rem+0.25rem+env(safe-area-inset-bottom,0px))]"
          >
            <div className="bg-white rounded-[.75rem] shadow-sm overflow-hidden border border-slate-100">
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-50">
                <p className="text-xs font-semibold text-slate-400">More options</p>
                <button
                  onClick={() => setShowMoreSheet(false)}
                  className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {overflowItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-md transition-all no-tap-highlight ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                    <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                  </NavLink>
                ))}
              </div>
              <div className="h-2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Nav Bar — 3 left, 1 center, 3 right (last = More) */}
      <div className="fixed inset-x-0 bottom-[env(safe-area-inset-bottom,0px)] z-[95] lg:hidden flex flex-col items-center pointer-events-none">
        <div className="w-full px-3 pointer-events-auto">
          <div className="relative py-2 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-sm flex items-end justify-between px-2">
            {leftItems.map(renderNavItem)}
            {renderCenterItem(centerItem)}
            {rightItems.map(renderNavItem)}

            {/* More button */}
            <button
              key="more-btn"
              onClick={() => setShowMoreSheet(v => !v)}
              className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${(showMoreSheet || isOverflowActive) ? 'bg-emerald-50' : 'bg-transparent'}`}>
                <Settings
                  className={`w-[18px] h-[18px] transition-colors ${(showMoreSheet || isOverflowActive) ? 'text-[#0D4A3E]' : 'text-[#0D4A3E] opacity-35'}`}
                  strokeWidth={(showMoreSheet || isOverflowActive) ? 2.5 : 2}
                />
              </div>
              <span className={`text-[9px] font-medium transition-all truncate w-full text-center ${(showMoreSheet || isOverflowActive) ? 'text-[#0D4A3E]' : 'text-[#0D4A3E] opacity-35'}`}>
                More
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}