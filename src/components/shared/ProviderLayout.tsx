import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  LayoutDashboard, Calendar, BarChart2, Users,
  Settings, LogOut, Package, ShoppingCart,
  Zap, PanelLeftClose, PanelLeftOpen, Clock, AlertTriangle
} from "lucide-react";
import { useLocation, Outlet, NavLink, Link } from "react-router-dom";
import {Tag} from "lucide-react";
import TopNav from "./TopNav";

interface NavItem {
  to: string;
  label: string;
  icon: any;
  permission?: string;
  role?: 'PROVIDER' | 'SUPER_ADMIN' | 'STAFF' | 'CUSTOMER';
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        { to: '/dashboard/reports', label: 'Business Reports', icon: BarChart2, permission: 'reports' },
        { to: '/dashboard/subscription', label: 'Billing Plan', icon: Calendar, role: 'PROVIDER' },
      ],
    },
  ];

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      // Super admin sees everything
      if (user?.role === 'SUPER_ADMIN') return true
      
      // If item is role-restricted (e.g. Billing for PROVIDER only)
      if ((item as any).role && user?.role !== (item as any).role) return false

      // If user is STAFF, check permissions
      if (user?.role === 'STAFF') {
        if ((item as any).permission && !user.permissions?.includes((item as any).permission)) {
          return false
        }
      }
      
      return true
    })
  })).filter(group => group.items.length > 0);

  const timeRemainingMs = user?.subscription?.endDate 
    ? new Date(user.subscription.endDate).getTime() - new Date().getTime()
    : 0;

  const daysRemaining = Math.max(0, Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24)));
  const isCritical = daysRemaining < 3 && timeRemainingMs > 0;

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div className="flex flex-col h-full bg-white">
      <div className={`pt-10 pb-12 flex items-center ${collapsed ? 'justify-center' : 'px-8'}`}>
        <Link to="/" className="flex items-center gap-3">
          {collapsed ? (
            <img src="/fav.png" alt="HudumaLynk" className="h-8 w-8" />
          ) : (
            <img src="/logo.png" alt="HudumaLynk" className="h-10 w-auto" />
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto pt-4 custom-scrollbar">
        {filteredGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 mb-4">
                {group.label}
              </p>
            )}
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
                  {!collapsed && <span className="font-bold">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile Summary */}
      <div className="p-4 mt-auto border-t border-slate-50">
         {!collapsed && (
           <div className="bg-emerald-900 rounded-[24px] p-4 border border-emerald-800 shadow-2xl shadow-emerald-950/20 mb-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock size={48} className="text-white" />
              </div>
              <div className="relative z-10">
                 <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">{user?.subscription?.planName || 'TRIAL'} STATUS</p>
                    {isCritical && <AlertTriangle size={12} className="text-amber-400 animate-pulse" />}
                 </div>
                 <CountdownTimer expiryDate={user?.subscription?.endDate} />
                 <p className="text-[8px] text-emerald-500/60 font-black uppercase tracking-[0.1em] mt-3 text-center">Remaining Intelligence Access</p>
              </div>
           </div>
         )}
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
      
      {/* ── MOBILE BACKDROP ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 flex flex-col
          transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:w-[280px]'}
          ${isCollapsed ? 'lg:w-[90px]' : 'lg:w-[280px]'}
        `}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-12 h-6 w-6 rounded-full bg-white text-gray-400 items-center justify-center shadow-lg z-50 border border-slate-100 hover:text-emerald-600 hover:scale-110 transition-all"
        >
          {isCollapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
        </button>
        <SidebarContent collapsed={isCollapsed} />
      </aside>

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
          showMail={true}
          extraActions={
            <Link to="/dashboard/sales/new" className="hidden lg:flex items-center gap-2 px-6 py-3 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#064E3B] hover:-translate-y-0.5 transition-all">
               <Zap size={16} /> Record Sale
            </Link>
          }
        />

        <main className="flex-1 overflow-y-auto px-8 lg:px-12 py-12 bg-slate-50/30">
          <Outlet />
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
