import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  LayoutDashboard, Calendar, BarChart2, Users,
  Settings, LogOut, Package, ShoppingCart,
  Zap, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { useLocation, Outlet, NavLink, Link } from "react-router-dom";
import {Tag} from "lucide-react";
import { ADMIN_CSS } from "../../pages/admin/hl-design-system";
import TopNav from "./TopNav";

export default function ProviderLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navGroups = [
    {
      label: 'Storefront',
      items: [
        { to: '/dashboard/sales/new', label: 'Record Sale', icon: Zap },
        { to: '/dashboard/sales', label: 'Sales History', icon: Package, end: true },
        { to: '/dashboard/expenses', label: 'Expenses', icon: ShoppingCart },
      ],
    },
    {
      label: 'Inventory',
      items: [
        { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
        { to: '/dashboard/products', label: 'Products & Stock', icon: Package },
        { to: '/dashboard/customers', label: 'Customers', icon: Users },
      ],
    },
    {
      label: 'Insights',
      items: [
        { to: '/dashboard/reports', label: 'Business Reports', icon: BarChart2 },
        { to: '/dashboard/subscription', label: 'Billing Plan', icon: Calendar },
      ],
    },
  ];

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
        {navGroups.map((group) => (
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
           <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-md bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 shrink-0">
                <Tag size={20} />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] text-emerald-700 font-black uppercase tracking-[0.15em]">{user?.subscription?.planName || 'TRIAL'} PLAN</p>
                 <p className="text-[9px] text-emerald-600/60 font-bold uppercase tracking-widest truncate">Verified Partner</p>
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
      <style>{ADMIN_CSS}</style>
      
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
