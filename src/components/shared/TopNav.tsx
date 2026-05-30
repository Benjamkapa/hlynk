import { useState, useRef, useEffect } from 'react'
import { Bell, User, LogOut, ChevronDown, Menu, Sparkles, X, Maximize2, Minimize2, Zap } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { useMobileViewport } from '../../lib/MobileViewportContext'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { platformApi } from '../../lib/api/platform'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface TopNavProps {
  isMobileOpen?: boolean
  onMobileMenuToggle?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  extraActions?: React.ReactNode
  showMail?: boolean
}

export default function TopNav({ isMobileOpen, onMobileMenuToggle, isCollapsed, onToggleCollapse, extraActions }: TopNavProps) {
  const { user, logout } = useAuth()
  const { isZoomedOut, toggleZoom } = useMobileViewport()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  const { data: notifyRes, isLoading: notifyLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => platformApi.getNotifications(),
    enabled: !!user,
    refetchInterval: 30000 
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => platformApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const deleteNotificationsMutation = useMutation({
    mutationFn: () => platformApi.deleteAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('History wiped permanently')
    }
  })

  const notifications = notifyRes?.data || []
  const salesNotifications = notifications.filter((n: any) => n.action?.toLowerCase().includes('sale'))
  const unreadCount = salesNotifications.filter((n: any) => !n.isRead).length

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
    <header className="h-16 lg:h-24 bg-transparent flex items-center justify-between z-[100] px-4 sm:px-8 relative">
      
      {/* LEFT: logo on mobile / toggles on desktop */}
      <div className="flex items-center gap-4">
        {/* Mobile: show favicon in original colors, no dark box */}
        <div className="lg:hidden flex items-center">
          <img src="/fav.png" alt="hlynk" className="h-7 w-7 object-contain" />
        </div>

        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse} 
            className="hidden lg:flex h-12 w-12 rounded-full bg-white items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-md"
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}

        {extraActions && (
          <div className="hidden lg:block ml-4">
            {extraActions}
          </div>
        )}
      </div>


      {/* RIGHT: ACTIONS & IDENTITY */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Mobile Zoom Toggle */}
        <button
          onClick={toggleZoom}
          className={`lg:hidden w-11 h-11 flex items-center justify-center transition-all text-slate-600 ${isZoomedOut ? 'hover:scale-110 duration-500 hover:text-emerald-600 active:scale-95' : 'hover:scale-90 duration-500 hover:text-emerald-600 active:scale-90'}`}
          title={isZoomedOut ? "Expand View" : "Compact View"}
        >
          {isZoomedOut ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
        </button>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[.5rem] border flex items-center justify-center transition-all relative ${showNotifications ? 'bg-white border-emerald-200 shadow-xl text-emerald-600' : 'hover:bg-slate-50 hover:border-slate-100 hover:text-slate-400 border-slate-200 text-slate-600 bg-emerald-50'}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] sm:text-[10px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed sm:absolute top-24 sm:top-16 right-4 sm:right-0 w-[calc(100vw-2rem)] sm:w-[340px] bg-white border border-slate-100 rounded-[.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[200]">
              <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Notifications</span>
                {salesNotifications.length > 0 && (
                  <button onClick={() => deleteNotificationsMutation.mutate()} className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:text-red-800 transition-colors">Wipe History</button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifyLoading ? (
                   <div className="p-12 text-center animate-pulse text-slate-400 font-black text-[9px] uppercase tracking-widest">Fetching...</div>
                ) : salesNotifications.length === 0 ? (
                  <div className="p-16 text-center text-sm font-black text-slate-400 italic">No recent sales</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {salesNotifications.map((n: any) => (
                      <div key={n.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => !n.isRead && markReadMutation.mutate(n.id)}>
                        <div className="flex gap-4">
                          <div className="h-8 w-8 shrink-0 bg-white border border-slate-100 rounded-[.4rem] p-1.5 shadow-sm flex items-center justify-center">
                            <img src="/fav.png" alt="hlynk" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-black tracking-tight ${n.isRead ? 'text-slate-400' : 'text-slate-900'}`}>{n.title}</p>
                            <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* IDENTITY PILL */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)} 
            className={`
              flex items-center gap-2 sm:gap-3 p-1 rounded-full sm:rounded-[.5rem] transition-all border
              ${showUserMenu 
                ? 'bg-white shadow-xl ring-4 ring-emerald-500/5 border-emerald-100' 
                : 'bg-white/50 backdrop-blur-md border-white/80 hover:bg-white hover:shadow-lg shadow-sm'
              }
            `}
          >
            <span className="hidden sm:block pl-3 text-sm font-black text-slate-900 tracking-tight">
              {user?.name}
            </span>
            <span className="sm:hidden pl-3 text-xs font-black text-slate-900 tracking-tight">
              {user?.name?.split(' ')[0]}
            </span>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full sm:rounded-[.5rem] bg-emerald-600 overflow-hidden shadow-sm flex items-center justify-center">
              <img
                src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=0D4A3E&color=fff`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronDown size={14} className={`text-slate-400 mr-2 transition-transform duration-300 ${showUserMenu ? 'rotate-180 text-emerald-500' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute top-16 right-0 w-64 bg-white border border-slate-100 rounded-[.5rem] shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[200]">
              <div className="px-5 py-4 mb-2 border-b border-slate-50">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Authenticated ID</p>
                <p className="text-xs font-black text-slate-900 truncate">{user?.email}</p>
              </div>
              <Link to="/dashboard/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-[.5rem] text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700">
                <User size={16} className="opacity-50" /> Profile Security
              </Link>
              <div className="h-px bg-slate-50 my-2 mx-2" />
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[.5rem] text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50"
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
