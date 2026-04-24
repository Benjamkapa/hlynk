import { useState, useRef, useEffect } from 'react'
import { Bell, User, Settings, LogOut, ChevronDown, Sparkles, Package, AlertTriangle, Shield } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function TopNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setShowUserMenu(false)
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const notifications = [
    { id: 1, title: 'Low Stock Alert', desc: 'Brake Pads are below 5 units', icon: Package, color: 'text-amber-500', time: '2h ago' },
    { id: 2, title: 'New Request', desc: 'You have a new service request', icon: Sparkles, color: 'text-primary', time: '5h ago' },
    { id: 3, title: 'Subscription', desc: 'Your trial expires in 3 days', icon: AlertTriangle, color: 'text-red-500', time: '1d ago' },
  ]

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-border z-40 sticky top-0">
      <div className="flex-1">
        {/* Search or breadcrumbs could go here */}
      </div>

      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`nav-icon-btn ${showNotifications ? 'border-primary text-primary bg-primary/5' : ''}`}
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          {showNotifications && (
            <div className="dropdown-menu w-80">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h4 className="font-bold text-sm font-ubuntu text-foreground">Notifications</h4>
                <button className="text-[10px] font-black text-primary uppercase tracking-widest">Mark all read</button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 hover:bg-muted/50 border-b border-border last:border-none transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${n.color.replace('text-', 'bg-')}/10 ${n.color}`}>
                        <n.icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-foreground font-ubuntu leading-tight">{n.title}</p>
                          <span className="text-[10px] text-muted-foreground font-medium">{n.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{n.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border">
                <button className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                  View all activity
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-border mx-1" />

        {/* User Profile */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-muted transition-all duration-200 border border-transparent hover:border-border"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-foreground font-ubuntu leading-none">{user?.name}</p>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.1em] mt-1.5">{user?.role?.replace('_', ' ')}</p>
            </div>
            <div className="h-11 w-11 rounded-xl border-2 border-white shadow-md overflow-hidden bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="dropdown-menu">
              <div className="px-4 py-3 border-b border-border mb-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Account Info</p>
                <p className="text-sm font-bold text-foreground truncate">{user?.email || 'No email set'}</p>
              </div>
              <Link to="/dashboard/settings" className="dropdown-item">
                <User size={16} />
                <span>View Profile</span>
              </Link>
              {user?.role === 'SUPER_ADMIN' && (
                <Link to="/admin" className="dropdown-item text-primary font-black">
                  <Shield size={16} />
                  <span>Admin Panel</span>
                </Link>
              )}
              <Link to="/dashboard/settings" className="dropdown-item">
                <Settings size={16} />
                <span>Account Settings</span>
              </Link>
              <div className="my-1 border-t border-border" />
              <button onClick={handleLogout} className="dropdown-item dropdown-item-danger w-full">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
