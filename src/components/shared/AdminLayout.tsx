import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Shield, Sparkles, CreditCard,
  DollarSign, Megaphone, BarChart3, Settings, LifeBuoy,
  ChevronDown, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { useState } from 'react'
import TopNav from './TopNav'

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    businesses: location.pathname.startsWith('/admin/businesses'),
    subscriptions: location.pathname.startsWith('/admin/subscriptions'),
    revenue: location.pathname.startsWith('/admin/revenue'),
  });

  const toggleMenu = (key: string) => setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));

  const navGroups = [
    {
      label: "Platform Operations",
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        {
          label: 'Businesses', icon: Users, key: 'businesses',
          sub: [
            { label: 'All Providers', to: '/admin/businesses' },
            { label: 'Activity Monitor', to: '/admin/businesses/activity' },
            { label: 'Add Provider', to: '/admin/businesses/new' },
          ]
        },
        {
          label: 'Subscriptions', icon: CreditCard, key: 'subscriptions',
          sub: [
            { label: 'Active Plans', to: '/admin/subscriptions/active' },
            { label: 'Trials', to: '/admin/subscriptions/trials' },
            { label: 'Expired Accounts', to: '/admin/subscriptions/expired' },
          ]
        },
        {
          label: 'Revenue', icon: DollarSign, key: 'revenue',
          sub: [
            { label: 'Earnings Report', to: '/admin/revenue/report' },
            { label: 'Payments History', to: '/admin/revenue/payments' },
          ]
        },
      ]
    },
    {
      label: "Communication",
      items: [
        { to: '/admin/users', label: 'Users', icon: Shield },
        { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
      ]
    },
    {
      label: "System",
      items: [
        { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
        { to: '/admin/support', label: 'Support', icon: LifeBuoy },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden font-nunito bg-[#F5F7F8]">
      <aside className={`app-sidebar ${isCollapsed ? 'w-[80px]' : 'w-[260px]'} bg-[#0D2419] flex flex-col shrink-0 border-r border-white/5 transition-all duration-300 relative`}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-[#20C997] text-white flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform"
        >
          {isCollapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
        </button>

        {/* Logo */}
        <div className={`p-6 border-b border-white/5 bg-[#0D2419] ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center shrink-0 shadow-lg shadow-white/10">
              <Shield size={16} className="text-[#0D2419]" />
            </div>
            {!isCollapsed && (
              <div>
                <p className="font-black text-white text-sm tracking-tighter font-nunito uppercase">hlynk</p>
                <p className="text-[9px] font-black text-[#20C997] uppercase tracking-[0.2em] leading-none">Intelligence</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7A8896] px-4 mb-3 font-mulish">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const hasSub = 'sub' in item;
                  const active = (item.to && location.pathname === item.to) || (hasSub && openMenus[item.key!]);

                  return (
                    <div key={item.label}>
                      {hasSub ? (
                        <button
                          onClick={() => toggleMenu(item.key!)}
                          title={isCollapsed ? item.label : ''}
                          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-md text-sm font-bold transition-all ${active ? "text-white" : "text-[#7A8896] hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon size={18} />
                            {!isCollapsed && <span>{item.label}</span>}
                          </div>
                          {!isCollapsed && <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus[item.key!] ? 'rotate-180' : ''}`} />}
                        </button>
                      ) : (
                        <NavLink to={item.to!} end={(item as any).end}
                          title={isCollapsed ? item.label : ''}
                          className={({ isActive }) => `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-md text-sm font-bold transition-all duration-200 ${isActive
                              ? "bg-[#20C997] text-white shadow-lg shadow-[#20C997]/20"
                              : "text-[#7A8896] hover:bg-white/5 hover:text-white"
                            }`}>
                          <item.icon size={18} />{!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                      )}

                      {hasSub && openMenus[item.key!] && !isCollapsed && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                          {item.sub!.map(sub => (
                            <NavLink key={sub.label} to={sub.to}
                              className={({ isActive }) => `block px-4 py-2 rounded-md text-xs font-bold transition-all ${isActive ? "text-[#20C997] bg-[#20C997]/5" : "text-[#7A8896] hover:text-white"
                                }`}>
                              {sub.label}
                            </NavLink>
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

        {/* Sidebar Footer */}
        <div className={`p-6 border-t border-white/5 bg-[#0A1D14] ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
              <Shield size={20} />
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest leading-none">Global Intel</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] text-[#7A8896] font-bold">Systems Online</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-8 bg-[#F5F7F8] custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
