import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Package, CalendarCheck, Info, AlertTriangle, ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { platformApi } from '../../lib/api/platform';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean | number;
  referenceId?: string | null;
  referenceType?: string | null;
  createdAt: string;
}

const TYPE_ICON: Record<string, any> = {
  order: Package,
  booking: CalendarCheck,
  success: Check,
  warning: AlertTriangle,
  danger: AlertTriangle,
  system: ShieldCheck,
  info: Info,
};

const TYPE_COLOR: Record<string, string> = {
  order:   'bg-blue-50 text-blue-600 border-blue-100',
  booking: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  warning: 'bg-amber-50 text-amber-600 border-amber-100',
  danger:  'bg-red-50 text-red-600 border-red-100',
  system:  'bg-slate-100 text-slate-600 border-slate-200',
  info:    'bg-sky-50 text-sky-600 border-sky-100',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/** Derive the route to navigate to when a notification is clicked */
function getNavTarget(n: Notification): { path: string; state?: any } | null {
  // Booking reference
  if (n.referenceType === 'booking' || n.type === 'booking') {
    return { path: '/dashboard/hospitality/bookings', state: { highlightId: n.referenceId } };
  }

  // Order reference -> Open client orders in Products (Items) section
  if (
    n.referenceType === 'order' ||
    n.type === 'order' ||
    n.referenceType === 'sale' ||
    n.title?.toLowerCase().includes('order') ||
    n.message?.toLowerCase().includes('ordered')
  ) {
    return { path: '/dashboard/products', state: { openOrders: true, highlightId: n.referenceId } };
  }

  return null;
}

export default function NotificationBell() {
  const [open, setOpen]             = useState(false);
  const [notifications, setNotes]   = useState<Notification[]>([]);
  const [loading, setLoading]       = useState(false);
  const [clearing, setClearing]     = useState(false);
  const panelRef                    = useRef<HTMLDivElement>(null);
  const navigate                    = useNavigate();

  const unread = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await platformApi.getNotifications();
      if (res.success) setNotes(res.data || []);
    } catch (_) {}
  }, []);

  // Initial fetch + poll every 30 s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = async () => {
    setOpen(v => !v);
    if (!open) {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    }
  };

  const handleClick = async (n: Notification) => {
    // Mark as read
    if (!n.isRead) {
      await platformApi.markAsRead(n.id).catch(() => {});
      setNotes(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    }

    // Navigate
    const target = getNavTarget(n);
    if (target) {
      setOpen(false);
      navigate(target.path, { state: target.state });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await platformApi.markAllAsRead();
      setNotes(prev => prev.map(x => ({ ...x, isRead: true })));
    } catch (_) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await platformApi.deleteAllNotifications();
      setNotes([]);
      setOpen(false);
      toast.success('All notifications cleared');
    } catch (_) {
      toast.error('Failed to clear notifications');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        aria-label="Notifications"
        onClick={handleOpen}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
      >
        <Bell size={20} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black px-1 border-2 border-white shadow-md animate-pulse">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="notif-panel"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 z-[200] flex flex-col overflow-hidden"
            style={{ maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-emerald-700" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Notifications
                </span>
                {unread > 0 && (
                  <span className="text-[9px] font-black bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase">
                    {unread} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck size={12} />
                    All read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    disabled={clearing}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Clear all notifications"
                  >
                    {clearing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 size={22} className="animate-spin text-emerald-600" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-sm font-bold text-slate-400">No notifications yet</p>
                  <p className="text-xs text-slate-400 mt-1">New orders and bookings will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => {
                    const Icon = TYPE_ICON[n.type] || Info;
                    const colorClass = TYPE_COLOR[n.type] || TYPE_COLOR.info;
                    const target = getNavTarget(n);
                    const isClickable = !!target;

                    return (
                      <button
                        key={n.id}
                        id={`notif-item-${n.id}`}
                        onClick={() => handleClick(n)}
                        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all ${
                          isClickable ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'
                        } ${!n.isRead ? 'bg-emerald-50/30' : ''}`}
                      >
                        {/* Icon badge */}
                        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${colorClass}`}>
                          <Icon size={16} strokeWidth={2.5} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs leading-snug line-clamp-1 ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] text-slate-400 font-semibold">
                              {timeAgo(n.createdAt)}
                            </span>
                            {isClickable && (
                              <span className="text-[9px] font-black text-emerald-600 tracking-wider">
                                {n.referenceType === 'booking' || n.type === 'booking'
                                  ? '→ View Booking'
                                  : '→ View Order'}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
