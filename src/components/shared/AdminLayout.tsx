import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import {
  LayoutDashboard, BarChart2, Users,
  Settings, HelpCircle, LogOut, PanelLeftClose, PanelLeftOpen, CreditCard, MessageSquare,
  Briefcase, ShieldCheck, Activity, DollarSign
} from 'lucide-react'
import { useState, useEffect } from 'react'
import TopNav from './TopNav'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const navGroups = [
    {
      label: 'System Control',
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/system-performance', label: 'Performance', icon: Activity },
        { to: '/admin/financials', label: 'Financials', icon: DollarSign },
      ],
    },
    {
      label: 'Operations',
      items: [
        { to: '/admin/businesses', label: 'Businesses', icon: Briefcase },
        { to: '/admin/user-operations', label: 'Users', icon: Users },
        { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
        { to: '/admin/community-reviews', label: 'Community Reviews', icon: MessageSquare },
      ],
    },

    {
      label: 'Governance',
      items: [
        { to: '/admin/forensic-audit', label: 'Forensic Audit', icon: ShieldCheck },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
        { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
      ],
    },
  ]

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

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto overflow-x-hidden pt-4 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 mb-4 whitespace-nowrap"
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
                    `hl-sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <item.icon size={20} className={collapsed ? '' : 'shrink-0'} />
                  {!collapsed && <span className="font-bold whitespace-nowrap">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 mt-auto border-t border-slate-50">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div 
              key="full-footer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-gray-50 rounded-lg p-4 border border-gray-100"
            >
               <div className="flex items-center gap-3 mb-4">
                 <div className="h-10 w-10 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                   <HelpCircle size={20} />
                 </div>
                 <div>
                   <p className="text-xs font-black text-gray-900">Help Center</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Docs & Guides</p>
                 </div>
               </div>
               <NavLink to="/admin/help" className="block w-full py-2 bg-white text-gray-600 rounded-md text-center text-xs font-black border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                 Visit Support
               </NavLink>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-footer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <NavLink to="/admin/help" className="h-12 w-12 mx-auto bg-gray-50 rounded-md flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100">
                <HelpCircle size={20} />
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden hl-dash bg-slate-50/50">

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
        <TopNav 
          onMobileMenuToggle={() => setIsMobileOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          // showMail={true}
          // extraActions={
          //   <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          //     Platform Status: Operational
          //   </div>
          // }
        />

        <main className="flex-1 overflow-y-auto px-8 lg:px-12 py-12 bg-slate-50/30">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
