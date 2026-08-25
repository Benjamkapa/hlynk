import { useState, useRef, useEffect } from 'react'
import { Bell, User, LogOut, ChevronDown, RefreshCw, Lock as LockIcon } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'

import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { platformApi } from '../../lib/api/platform'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { hasOfflinePin } from '../../lib/offline/offlinePin'

interface TopNavProps {
  isMobileOpen?: boolean
  onMobileMenuToggle?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  extraActions?: React.ReactNode
  showMail?: boolean
}

export default function TopNav({ isMobileOpen, onMobileMenuToggle, isCollapsed, onToggleCollapse, extraActions }: TopNavProps) {
  const { user, logout, lock, refreshUser } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
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
    refetchInterval: 15000 // Polling every 15s for better responsiveness
  })

  // Track which notifications we've already shown as toasts to avoid duplicates
  const [toastedIds, setToastedIds] = useState<Set<string>>(new Set())

  // Listen for real-time messages from Service Worker (Push Notifications)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_NOTIFICATION') {
        const { title, body, type } = event.data.payload
        
        // Show the toast immediately
        if (type === 'success') toast.success(title, { description: body })
        else if (type === 'warning' || type === 'error') toast.error(title, { description: body })
        else toast(title, { description: body })

        // Refresh the notification list so the bell icon updates
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage)
  }, [queryClient])

  // Monitor polled notifications and toast any UNREAD ones we haven't seen yet
  useEffect(() => {
    if (!notifyRes?.data) return

    const unread = notifyRes.data.filter((n: any) => !n.isRead)
    let hasNew = false

    const newIds = new Set(toastedIds)
    let hasChanges = false

    unread.forEach((n: any) => {
      if (!toastedIds.has(n.id)) {
        // If this is not the very first load (to avoid toast bomb on refresh)
        if (toastedIds.size > 0) {
          if (n.type === 'success') toast.success(n.title, { description: n.message })
          else if (n.type === 'warning' || n.type === 'error') toast.error(n.title, { description: n.message })
          else toast(n.title, { description: n.message })
        }
        
        newIds.add(n.id)
        hasChanges = true
      }
    })

    if (hasChanges) {
      setToastedIds(newIds)
    }

    // If it's the first load, just populate the set without toasting
    if (toastedIds.size === 0 && unread.length > 0) {
      const initialIds = new Set(unread.map((n: any) => n.id))
      setToastedIds(initialIds)
    }
  }, [notifyRes, toastedIds])

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
  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (userMenuRef.current && !userMenuRef.current.contains(target))
        setShowUserMenu(false)
      if (notificationRef.current && !notificationRef.current.contains(target))
        setShowNotifications(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchend', handleClickOutside as EventListener)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchend', handleClickOutside as EventListener)
    }
  }, [])


  const handleLogout = async () => {
    const isOffline = !navigator.onLine
    setShowUserMenu(false)
    await logout()
    if (!isOffline) {
      // Full logout — navigate to login page
      // toast.success('Session terminated successfully')
      navigate('/login')
    } else {
      // Offline — session is locked, not destroyed
      toast.info('Session locked. Enter your PIN to continue.')
    }
  }

  const handleLock = () => {
    setShowUserMenu(false)
    lock()
  }

  return (
    <header className="w-full bg-transparent flex flex-col justify-center z-[100] px-4 sm:px-8 relative pt-[env(safe-area-inset-top,0px)]">
      <div className="w-full h-16 lg:h-24 flex items-center justify-between">
      
      {/* LEFT: logo on mobile / toggles on desktop */}
      <div className="flex items-center gap-4">
        {/* Mobile: show favicon in original colors, no dark box */}
        {/* Mobile: show favicon and business name */}
        <div className="lg:hidden flex items-center gap-3">
          <img src="/fav.png" alt="hlynk" className="h-8 w-8 object-contain" />
          <div className="flex flex-col min-w-0">
            <span className="text-normal font-nunito font-bold text-emerald-800 truncate max-w-[140px] leading-none tracking-tight">
              {user?.businessName}
            </span>
          </div>
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
        
        {/* Refresh Data */}
        <button
          onClick={async () => {
            setIsRefreshing(true)
            try {
              await queryClient.refetchQueries()
              if (refreshUser) await refreshUser()
            } catch (_) { /* swallow — individual queries handle their own errors */ }
            setIsRefreshing(false)
          }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 shadow hover:shadow-md hover:scale-105 transition-all text-slate-600 hover:text-emerald-700 flex items-center justify-center"
          title="Refresh Data"
        >
          <RefreshCw size={17} className={`transition-transform duration-700 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow transition-all flex items-center justify-center relative ${showNotifications ? 'border-emerald-500 shadow-md text-emerald-700 ring-2 ring-emerald-500/10' : 'border-slate-200/60 shadow-sm hover:shadow-md hover:scale-105 text-slate-600 hover:text-emerald-700'}`}
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed sm:absolute top-[calc(100%+0.5rem)] right-4 sm:right-0 w-[calc(100vw-2rem)] sm:w-[340px] bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[200]">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Notifications</span>
                {notifications.length > 0 && (
                  <button onClick={() => deleteNotificationsMutation.mutate()} className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:text-red-800 transition-colors">Wipe History</button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifyLoading ? (
                   <div className="p-12 text-center animate-pulse text-slate-400 font-black text-[9px] uppercase tracking-widest">Fetching...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-16 text-center text-sm font-black text-slate-400 italic">No notifications</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((n: any) => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => !n.isRead && markReadMutation.mutate(n.id)}>
                        <div className="flex gap-3">
                          <div className="h-7 w-7 shrink-0 bg-white border border-slate-100 rounded-md p-1 shadow-sm flex items-center justify-center">
                            <img src="/fav.png" alt="hlynk" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className={`text-xs font-black tracking-tight ${n.isRead ? 'text-slate-400' : 'text-slate-900'}`}>{n.title}</p>
                              <span className="text-[9px] text-slate-400 ml-2">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
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

        {/* PROFILE ICON (Circled image with soft shadow, no text name) */}
        <div className="relative ml-1" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)} 
            className={`
              w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all shadow-sm overflow-hidden flex items-center justify-center
              ${showUserMenu 
                ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10' 
                : 'bg-white border-slate-200/60 shadow-sm hover:shadow-md hover:scale-105'
              }
            `}
            title={user?.name || "Profile"}
          >
            <img
              src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=0D4A3E&color=fff`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </button>

          {showUserMenu && (
            <div className="absolute top-[calc(100%+0.5rem)] right-0 w-64 bg-white border border-slate-100 rounded-[.5rem] shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[200]">
              <div className="px-5 py-4 mb-2 border-b border-slate-50">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Authenticated ID</p>
                <p className="text-xs font-black text-slate-900 truncate">{user?.email}</p>
              </div>
              <Link to="/dashboard/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-[.5rem] text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700">
                <User size={16} className="opacity-50" /> Profile Security
              </Link>
              {/* Lock screen shortcut — only shown if PIN is set */}
              {hasOfflinePin() && (
                <button
                  onClick={handleLock}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[.5rem] text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50"
                >
                  <LockIcon size={16} className="opacity-50" /> Lock Screen
                </button>
              )}
              <div className="h-px bg-slate-50 my-2 mx-2" />
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[.5rem] text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50"
              >
                <LogOut size={16} /> {navigator.onLine ? 'Terminate Session' : 'Lock & Secure'}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  )
}
