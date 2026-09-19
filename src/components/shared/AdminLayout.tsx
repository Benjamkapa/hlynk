import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  DollarSign,
  Building2,
  Users,
  CreditCard,
  Receipt,
  ShieldCheck,
  Star,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../lib/auth/AuthContext';
import TopNav from './TopNav';

interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

const adminNavItems: AdminNavItem[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/system-performance', label: 'Performance', icon: Activity },
  { to: '/admin/financials', label: 'Financials', icon: DollarSign },
  { to: '/admin/businesses', label: 'Providers', icon: Building2 },
  { to: '/admin/user-operations', label: 'User Operations', icon: Users },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/admin/payments', label: 'Payments', icon: Receipt },
  { to: '/admin/forensic-audit', label: 'Audit & Security', icon: ShieldCheck },
  { to: '/admin/community-reviews', label: 'Reviews', icon: Star },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
  { to: '/admin/help', label: 'Admin Help', icon: HelpCircle },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of the Admin portal?')) {
      await logout({ force: true });
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50/50 text-slate-900">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/80 shadow-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header / Brand */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-4 border-b border-slate-100 flex-shrink-0 pt-[env(safe-area-inset-top,0px)] min-h-[calc(4rem+env(safe-area-inset-top,0px))]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-black shadow-md flex-shrink-0">
              <Shield size={22} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-extrabold text-slate-900 tracking-wider uppercase leading-none">
                  Hlynk Admin
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest mt-1">
                  Super Admin
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(v => !v)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-[#00694B] font-bold border border-emerald-100/60 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Info & Logout */}
        <div className="p-3 border-t border-slate-100 flex-shrink-0">
          {!isCollapsed && (
            <div className="mb-3 px-2 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/dashboard"
                className="text-[10px] font-bold text-emerald-700 hover:underline flex-shrink-0"
              >
                Provider UI
              </Link>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100/60 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Log Out"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        <TopNav
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(v => !v)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/30 text-slate-900 pb-28 lg:pb-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation for Admin Portal */}
      <AdminMobileBottomNav onOpenDrawer={() => setMobileOpen(true)} onLogout={handleLogout} />
    </div>
  );
}

// ─── Admin Mobile Bottom Navigation Bar ───────────────────────────────────────
function AdminMobileBottomNav({ onOpenDrawer, onLogout }: { onOpenDrawer: () => void; onLogout: () => void }) {
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setShowMoreSheet(false);
  }, [location.pathname]);

  // Primary 4 tabs + 1 More tab
  const primaryTabs = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/system-performance', label: 'Performance', icon: Activity },
    { to: '/admin/businesses', label: 'Providers', icon: Building2 },
    { to: '/admin/financials', label: 'Financials', icon: DollarSign },
  ];

  // Overflow items shown in "More Options" bottom sheet
  const overflowTabs = adminNavItems.filter(
    item => !primaryTabs.some(p => p.to === item.to)
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] lg:hidden flex flex-col items-center pointer-events-none pb-[max(0.25rem,env(safe-area-inset-bottom,0.25rem))]">
      {/* Backdrop */}
      <AnimatePresence>
        {showMoreSheet && (
          <motion.div
            key="admin-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[93] bg-slate-900/30 pointer-events-auto"
            onClick={() => setShowMoreSheet(false)}
          />
        )}
      </AnimatePresence>

      {/* "More Options" Sheet */}
      <AnimatePresence>
        {showMoreSheet && (
          <motion.div
            key="admin-more-sheet"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-3 z-[94] bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] pointer-events-auto max-h-[75vh] flex flex-col"
          >
            <div className="glass-sheet rounded-[1rem] overflow-hidden border border-white/60 flex flex-col max-h-full p-2 shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
                <p className="text-xs font-extrabold text-slate-700">Admin Modules & Control</p>
                <button
                  onClick={() => setShowMoreSheet(false)}
                  className="glass-btn w-7 h-7 rounded-full flex items-center justify-center text-slate-400 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-2 grid grid-cols-2 gap-2 overflow-y-auto max-h-[50vh] custom-scrollbar">
                {overflowTabs.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setShowMoreSheet(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all no-tap-highlight ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-100'
                          : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                      }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px] text-emerald-700 flex-shrink-0" strokeWidth={2} />
                    <span className="text-[11px] leading-tight font-bold truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 flex gap-2 pt-2">
                <Link
                  to="/dashboard"
                  onClick={() => setShowMoreSheet(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Provider UI
                </Link>
                <button
                  onClick={() => {
                    setShowMoreSheet(false);
                    onLogout();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Nav Bar */}
      <div className="w-full px-3 pointer-events-auto">
        <div className="relative py-2 glass-bar rounded-[2rem] flex items-center justify-between px-3 shadow-xl border border-white/60">
          {primaryTabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to}
              end={tab.end}
              className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
            >
              {({ isActive }) => (
                <>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-emerald-100/80 text-emerald-800' : 'bg-transparent text-slate-400'}`}>
                    <tab.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[9px] font-bold transition-all truncate w-full text-center ${isActive ? 'text-emerald-800' : 'text-slate-500'}`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* More Options Tab */}
          <button
            onClick={() => setShowMoreSheet(v => !v)}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${showMoreSheet ? 'bg-emerald-100/80 text-emerald-800' : 'bg-transparent text-slate-400'}`}>
              <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
            </div>
            <span className={`text-[9px] font-bold transition-all truncate w-full text-center ${showMoreSheet ? 'text-emerald-800' : 'text-slate-500'}`}>
              More
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

