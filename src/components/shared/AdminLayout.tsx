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
  Home,
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
  { to: '/admin/user-operations', label: 'Users', icon: Users },
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
        <div className="h-16 lg:h-20 flex items-center justify-between px-4 border-b border-slate-100 flex-shrink-0 pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+0.75rem))] lg:pt-0 min-h-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:min-h-[5rem]">
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

  // Primary tabs (Overview will be injected at the center manually)
  const leftTabs = [
    { to: '/admin/system-performance', label: 'Performance', icon: Activity, end: false },
    { to: '/admin/businesses', label: 'Providers', icon: Building2, end: false },
  ];
  
  const rightTab = [
    { to: '/admin/financials', label: 'Financials', icon: DollarSign, end: false },
  ];

  // Overflow items shown in "More Options" bottom sheet
  const overflowTabs = adminNavItems.filter(
    item => 
      item.to !== '/admin' && 
      !leftTabs.some(p => p.to === item.to) && 
      !rightTab.some(p => p.to === item.to)
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] lg:hidden flex flex-col items-center pointer-events-none">
      {/* Backdrop */}
      <AnimatePresence>
        {showMoreSheet && (
          <motion.div
            key="admin-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[93] bg-slate-900/30 backdrop-blur-xs pointer-events-auto"
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
            className="fixed inset-x-0 bottom-0 z-[94] pointer-events-auto max-h-[90vh] flex flex-col"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, info) => { if (info.offset.y > 120) setShowMoreSheet(false); }}
          >
            <div className="bg-white rounded-t-[3rem] flex flex-col overflow-hidden shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
              {/* Drag handle */}
              <div className="flex justify-center pt-2.5 pb-0.5 flex-shrink-0">
                <div className="w-8 h-[3px] rounded-full bg-slate-200" />
              </div>
              <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
                <p className="text-[13px] font-medium text-slate-800">More</p>
                <button
                  onClick={() => setShowMoreSheet(false)}
                  className="text-[13px] font-normal text-emerald-700 active:opacity-50 transition-opacity"
                >
                  Cancel
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
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                      }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px] text-emerald-700 flex-shrink-0" strokeWidth={2} />
                    <span className="text-[11px] leading-tight truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 flex gap-2 pt-2">
                <Link
                  to="/dashboard"
                  onClick={() => setShowMoreSheet(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
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

      {/* Bottom Nav Glass Dock — Edge-to-edge frosted glass anchored to absolute bottom */}
      <div className="w-full pointer-events-auto bg-white rounded-t-[1.5rem] pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom,0.6rem))] border-t border-slate-100 shadow-[0_-10px_35px_rgba(0,0,0,0.06)]">
        <div className="flex items-end justify-evenly w-full px-4 relative">
          {leftTabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to}
              end={tab.end}
              className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
            >
              {({ isActive }) => (
                <>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-emerald-100/80 text-[#00694B]' : 'bg-transparent text-slate-500'}`}>
                    <tab.icon className="w-[19px] h-[19px]" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] transition-all truncate w-full text-center ${isActive ? 'text-[#00694B]' : 'text-slate-500'}`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* Centered Overview (Home) Tab */}
          <NavLink
            to="/admin"
            end
            className="flex-1 min-w-0 flex flex-col items-center  gap-0.5 py-1 no-tap-highlight"
          >
            {({ isActive }) => (
              <>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80'}`}>
                  <Home className="" strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] mt-0.5 transition-all truncate w-full text-center ${isActive ? 'text-[#0D4A3E]' : 'text-slate-400'}`}>
                  Overview
                </span>
              </>
            )}
          </NavLink>

          {rightTab.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to}
              end={tab.end}
              className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
            >
              {({ isActive }) => (
                <>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-emerald-100/80 text-[#00694B]' : 'bg-transparent text-slate-500'}`}>
                    <tab.icon className="w-[19px] h-[19px]" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] transition-all truncate w-full text-center ${isActive ? 'text-[#00694B]' : 'text-slate-500'}`}>
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
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${showMoreSheet ? 'bg-emerald-100/80 text-[#00694B]' : 'bg-transparent text-slate-500'}`}>
              <MoreHorizontal className="w-[19px] h-[19px]" strokeWidth={showMoreSheet ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] transition-all truncate w-full text-center ${showMoreSheet ? 'text-[#00694B]' : 'text-slate-500'}`}>
              More
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

