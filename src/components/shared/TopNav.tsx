import { useState, useRef, useEffect } from 'react'
import { Bell, User, LogOut, ChevronDown, Menu, Search, Sparkles, CheckCircle2, AlertCircle, ShoppingBag, Mail } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface TopNavProps {
  onMobileMenuToggle?: () => void
  extraActions?: React.ReactNode
  showMail?: boolean
}

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'sale', title: 'New Sale Recorded', desc: 'KES 2,400 received via M-Pesa', time: '2 mins ago', icon: <ShoppingBag size={14} className="text-emerald-500" /> },
  { id: 2, type: 'stock', title: 'Low Stock Alert', desc: 'Infinix Screen (×2 left)', time: '45 mins ago', icon: <AlertCircle size={14} className="text-amber-500" /> },
  { id: 3, type: 'system', title: 'System Updated', desc: 'Version 2.4.0 is now live', time: '3h ago', icon: <CheckCircle2 size={14} className="text-blue-500" /> },
]

export default function TopNav({ onMobileMenuToggle, extraActions, showMail = false }: TopNavProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileImageSrc = !avatarFailed && (user?.photoUrl || user?.avatar)
    ? (user.photoUrl || user.avatar)
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`

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

  useEffect(() => {
    setAvatarFailed(false)
  }, [user?.avatar])

  const handleLogout = async () => {
    await logout()
    toast.success('Session terminated successfully')
    navigate('/login')
  }

  return (
    <header className="h-24 bg-transparent flex items-center justify-between z-[100] px-6 sm:px-8">

      {/* Search Console Removed */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {onMobileMenuToggle && (
          <button 
            onClick={onMobileMenuToggle} 
            className="lg:hidden h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-slate-100"
          >
            <Menu size={22} />
          </button>
        )}
      </div>

      {/* Terminal Actions */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {extraActions && (
          <div className="hidden lg:block">
            {extraActions}
          </div>
        )}

        <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
          {showMail && (
            <button className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all relative">
              <Mail size={20} />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
            </button>
          )}

          {/* Alerts */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all relative ${showNotifications ? 'bg-white border-emerald-200 shadow-xl text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600 hover:bg-emerald-50'}`}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-16 right-0 w-[340px] bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[200]">
                <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligence Stream</span>
                  <button 
                    onClick={() => { setNotifications([]); toast.success('All notifications cleared') }}
                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-16 text-center">
                      <p className="text-sm font-black text-slate-400 italic">No new intelligence found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {notifications.map(n => (
                        <div key={n.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all">
                              {n.icon}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-black text-slate-900 tracking-tight">{n.title}</p>
                              <p className="text-xs font-bold text-slate-500 leading-relaxed">{n.desc}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase hl-mono">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center">
                  <Link to="/dashboard/reports" onClick={() => setShowNotifications(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                    View Full System Logs
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Identity */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)} 
            className={`p-1.5 rounded-2xl border flex items-center gap-3 transition-all ${showUserMenu ? 'bg-white border-emerald-200 shadow-xl ring-4 ring-emerald-500/5' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-lg'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 overflow-hidden shadow-2xl shadow-emerald-900/20 border border-white/20">
              <img
                src={profileImageSrc}
                alt={user?.name ? `${user.name} profile` : 'Profile'}
                className="w-full h-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            </div>
            <div className="text-left hidden xl:block pr-3">
              <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1.5">{user?.name}</p>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 mr-1 transition-transform duration-300 ${showUserMenu ? 'rotate-180 text-emerald-500' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute top-16 right-0 w-64 bg-white border border-slate-100 rounded-[24px] shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[200]">
              <div className="px-5 py-4 mb-2 border-b border-slate-50">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Authenticated ID</p>
                <p className="text-xs font-black text-slate-900 tracking-tight truncate">{user?.email}</p>
              </div>
              <Link to="/dashboard/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                <User size={16} className="opacity-50" /> Profile Security
              </Link>
              <Link to="/dashboard/subscription" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                <Sparkles size={16} className="text-emerald-500" /> Subscription
              </Link>
              <div className="h-px bg-slate-50 my-2 mx-2" />
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-all"
              >
                <LogOut size={16} /> Terminate Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
