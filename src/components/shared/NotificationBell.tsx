import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Package, CalendarCheck, Info, AlertTriangle, ShieldCheck, Trash2, Star } from 'lucide-react';
import InlineLoader, { ButtonLoader } from './InlineLoader';
import { Modal } from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { platformApi } from '../../lib/api/platform';
import { toast } from 'sonner';
import { setAppBadge, clearAppBadge } from '../../lib/notifications/badge';

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
  review: Star,
  review_request: Star,
};

const TYPE_COLOR: Record<string, string> = {
  order:   'bg-blue-50 text-blue-600 border-blue-100',
  booking: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  warning: 'bg-amber-50 text-amber-600 border-amber-100',
  danger:  'bg-red-50 text-red-600 border-red-100',
  system:  'bg-slate-100 text-slate-600 border-slate-200',
  info:    'bg-sky-50 text-sky-600 border-sky-100',
  review:  'bg-amber-50 text-amber-500 border-amber-100',
  review_request: 'bg-amber-50 text-amber-500 border-amber-100',
};

export function isReviewNotification(n: Notification): boolean {
  const type = (n.type || '').toLowerCase();
  const refType = (n.referenceType || '').toLowerCase();
  const title = (n.title || '').toLowerCase();
  const msg = (n.message || '').toLowerCase();

  return (
    type === 'review' ||
    type === 'review_request' ||
    refType === 'review' ||
    title.includes('share your experience') ||
    title.includes('leave a review') ||
    (title.includes('review') && msg.includes('rating')) ||
    msg.includes('tap to leave a quick rating') ||
    msg.includes('rate your experience')
  );
}

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
function getNavTarget(n: Notification): { path: string; state?: any; label?: string } | null {
  if (n.referenceType === 'booking' || n.type === 'booking') {
    return { path: '/dashboard/hospitality/bookings', state: { highlightId: n.referenceId }, label: '→ View Booking' };
  }

  if (
    n.referenceType === 'order' ||
    n.type === 'order' ||
    n.referenceType === 'sale' ||
    n.title?.toLowerCase().includes('order') ||
    n.message?.toLowerCase().includes('ordered')
  ) {
    return { path: '/dashboard/products', state: { openOrders: true, highlightId: n.referenceId }, label: '→ View Order' };
  }

  if (isReviewNotification(n)) {
    return { path: '#review-modal', label: '⭐ Rate Now' };
  }

  if (
    n.type === 'security' ||
    n.title?.toLowerCase().includes('session') ||
    n.message?.toLowerCase().includes('session')
  ) {
    return { path: '/admin/user-operations', label: '→ View Live Sessions' };
  }

  return null;
}

const RATING_LABELS = ['', 'Needs Improvement 😔', 'Fair 😐', 'Good 🙂', 'Very Good! 😊', 'Excellent Experience! 🌟'];

// ─── Review Modal rendered via portal at document.body level ─────────────────
interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  existingReview: { rating: number; comment?: string } | null;
  submitting: boolean;
}

function ReviewModal({ open, onClose, onSubmit, existingReview, submitting }: ReviewModalProps) {
  const [rating, setRating]           = useState(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment]         = useState(existingReview?.comment || '');

  // Sync if existingReview loads after mount
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    }
  }, [existingReview]);

  // Reset hover when modal closes
  useEffect(() => {
    if (!open) setHoverRating(0);
  }, [open]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating between 1 and 5');
      return;
    }
    await onSubmit(rating, comment.trim());
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      maxWidth="md"
      title="Share Your Experience"
      subtitle="How is hlynk helping your business? Your rating helps us improve the platform for you."
      icon={Star as any}
    >
      <div className="space-y-5 pt-1">
        {/* Star picker */}
        <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-amber-50 to-white rounded-2xl border border-amber-100">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 active:scale-110 focus:outline-none"
                  aria-label={`${star} star`}
                >
                  <Star
                    size={40}
                    className={`transition-all duration-150 ${
                      isFilled
                        ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-sm font-bold text-slate-700 mt-3 h-6 tracking-tight">
            {RATING_LABELS[hoverRating || rating] || 'Tap a star to rate'}
          </p>
        </div>

        {/* Comment */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Your Feedback <span className="font-normal normal-case">(Optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What do you love about hlynk? What features would you like to see next?"
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            Maybe Later
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0D4A3E] hover:bg-[#0A3D33] shadow-md shadow-[#0D4A3E]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <ButtonLoader size="sm" />
                Submitting...
              </>
            ) : (
              <>
                <Star size={15} className="fill-white" />
                Submit Rating
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NotificationBell() {
  const [open, setOpen]           = useState(false);
  const [notifications, setNotes] = useState<Notification[]>([]);
  const [loading, setLoading]     = useState(false);
  const [clearing, setClearing]   = useState(false);
  const panelRef                  = useRef<HTMLDivElement>(null);
  const navigate                  = useNavigate();

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen]   = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview]     = useState<{ rating: number; comment?: string } | null>(null);
  // IDs of review notifications that triggered the modal (to delete them after submit)
  const pendingReviewIds = useRef<string[]>([]);

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

  // Load existing review so modal pre-populates previous rating/feedback if available
  useEffect(() => {
    // Clear any stale lock from older code
    try { localStorage.removeItem('hlynk_provider_reviewed'); } catch (_) {}

    platformApi.getMyReview().then((res) => {
      if (res?.success && res.data) {
        setExistingReview({ rating: res.data.rating, comment: res.data.comment });
      }
    }).catch(() => {});
  }, []);

  // Sync PWA badge
  useEffect(() => { setAppBadge(unread); }, [unread]);

  // Re-sync on push notification
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_NOTIFICATION') fetchNotifications();
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [fetchNotifications]);

  // Close panel on outside click
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
    // Mark as read in background
    if (!n.isRead) {
      await platformApi.markAsRead(n.id).catch(() => {});
      setNotes(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    }

    // Review notification → open review modal
    if (isReviewNotification(n)) {
      // Track which review notification triggered this so we can delete it after submit
      if (!pendingReviewIds.current.includes(n.id)) {
        pendingReviewIds.current.push(n.id);
      }
      setReviewModalOpen(true);
      setOpen(false);
      return;
    }

    // Other navigation
    const target = getNavTarget(n);
    if (target && target.path !== '#review-modal') {
      setOpen(false);
      navigate(target.path, { state: target.state });
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    setSubmittingReview(true);
    try {
      await platformApi.submitReview({ rating, comment });

      setExistingReview({ rating, comment });

      // Remove all review notifications from local state immediately
      setNotes(prev => prev.filter(x => !isReviewNotification(x)));

      // Delete each review notification from the server (backend also auto-cleans, this is belt+braces)
      for (const id of pendingReviewIds.current) {
        platformApi.deleteNotification(id).catch(() => {});
      }
      pendingReviewIds.current = [];

      toast.success('Thank you for sharing your experience! ⭐');
      setReviewModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await platformApi.markAllAsRead();
      setNotes(prev => prev.map(x => ({ ...x, isRead: true })));
      clearAppBadge();
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
      clearAppBadge();
      toast.success('All notifications cleared');
    } catch (_) {
      toast.error('Failed to clear notifications');
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
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
                      {clearing ? <ButtonLoader size={12} /> : <Trash2 size={12} />}
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
                    <InlineLoader size="sm" />
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
                      const isReview = isReviewNotification(n);

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
                            <p className="text-[11px] text-slate-500 font-normal mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[9px] text-slate-400 font-semibold">
                                {timeAgo(n.createdAt)}
                              </span>
                              {isClickable && (
                                <span className={`text-[9px] font-black tracking-wider ${isReview ? 'text-amber-500' : 'text-emerald-600'}`}>
                                  {target?.label ?? '→ Open'}
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

      {/* Review modal rendered at document.body level via portal — no clipping issues */}
      {createPortal(
        <ReviewModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={handleSubmitReview}
          existingReview={existingReview}
          submitting={submittingReview}
        />,
        document.body
      )}
    </>
  );
}
