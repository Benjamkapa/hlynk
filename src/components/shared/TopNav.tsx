import React from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import NotificationBell from './NotificationBell';

export interface TopNavProps {
  isMobileOpen?: boolean;
  onMobileMenuToggle?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  title?: string;
  extraActions?: React.ReactNode;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/sales/new': 'Record Sale',
  '/dashboard/sales': 'Sales History',
  '/dashboard/products': 'Products',
  '/dashboard/expenses': 'Expenses',
  '/dashboard/customers': 'Customers',
  '/dashboard/reports': 'Reports',
  '/dashboard/subscription': 'Subscription',
  '/dashboard/staff': 'Staff',
  '/dashboard/developer': 'M-Pesa & API',
  '/dashboard/logs': 'Audit Logs',
  '/dashboard/hospitality': 'Rentals',
  '/dashboard/hospitality/properties': 'Units & Assets',
  '/dashboard/hospitality/bookings': 'Bookings',
  '/dashboard/hospitality/operations': 'Operations',
  '/dashboard/settings': 'Settings',
  '/dashboard/help': 'Help',
  '/admin': 'Admin Portal',
  '/admin/system-performance': 'Performance',
  '/admin/financials': 'Financials',
  '/admin/businesses': 'Providers',
  '/admin/user-operations': 'User Ops',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/payments': 'Payments',
  '/admin/forensic-audit': 'Audit',
  '/admin/community-reviews': 'Reviews',
  '/admin/reports': 'Reports',
  '/admin/notifications': 'Notifications',
  '/admin/settings': 'Settings',
  '/admin/help': 'Help',
};

export default function TopNav({
  isMobileOpen = false,
  onMobileMenuToggle,
  isCollapsed = true,
  onToggleCollapse,
  title,
  extraActions,
}: TopNavProps) {
  const location = useLocation();

  const currentTitle =
    title ||
    routeTitles[location.pathname] ||
    (location.pathname.startsWith('/dashboard/hospitality')
      ? 'Hospitality'
      : location.pathname.startsWith('/admin')
      ? 'Admin Portal'
      : 'Dashboard');

  return (
    <header className="h-16 lg:h-20 border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30 flex-shrink-0 transition-all">
      <div className="flex items-center gap-3">
        {/* Desktop sidebar collapse toggle button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}

        {/* Title display (Logo icon only shown on mobile where SideNav is hidden) */}
        <div className="flex items-center gap-2.5">
          <img src="/fav.png" alt="hlynk" className="h-7 w-7 object-contain shrink-0 lg:hidden" />
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {extraActions}

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </header>
  );
}

