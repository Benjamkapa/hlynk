import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell, CheckCheck, Trash2, Info, AlertTriangle, ShieldCheck,
  Package, CalendarCheck, Check, Star, X, RefreshCw,
} from 'lucide-react';
import { platformApi } from '../../lib/api/platform';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAppBadge } from '../../lib/notifications/badge';
import { isReviewNotification } from '../../components/shared/NotificationBell';
import { useNavigate } from 'react-router-dom';

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
  order:          Package,
  booking:        CalendarCheck,
  success:        Check,
  warning:        AlertTriangle,
  danger:         AlertTriangle,
  system:         ShieldCheck,
  info:           Info,
  review:         Star,
  review_request: Star,
};

const TYPE_COLOR: Record<string, string> = {
  order:          'bg-blue-50 text-blue-600 border-blue-100',
  booking:        'bg-emerald-50 text-emerald-600 border-emerald-100',
  success:        'bg-emerald-50 text-emerald-600 border-emerald-100',
  warning:        'bg-amber-50 text-amber-600 border-amber-100',
  danger:         'bg-red-50 text-red-600 border-red-100',
  system:         'bg-slate-100 text-slate-600 border-slate-200',
  info:           'bg-sky-50 text-sky-600 border-sky-100',
  review:         'bg-amber-50 text-amber-500 border-amber-100',
  review_request: 'bg-amber-50 text-amber-500 border-amber-100',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

type FilterType = 'all' | 'unread' | 'orders' | 'bookings' | 'system';

const FILTER_LABELS: { key: FilterType; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'unread',   label: 'Unread' },
  { key: 'orders',   label: 'Orders' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'system',   label: 'System' },
];

function matchesFilter(n: Notification, filter: FilterType): boolean {
  if (filter === 'all') return true;
  if (filter === 'unread') return !n.isRead;
  if (filter === 'orders') return n.type === 'order' || n.referenceType === 'order' || n.referenceType === 'sale';
  if (filter === 'bookings') return n.type === 'booking' || n.referenceType === 'booking';
  if (filter === 'system') return ['system', 'info', 'warning', 'danger', 'success', 'security', 'review', 'review_request'].includes(n.type);
  return true;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [clearing, setClearing]           = useState(false);
  const [filter, setFilter]               = useState<FilterType>('all');
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const navigate                          = useNavigate();
  const isMounted                         = useRef(true);

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await platformApi.getNotifications();
      if (res.success && Array.isArray(res.data) && isMounted.current) {
        setNotifications(res.data);
        // Clear PWA badge since the user is actively viewing notifications
        clearAppBadge();
      }
    } catch {
      if (!silent) toast.error('Failed to load notifications');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (n: Notification) => {
    if (n.isRead) return;
    try {
      await platformApi.markAsRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    } catch {
      toast.error('Could not mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await platformApi.markAllAsRead();
      setNotifications(prev => prev.map(x => ({ ...x, isRead: true })));
      clearAppBadge();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await platformApi.deleteNotification(id);
      setNotifications(prev => prev.filter(x => x.id !== id));
    } catch {
      toast.error('Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications? This cannot be undone.')) return;
    setClearing(true);
    try {
      await platformApi.deleteAllNotifications();
      setNotifications([]);
      clearAppBadge();
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    } finally {
      setClearing(false);
    }
  };

  const handleClick = async (n: Notification) => {
    // Mark as read first
    if (!n.isRead) await handleMarkRead(n);

    // Navigate based on type
    if (n.type === 'booking' || n.referenceType === 'booking') {
      navigate('/dashboard/hospitality/bookings', { state: { highlightId: n.referenceId } });
      return;
    }
    if (n.type === 'order' || n.referenceType === 'order' || n.referenceType === 'sale') {
      navigate('/dashboard/products', { state: { openOrders: true, highlightId: n.referenceId } });
      return;
    }
    if (isReviewNotification(n)) {
      // Just mark it read; review flow lives in the bell dropdown
      return;
    }
  };

  const unread   = notifications.filter(n => !n.isRead).length;
  const filtered = notifications.filter(n => matchesFilter(n, filter));

  if (loading) {
    return (
      <div className="space-y-6 pt-4 animate-pulse">
        <div className="h-6 w-44 bg-slate-200 rounded" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 max-w-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-emerald-700" />
            Notifications
            {unread > 0 && (
              <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                {unread} new
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">System alerts, booking updates &amp; more</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          {unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-100"
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-200"
              title="Clear all"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">{clearing ? 'Clearing…' : 'Clear all'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {FILTER_LABELS.map(({ key, label }) => {
          const count = key === 'unread'
            ? notifications.filter(n => !n.isRead).length
            : key === 'all'
            ? notifications.length
            : notifications.filter(n => matchesFilter(n, key)).length;

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filter === key
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 bg-white'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[9px] font-black rounded-full px-1.5 py-0.5 ${
                  filter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Bell size={36} className="mx-auto text-slate-200 mb-4" />
          <p className="text-sm font-bold text-slate-400">
            {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {filter === 'all'
              ? 'New orders, bookings and system alerts will appear here'
              : 'Try switching to "All" to see everything'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-slate-50">
          <AnimatePresence initial={false}>
            {filtered.map((n) => {
              const Icon       = TYPE_ICON[n.type] || Info;
              const colorClass = TYPE_COLOR[n.type] || TYPE_COLOR.info;
              const isClickable = n.type === 'booking' || n.referenceType === 'booking'
                || n.type === 'order' || n.referenceType === 'order' || n.referenceType === 'sale';

              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 px-4 py-4 group ${!n.isRead ? 'bg-emerald-50/30' : 'bg-white'} hover:bg-slate-50/60 transition-colors`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass} mt-0.5`}>
                    <Icon size={18} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 min-w-0 ${isClickable ? 'cursor-pointer' : ''}`}
                    onClick={() => isClickable && handleClick(n)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-400 font-semibold">{timeAgo(n.createdAt)}</span>
                      {isClickable && (
                        <span className="text-[10px] font-black text-emerald-600 tracking-wide">→ Open</span>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(n); }}
                          className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(n.id)}
                    disabled={deletingId === n.id}
                    className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete notification"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

