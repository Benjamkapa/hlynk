import { Link, useLocation, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, Receipt, Package, Wallet, Users, 
  BarChart3, Globe, CreditCard, Settings, HelpCircle, 
  PlusCircle, History, Sparkles, ChevronDown, Shield
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import TopNav from "./TopNav";

export default function ProviderLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    sales: location.pathname.startsWith('/dashboard/sales'),
    inventory: location.pathname.startsWith('/dashboard/inventory'),
    expenses: location.pathname.startsWith('/dashboard/expenses'),
  });

  const toggleMenu = (key: string) => setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));

  const navGroups = [
    {
      label: "Management",
      items: [
        { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: "/dashboard" },
        { 
          label: "Sales", icon: <Receipt size={18} />, key: 'sales',
          sub: [
            { label: "Record Sale", href: "/dashboard/sales/new" },
            { label: "Sales History", href: "/dashboard/sales" },
          ]
        },
        { 
          label: "Inventory", icon: <Package size={18} />, key: 'inventory',
          sub: [
            { label: "Products", href: "/dashboard/inventory" },
            { label: "Stock Levels", href: "/dashboard/inventory/stock" },
            { label: "Restock History", href: "/dashboard/inventory/history" },
          ]
        },
        { 
          label: "Expenses", icon: <Wallet size={18} />, key: 'expenses',
          sub: [
            { label: "Record Expense", href: "/dashboard/expenses/new" },
            { label: "Expense History", href: "/dashboard/expenses" },
          ]
        },
        { icon: <Users size={18} />, label: "Customers", href: "/dashboard/customers" },
      ]
    },
    {
      label: "Insights",
      items: [
        { icon: <BarChart3 size={18} />, label: "Reports", href: "/dashboard/reports" },
        { icon: <Globe size={18} />, label: "Public Page", href: "/dashboard/public" },
      ]
    },
    {
      label: "System",
      items: [
        { icon: <CreditCard size={18} />, label: "Subscription", href: "/dashboard/subscription" },
        { icon: <Settings size={18} />, label: "Settings", href: "/dashboard/settings" },
        { icon: <HelpCircle size={18} />, label: "Help", href: "/dashboard/help" },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#F5F7F8] overflow-hidden font-nunito">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0D2419] flex flex-col shrink-0 border-r border-white/5">
        <div className="p-6 border-b border-white/5 bg-[#0D2419]">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="hlynk logo" className="h-9 w-auto transition-transform group-hover:scale-105" />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7A8896] px-4 mb-3 font-mulish">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const hasSub = 'sub' in item;
                  const active = location.pathname === item.href || (hasSub && openMenus[item.key!]);
                  
                  return (
                    <div key={item.label}>
                      {hasSub ? (
                        <button 
                          onClick={() => toggleMenu(item.key!)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            active ? "text-white" : "text-[#7A8896] hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus[item.key!] ? 'rotate-180' : ''}`} />
                        </button>
                      ) : (
                        <Link
                          to={item.href!}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                            location.pathname === item.href 
                              ? "bg-[#20C997] text-white shadow-lg shadow-[#20C997]/20" 
                              : "text-[#7A8896] hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      )}

                      {hasSub && openMenus[item.key!] && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                          {item.sub!.map(sub => (
                            <Link key={sub.label} to={sub.href} 
                              className={`block px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                location.pathname === sub.href ? "text-[#20C997] bg-[#20C997]/5" : "text-[#7A8896] hover:text-white"
                              }`}>
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer - Unified Plan/Role section */}
        <div className="p-6 border-t border-white/5 bg-[#0A1D14]">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-[#20C997]/10 flex items-center justify-center text-[#20C997] shadow-inner">
                {user?.role === 'SUPER_ADMIN' ? <Shield size={20} /> : <Sparkles size={20} />}
             </div>
             <div>
                <p className="text-xs font-black text-white uppercase tracking-widest leading-none">
                  {user?.role === 'SUPER_ADMIN' ? 'System Admin' : 'Growth Plan'}
                </p>
                <p className="text-[10px] text-[#7A8896] font-bold mt-1.5">
                  {user?.role === 'SUPER_ADMIN' ? 'Global Access' : '9 days left'}
                </p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <TopNav />
        
        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-8 bg-[#F5F7F8] custom-scrollbar">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
