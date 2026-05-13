import { useState, useRef, useEffect } from 'react'
import { Bell, User, LogOut, ChevronDown, Menu, Sparkles, X } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { platformApi } from '../../lib/api/platform'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface TopNavProps {
  onMobileMenuToggle?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  extraActions?: React.ReactNode
  showMail?: boolean
}

export default function TopNav({ onMobileMenuToggle, isCollapsed, onToggleCollapse, extraActions }: TopNavProps) {
  const { user, logout } = useAuth()
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
    refetchInterval: 30000 // Refresh every 30s
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => platformApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => platformApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Tray cleared')
    }
  })

  const notifications = notifyRes?.data || []
  const unreadCount = notifications.filter((n: any) => !n.isRead).length
  const profileImageSrc = user?.photoUrl || null

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
    <header className="h-24 bg-transparent flex items-center justify-between z-[100] px-6 sm:px-8">

      <div className="flex items-center gap-4 flex-1">
        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse} 
            className="hidden lg:flex h-12 w-12 rounded-xl bg-white border border-slate-100 items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm"
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        
        {extraActions && (
          <div className="hidden lg:block">
            {extraActions}
          </div>
        )}

        <div className="flex items-center gap-3 pr-6 border-r border-slate-100">

          {/* Alerts */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all relative ${showNotifications ? 'bg-white border-emerald-200 shadow-xl text-emerald-600' : 'hover:bg-slate-50 hover:border-slate-100 hover:text-slate-400 border-slate-200 text-slate-600 bg-emerald-50'}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white animate-in zoom-in duration-300">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-16 right-0 w-[340px] bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[200]">
                <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Stream</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifyLoading ? (
                     <div className="p-12 text-center animate-pulse text-slate-400 font-black text-[9px] uppercase tracking-widest">Fetching feed...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-16 text-center">
                      <p className="text-sm font-black text-slate-400 italic">No recent alerts</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {notifications.map((n: any) => (
                        <div 
                          key={n.id} 
                          className={`p-5 transition-colors cursor-pointer group relative ${n.isRead ? 'opacity-60 grayscale-[0.5]' : 'bg-emerald-50/20'}`}
                          onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                        >
                          <div className="flex gap-4">
                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 transition-all border ${n.isRead ? 'bg-white border-slate-100 text-slate-400' : 'bg-white border-emerald-100 text-emerald-600 shadow-sm'}`}>
                              <Bell size={14} />
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex justify-between items-start">
                                <p className={`text-sm font-black tracking-tight ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                                {!n.isRead && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                              </div>
                              <p className="text-[11px] font-bold text-slate-500 leading-tight">{n.message}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase hl-mono mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
        </div>

        {/* User Identity */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)} 
            className={`p-1.5 rounded-2xl border flex items-center gap-3 transition-all ${showUserMenu ? 'bg-white border-emerald-200 shadow-xl ring-4 ring-emerald-500/5' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-lg'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 overflow-hidden shadow-2xl shadow-emerald-900/20 border border-white/20 flex items-center justify-center">
              {profileImageSrc ? (
                <img
                  src={profileImageSrc}
                  alt={user?.name ? `${user.name} profile` : 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-white" />
              )}
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
              <Link to={user?.role === 'SUPER_ADMIN' ? "/admin/settings" : "/dashboard/settings"} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                <User size={16} className="opacity-50" /> Profile Security
              </Link>
              {user?.role !== 'SUPER_ADMIN' && (
                <Link to="/dashboard/subscription" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                  <Sparkles size={16} className="text-emerald-500" /> Subscription
                </Link>
              )}
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
