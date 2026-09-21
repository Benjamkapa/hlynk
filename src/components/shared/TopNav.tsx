import React from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useAuth } from '../../lib/auth/AuthContext';

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
  '/dashboard/products': 'Products & Pricing',
  '/dashboard/expenses': 'Expenses & Costs',
  '/dashboard/customers': 'Customers & Clients',
  '/dashboard/reports': 'Reports & Analytics',
  '/dashboard/subscription': 'Subscription Plan',
  '/dashboard/staff': 'Staff & Team',
  '/dashboard/developer': 'M-Pesa & API Settings',
  '/dashboard/logs': 'Audit Logs',
  '/dashboard/hospitality': 'Rental Overview',
  '/dashboard/hospitality/properties': 'Units & Assets',
  '/dashboard/hospitality/bookings': 'Bookings & Reservations',
  '/dashboard/hospitality/operations': 'Housekeeping & Tasks',
  '/dashboard/settings': 'Business Settings',
  '/dashboard/help': 'Help & Support',
  '/admin': 'System Overview',
  '/admin/system-performance': 'System Performance',
  '/admin/financials': 'Financial Intelligence',
  '/admin/businesses': 'Provider Management',
  '/admin/user-operations': 'User Operations',
  '/admin/subscriptions': 'Subscriptions Management',
  '/admin/payments': 'Payments & Ledger',
  '/admin/forensic-audit': 'Audit & Security',
  '/admin/community-reviews': 'Community Reviews',
  '/admin/reports': 'System Reports',
  '/admin/notifications': 'System Notifications',
  '/admin/settings': 'System Settings',
  '/admin/help': 'Admin Help',
};

export default function TopNav({
  isCollapsed = true,
  onToggleCollapse,
  title,
  extraActions,
}: TopNavProps) {
  const location = useLocation();
  const { user } = useAuth();

  const pageTitle =
    title ||
    routeTitles[location.pathname] ||
    (location.pathname.startsWith('/dashboard/hospitality')
      ? 'Hospitality'
      : location.pathname.startsWith('/admin')
      ? 'Admin Portal'
      : 'Dashboard');

  const businessName =
    user?.businessName ||
    (user?.role === 'SUPER_ADMIN' || location.pathname.startsWith('/admin')
      ? 'Hlynk Admin'
      : 'hlynk');

  return (
    <header className="pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+0.75rem))] lg:pt-0 glass-bar px-4 sm:px-6 lg:px-8 flex flex-col justify-center z-30 flex-shrink-0 transition-all min-h-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:min-h-[5rem] sticky top-0">
      <div className="h-16 lg:h-20 flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Desktop sidebar collapse toggle button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar collapse"
            >
              {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </button>
          )}
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/fav.png" alt="hlynk" className="h-7 w-7 object-contain shrink-0 lg:hidden" />
            <h1 className="text-base sm:text-lg font-extrabold text-[#00694B] tracking-tight leading-tight truncate">
              <span className="lg:hidden">{businessName}</span>
              {/* <span className="hidden lg:inline">{pageTitle}</span> */}
            </h1>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          {extraActions}

          {/* Notification Bell */}
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}



