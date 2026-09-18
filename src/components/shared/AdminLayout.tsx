import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
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
} from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of the Admin portal?')) {
      await logout({ force: true });
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-900 text-slate-100">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header / Brand */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black shadow-lg flex-shrink-0">
              <Shield size={22} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-extrabold text-white tracking-wider uppercase leading-none">
                  Hlynk Admin
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest mt-1">
                  Super Admin
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(v => !v)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
        <div className="p-3 border-t border-slate-800 flex-shrink-0">
          {!isCollapsed && (
            <div className="mb-3 px-2 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/dashboard"
                className="text-[10px] font-bold text-emerald-400 hover:underline flex-shrink-0"
              >
                Provider UI
              </Link>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/40 transition-colors ${
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
        <TopNav
          isMobileOpen={mobileOpen}
          onMobileMenuToggle={() => setMobileOpen(v => !v)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(v => !v)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900 text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
