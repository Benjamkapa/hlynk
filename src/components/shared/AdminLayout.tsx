import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Shield, CreditCard,
  DollarSign, Megaphone, BarChart3, Settings, LifeBuoy,
  ChevronDown, PanelLeftClose, PanelLeftOpen, Menu, X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import TopNav from './TopNav'

export default function AdminLayout() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    businesses: location.pathname.startsWith('/admin/businesses'),
    subscriptions: location.pathname.startsWith('/admin/subscriptions'),
    revenue: location.pathname.startsWith('/admin/revenue'),
  })

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  const toggleMenu = (key: string) =>
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }))

  const navGroups = [
    {
      label: 'Platform Operations',
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        {
          label: 'Businesses', icon: Users, key: 'businesses',
          sub: [
            { label: 'All Providers', to: '/admin/businesses' },
            { label: 'Activity Monitor', to: '/admin/businesses/activity' },
            { label: 'Add Provider', to: '/admin/businesses/new' },
          ],
        },
        {
          label: 'Subscriptions', icon: CreditCard, key: 'subscriptions',
          sub: [
            { label: 'Active Plans', to: '/admin/subscriptions/active' },
            { label: 'Trials', to: '/admin/subscriptions/trials' },
            { label: 'Expired Accounts', to: '/admin/subscriptions/expired' },
          ],
        },
        {
          label: 'Revenue', icon: DollarSign, key: 'revenue',
          sub: [
            { label: 'Earnings Report', to: '/admin/revenue/report' },
            { label: 'Payments History', to: '/admin/revenue/payments' },
          ],
        },
      ],
    },
    {
      label: 'Communication',
      items: [
        { to: '/admin/users', label: 'Users', icon: Shield },
        { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
      ],
    },
    {
      label: 'System',
      items: [
        { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
        { to: '/admin/support', label: 'Support', icon: LifeBuoy },
      ],
    },
  ]

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {/* Logo */}
      <div className={`p-5 border-b border-white/5 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <img 
          src="/fav.png" 
          alt="HudumaLynk Logo" 
          className="h-8 w-auto object-contain"
        />
        {!collapsed && (
          <div className="flex flex-col">
            <p className="font-black text-white text-md tracking-tighter leading-tight">lynk</p>
            {/* <p className="text-[9px] font-black text-[#20C997] uppercase tracking-[0.2em] leading-none">Intelligence</p> */}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#4A5A64] px-3 mb-2">
                {group.label}
              </p>
            )}
            {collapsed && <div className="h-px bg-white/5 mx-2 mb-3" />}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const hasSub = 'sub' in item
                const isOpen = hasSub && openMenus[item.key!]

                return (
                  <div key={item.label}>
                    {hasSub ? (
                      <button
                        onClick={() => toggleMenu(item.key!)}
                        title={collapsed ? item.label : undefined}
                        className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                          isOpen
                            ? 'text-white bg-white/8'
                            : 'text-[#6A7A84] hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                          <item.icon size={17} />
                          {!collapsed && <span>{item.label}</span>}
                        </div>
                        {!collapsed && (
                          <ChevronDown
                            size={13}
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.to!}
                        end={(item as any).end}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                            isActive
                              ? 'bg-[#20C997] text-white shadow-md shadow-[#20C997]/25'
                              : 'text-[#6A7A84] hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        <item.icon size={17} />
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    )}

                    {hasSub && isOpen && !collapsed && (
                      <div className="mt-0.5 ml-3 pl-4 border-l border-white/10 space-y-0.5 pb-1">
                        {item.sub!.map((sub) => (
                          <NavLink
                            key={sub.label}
                            to={sub.to}
                            className={({ isActive }) =>
                              `block px-3 py-2 rounded-md text-xs font-semibold transition-all duration-150 ${
                                isActive
                                  ? 'text-[#20C997] bg-[#20C997]/8'
                                  : 'text-[#6A7A84] hover:text-white hover:bg-white/5'
                              }`
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-white/5 bg-[#0A1D14] ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
          <div className="h-9 w-9 rounded-lg bg-[#20C997]/10 flex items-center justify-center text-[#20C997] shrink-0">
            <Shield size={18} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none">
                Global Intel
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#20C997] animate-pulse block" />
                <p className="text-[10px] text-[#6A7A84] font-semibold">Systems Online</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden font-nunito bg-[#F5F7F8]">

      {/* ── MOBILE BACKDROP ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-[260px] bg-[#0D2419] flex flex-col
          transition-transform duration-300 ease-in-out
          lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Mobile navigation"
      >
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 h-7 w-7 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Close menu"
        >
          <X size={14} />
        </button>
        <SidebarContent collapsed={false} />
      </aside>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`
          hidden lg:flex flex-col shrink-0 bg-[#0D2419] border-r border-white/5
          transition-all duration-300 relative
          ${isCollapsed ? 'w-[72px]' : 'w-[256px]'}
        `}
        aria-label="Desktop navigation"
      >
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[72px] h-6 w-6 rounded-full bg-[#20C997] text-white flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={11} /> : <PanelLeftClose size={11} />}
        </button>
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopNav receives the mobile toggle */}
        <TopNav onMobileMenuToggle={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F5F7F8]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}