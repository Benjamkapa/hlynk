import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  LayoutDashboard, Receipt, Package, Wallet, Users,
  BarChart3, Globe, CreditCard, Settings, HelpCircle,
  Sparkles, Shield, ChevronDown, PanelLeftClose, PanelLeftOpen, X
} from "lucide-react";
import TopNav from "./TopNav";
import { useLocation, Outlet, NavLink } from "react-router-dom";
import { PROVIDER_CSS } from "../../pages/admin/hl-design-system";

export default function ProviderLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    sales: location.pathname.startsWith('/dashboard/sales'),
    inventory: location.pathname.startsWith('/dashboard/inventory'),
    expenses: location.pathname.startsWith('/dashboard/expenses'),
  });

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const toggleMenu = (key: string) =>
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));

  const navGroups = [
    {
      label: "Management",
      items: [
        { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: "/dashboard" },
        {
          label: "Sales Ledger", icon: <Receipt size={18} />, key: 'sales',
          sub: [
            { label: "New Transaction", href: "/dashboard/sales/new" },
            { label: "Sales History", href: "/dashboard/sales" },
          ],
        },
        {
          label: "Inventory Hub", icon: <Package size={18} />, key: 'inventory',
          sub: [
            { label: "Product Catalog", href: "/dashboard/inventory" },
            { label: "Stock Monitoring", href: "/dashboard/inventory/stock" },
            { label: "Replenishment Logs", href: "/dashboard/inventory/history" },
          ],
        },
        {
          label: "Expense Tracking", icon: <Wallet size={18} />, key: 'expenses',
          sub: [
            { label: "Record Expense", href: "/dashboard/expenses/new" },
            { label: "Expense Audit", href: "/dashboard/expenses" },
          ],
        },
        { icon: <Users size={18} />, label: "Client Directory", href: "/dashboard/customers" },
      ],
    },
    {
      label: "Intelligence",
      items: [
        { icon: <BarChart3 size={18} />, label: "Operational Reports", href: "/dashboard/reports" },
      ],
    },
    {
      label: "Operational Config",
      items: [
        { icon: <CreditCard size={18} />, label: "Service Tier", href: "/dashboard/subscription" },
        { icon: <Settings size={18} />, label: "Profile Settings", href: "/dashboard/settings" },
        { icon: <HelpCircle size={18} />, label: "Support Terminal", href: "/dashboard/help" },
      ],
    },
  ];

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      <div style={{ padding: collapsed ? '24px 0' : '28px 24px', borderBottom: '1px solid rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(29,186,135,.3)', flexShrink: 0 }}>
           <img src="/fav.png" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }} alt="L" />
        </div>
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '-.02em', lineHeight: 1 }}>LYNK</span>
            <span style={{ fontSize: '.55rem', fontWeight: 900, color: 'var(--mint)', letterSpacing: '.15em', marginTop: 2 }}>PROVIDER HUB</span>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '24px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p style={{ fontSize: '.6rem', fontWeight: 900, color: 'rgba(255,255,255,.25)', letterSpacing: '.18em', textTransform: 'uppercase', paddingLeft: 12, marginBottom: 12 }}>
                {group.label}
              </p>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item) => {
                const hasSub = 'sub' in item;
                const isOpen = hasSub && openMenus[item.key!];

                return (
                  <div key={item.label}>
                    {hasSub ? (
                      <button
                        onClick={() => toggleMenu(item.key!)}
                        style={{ 
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
                          padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'all .2s',
                          background: isOpen ? 'rgba(255,255,255,.03)' : 'transparent',
                          color: isOpen ? '#fff' : 'rgba(255,255,255,.5)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12 }}>
                          {item.icon}
                          {!collapsed && <span style={{ fontWeight: 700, fontSize: '.82rem' }}>{item.label}</span>}
                        </div>
                        {!collapsed && (
                          <ChevronDown
                            size={12}
                            style={{ transition: 'transform .3s', transform: isOpen ? 'rotate(180deg)' : 'none', opacity: 0.5 }}
                          />
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.href!}
                        end={item.href === '/dashboard'}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12, padding: '10px 12px', borderRadius: 10,
                          textDecoration: 'none', transition: 'all .2s', justifyContent: collapsed ? 'center' : 'flex-start'
                        }}
                      >
                        {item.icon}
                        {!collapsed && <span style={{ fontWeight: 700, fontSize: '.82rem' }}>{item.label}</span>}
                      </NavLink>
                    )}

                    {hasSub && isOpen && !collapsed && (
                      <div style={{ marginTop: 4, marginLeft: 22, paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {item.sub!.map((sub) => (
                          <NavLink
                            key={sub.label}
                            to={sub.href}
                            style={({ isActive }) => ({
                              display: 'block', padding: '8px 12px', fontSize: '.75rem', fontWeight: 700, borderRadius: 8,
                              textDecoration: 'none', transition: 'all .2s',
                              color: isActive ? 'var(--mint)' : 'rgba(255,255,255,.4)',
                              background: isActive ? 'rgba(29,186,135,.06)' : 'transparent'
                            })}
                          >
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

      <div style={{ padding: '20px 14px', borderTop: '1px solid rgba(255,255,255,.04)', background: 'rgba(0,0,0,.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mint)' }}>
             <Sparkles size={18} />
          </div>
          {!collapsed && (
            <div>
              <p style={{ fontSize: '.58rem', fontWeight: 900, color: '#fff', letterSpacing: '.12em' }}>OPERATIONAL TIER</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                 <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint)', animation: 'hl-fade 2s infinite' }} />
                 <p style={{ fontSize: '.65rem', fontWeight: 800, color: 'rgba(255,255,255,.4)' }}>PREMIUM NODE</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface)' }}>
      <style>{`
        ${PROVIDER_CSS}
        .nav-link { color: rgba(255,255,255,.5); }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,.04); }
        .nav-link.active { color: #fff; background: var(--mint); box-shadow: 0 8px 20px rgba(29,186,135,.25); }
      `}</style>

      <aside
        style={{
          width: isCollapsed ? 80 : 260, flexShrink: 0, background: 'var(--forest)', display: 'flex', flexDirection: 'column',
          transition: 'width .4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', borderRight: '1px solid rgba(255,255,255,.05)'
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ 
            position: 'absolute', right: -12, top: 84, width: 24, height: 24, borderRadius: '50%', background: 'var(--mint)', color: '#fff',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, boxShadow: '0 4px 12px rgba(29,186,135,.3)'
          }}
        >
          {isCollapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
        </button>
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopNav onMobileMenuToggle={() => setIsMobileOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--surface)', position: 'relative' }}>
          <Outlet />
        </main>
      </div>

      {isMobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsMobileOpen(false)}>
           <aside style={{ width: 280, height: '100%', background: 'var(--forest)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <SidebarContent collapsed={false} />
           </aside>
        </div>
      )}
    </div>
  );
}