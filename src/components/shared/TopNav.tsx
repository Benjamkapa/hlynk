import { useState, useRef, useEffect } from 'react'
import { Bell, User, Settings, LogOut, ChevronDown, Shield, Menu, Search, Sparkles } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface TopNavProps {
  onMobileMenuToggle?: () => void
}

export default function TopNav({ onMobileMenuToggle }: TopNavProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node))
        setShowUserMenu(false)
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node))
        setShowNotifications(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Session terminated successfully')
    navigate('/login')
  }

  return (
    <header style={{ height: 72, background: 'rgba(255,255,255,.02)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 100 }}>
      
      {/* Search Console */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {onMobileMenuToggle && (
          <button onClick={onMobileMenuToggle} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--ink)' }} className="lg:block">
             <Menu size={20} />
          </button>
        )}
        <div style={{ position: 'relative', width: 340 }} className="hidden sm:block">
           <Search size={14} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)' }} />
           <input placeholder="Search intelligence, clients, transactions…" style={{ width: '100%', height: 42, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, paddingLeft: 44, fontSize: '.78rem', fontFamily: "'Figtree',sans-serif", color: 'var(--ink)' }} />
        </div>
      </div>

      {/* Terminal Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        
        {/* Alerts */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink3)', cursor: 'pointer', position: 'relative' }}>
             <Bell size={18} />
             <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: 'var(--mint)', border: '2px solid var(--surface2)' }} />
          </button>
          
          {showNotifications && (
            <div style={{ position: 'absolute', top: 54, right: 0, width: 320, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 200 }}>
               <div style={{ padding: '16px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '.6rem', fontWeight: 900, color: 'var(--ink3)', letterSpacing: '.12em' }}>NOTIFICATIONS</span>
                  <button style={{ background: 'none', border: 'none', fontSize: '.6rem', fontWeight: 900, color: 'var(--mint)', cursor: 'pointer' }}>CLEAR ALL</button>
               </div>
               <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '.75rem', color: 'var(--ink3)', fontWeight: 500 }}>No new alerts in the last 24h</p>
               </div>
            </div>
          )}
        </div>

        {/* User Identity */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px', borderRadius: 14, border: '1px solid transparent', cursor: 'pointer', transition: 'all .2s' }}>
             <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--mint)', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 4px 12px rgba(29,186,135,.2)' }}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Avatar" style={{ width: '100%', height: '100%' }} />
             </div>
             <div style={{ textAlign: 'left' }} className="hidden md:block">
                <p style={{ fontSize: '.82rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2 }}>{user?.name}</p>
                <p style={{ fontSize: '.6rem', fontWeight: 900, color: 'var(--mint)', letterSpacing: '.05em', marginTop: 2 }}>{user?.role?.toUpperCase()}</p>
             </div>
             <ChevronDown size={14} style={{ color: 'var(--ink3)', marginLeft: 4 }} className="hidden md:block" />
          </button>

          {showUserMenu && (
            <div style={{ position: 'absolute', top: 58, right: 0, width: 220, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: '8px', zIndex: 200 }}>
               <div style={{ padding: '12px 16px', marginBottom: 4, borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '.6rem', fontWeight: 900, color: 'var(--ink3)', marginBottom: 2 }}>AUTHENTICATED AS</p>
                  <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
               </div>
               <Link to="/dashboard/settings" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, color: 'var(--ink2)', textDecoration: 'none', fontSize: '.8rem', fontWeight: 600 }} className="hl-item-hover">
                  <User size={16} /> Profile Settings
               </Link>
               <Link to="/dashboard/subscription" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, color: 'var(--ink2)', textDecoration: 'none', fontSize: '.8rem', fontWeight: 600 }} className="hl-item-hover">
                  <Sparkles size={16} /> Upgrade Tier
               </Link>
               <div style={{ margin: '6px 0', height: 1, background: 'var(--border)' }} />
               <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700 }}>
                  <LogOut size={16} /> Terminate Session
               </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .hl-item-hover:hover { background: var(--surface2); color: var(--ink) !important; }
      `}</style>
    </header>
  )
}