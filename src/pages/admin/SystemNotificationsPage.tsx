import { useMemo, useState } from 'react'
import {
  Bell,
  Search,
  Loader2,
  Trash2,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  User,
  Tag,
  Inbox,
  ShieldAlert,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '../../lib/api/providers'

type NotificationType = 'success' | 'warning' | 'danger' | string

function typeConfig(type: NotificationType) {
  switch (type) {
    case 'success':
      return {
        Icon: CheckCircle2,
        label: 'Success',
        icon: 'text-emerald-600',
        iconBg: 'bg-emerald-50',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        accent: 'border-l-emerald-500',
      }
    case 'warning':
      return {
        Icon: AlertCircle,
        label: 'Warning',
        icon: 'text-amber-600',
        iconBg: 'bg-amber-50',
        badge: 'bg-amber-50 text-amber-700 border-amber-100',
        accent: 'border-l-amber-500',
      }
    case 'danger':
      return {
        Icon: AlertCircle,
        label: 'Danger',
        icon: 'text-red-600',
        iconBg: 'bg-red-50',
        badge: 'bg-red-50 text-red-700 border-red-100',
        accent: 'border-l-red-500',
      }
    default:
      return {
        Icon: Info,
        label: type || 'System',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-50',
        badge: 'bg-blue-50 text-blue-700 border-blue-100',
        accent: 'border-l-blue-500',
      }
  }
}

function parseData(raw: unknown) {
  if (!raw) return null
  if (typeof raw === 'object') return raw as Record<string, unknown>
  try {
    return JSON.parse(String(raw)) as Record<string, unknown>
  } catch {
    return null
  }
}

function formatDate(value: unknown, detailed = false) {
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return date.toLocaleString([], detailed
    ? {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    : {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
}

export default function SystemNotificationsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<any>(null)
  const limit = 10

  const { data, isLoading, isFetching } = useQuery<any>({
    queryKey: ['admin-notifications', { search, page, limit }],
    queryFn: async () => {
      const res = await adminApi.getNotifications({ search, page, limit })
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteNotification(id),
    onSuccess: () => {
      toast.success('Notification deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      setSelected(null)
    },
    onError: () => toast.error('Failed to delete notification'),
  })

  const items = data?.items ?? []
  const total = Number(data?.pagination?.total ?? 0)
  const pages = Number(data?.pagination?.pages ?? 1)

  const unreadCount = useMemo(
    () => items.filter((item: any) => !item.isRead).length,
    [items]
  )

  const dangerCount = useMemo(
    () => items.filter((item: any) => item.type === 'danger').length,
    [items]
  )

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this notification permanently?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
    setSelected(null)
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto px-1 sm:px-2 pb-6">
      {/* Page header */}
      <div className="mb-5">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="relative px-5 py-5 sm:px-6">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-emerald-50/70 to-transparent pointer-events-none" />

            <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Bell className="w-5 h-5 text-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      System Notifications
                    </h1>
                    {total > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black">
                        {total} total
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                    Monitor platform alerts, business activity and administrative events.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 xl:min-w-[360px]">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Page</p>
                  <p className="mt-0.5 text-sm font-black text-slate-800">
                    {items.length} <span className="text-[10px] font-semibold text-slate-400">alerts</span>
                  </p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">Unread</p>
                  <p className="mt-0.5 text-sm font-black text-amber-700">{unreadCount}</p>
                </div>
                <div className="hidden sm:block rounded-xl border border-red-100 bg-red-50/50 px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-400">Critical</p>
                  <p className="mt-0.5 text-sm font-black text-red-600">{dangerCount}</p>
                </div>
              </div>
            </div>

            <div className="relative mt-5 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search notifications, shops, owners..."
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-10 text-xs font-semibold text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
                {search && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isFetching && !isLoading && (
                <div className="h-10 px-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`grid gap-4 ${selected ? 'xl:grid-cols-[minmax(0,1fr)_380px]' : 'grid-cols-1'}`}>

        {/* ── Mobile bottom-sheet modal (hidden on xl+) ── */}
        {selected && (() => {
          const cfgM = typeConfig(selected.type)
          const IconM = cfgM.Icon
          const payloadM = parseData(selected.data)
          const payloadEntriesM = payloadM
            ? Object.entries(payloadM).filter(([key]) => key !== 'url')
            : []

          return (
            <div className="xl:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] animate-fadeIn"
                onClick={() => setSelected(null)}
              />

              {/* Sheet */}
              <div
                className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl max-h-[85dvh] animate-slideUp"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                  <div className="w-10 h-1 rounded-full bg-slate-200" />
                </div>

                {/* Sheet header */}
                <div className="h-12 px-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                      Notification Detail
                    </span>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    aria-label="Close details"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1">
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl ${cfgM.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <IconM className={`w-5 h-5 ${cfgM.icon}`} />
                      </div>
                      <div className="min-w-0">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider ${cfgM.badge}`}>
                          <Tag className="w-2.5 h-2.5" />
                          {cfgM.label}
                        </span>
                        <h2 className="mt-2 text-sm font-black leading-snug text-slate-900">
                          {selected.title}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Message</p>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                        <p className="text-xs font-medium leading-relaxed text-slate-700">{selected.message}</p>
                      </div>
                    </div>

                    {(selected.shopName || selected.shopOwnerName) && (
                      <div className="mt-5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Related Business</p>
                        <div className="rounded-xl border border-slate-100 overflow-hidden">
                          {selected.shopName && (
                            <div className="px-3 py-2.5 flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Store className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 truncate">{selected.shopName}</span>
                            </div>
                          )}
                          {selected.shopOwnerName && (
                            <div className="px-3 py-2.5 border-t border-slate-100 flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-slate-500" />
                              </div>
                              <span className="text-xs font-semibold text-slate-500 truncate">{selected.shopOwnerName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Created</p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(selected.createdAt, true)}
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Read Status</p>
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-black ${
                        selected.isRead ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${selected.isRead ? 'bg-slate-400' : 'bg-amber-500'}`} />
                        {selected.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>

                    {payloadM && Object.keys(payloadM).length > 0 && (
                      <div className="mt-5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Additional Data</p>
                        <div className="space-y-1.5">
                          {payloadM.url != null && (
                            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                              <p className="text-[9px] font-black uppercase tracking-wider text-blue-400">URL</p>
                              <p className="mt-0.5 text-[10px] font-semibold text-blue-700 break-all">{String(payloadM.url)}</p>
                            </div>
                          )}
                          {payloadEntriesM.map(([key, value]) => (
                            <div key={key} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{key}</p>
                              <p className="mt-0.5 text-[10px] font-semibold text-slate-700 break-all">
                                {value === null
                                  ? 'null'
                                  : typeof value === 'object'
                                    ? JSON.stringify(value) ?? ''
                                    : String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete footer */}
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleteMutation.isPending}
                    className="w-full h-9 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 text-[11px] font-black flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete Notification
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
        {/* Notification list */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="h-12 px-4 sm:px-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-600">
                Activity Feed
              </span>
            </div>
            {search && (
              <span className="text-[10px] font-bold text-slate-400">
                Filtered by “{search}”
              </span>
            )}
          </div>

          <div className="min-h-[420px]">
            {isLoading ? (
              <div className="min-h-[420px] flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                </div>
                <p className="text-xs font-bold text-slate-600">Loading activity...</p>
                <p className="text-[11px] text-slate-400 mt-1">Fetching the latest notifications</p>
              </div>
            ) : items.length === 0 ? (
              <div className="min-h-[420px] flex flex-col items-center justify-center px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-black text-slate-700">
                  {search ? 'No matching notifications' : 'No notifications yet'}
                </h3>
                <p className="max-w-sm mt-1.5 text-xs font-medium leading-relaxed text-slate-400">
                  {search
                    ? 'Try a different search term or clear the current filter.'
                    : 'System and business alerts will appear here when activity is recorded.'}
                </p>
                {search && (
                  <button
                    onClick={() => handleSearch('')}
                    className="mt-4 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item: any) => {
                  const cfg = typeConfig(item.type)
                  const Icon = cfg.Icon
                  const active = selected?.id === item.id

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(active ? null : item)}
                      className={`w-full text-left px-4 sm:px-5 py-3.5 border-l-2 transition-all group ${active
                          ? `${cfg.accent} bg-emerald-50/40`
                          : 'border-l-transparent hover:border-l-slate-300 hover:bg-slate-50/70'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-[17px] h-[17px] ${cfg.icon}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className={`text-xs font-black truncate ${active ? 'text-emerald-700' : 'text-slate-800'}`}>
                              {item.title}
                            </p>
                            {!item.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" title="Unread" />
                            )}
                          </div>

                          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 font-medium line-clamp-2">
                            {item.message}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${cfg.badge}`}>
                              {cfg.label}
                            </span>

                            {item.shopName && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                <Store className="w-3 h-3" />
                                {item.shopName}
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                              <Clock3 className="w-3 h-3" />
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 mt-2 flex-shrink-0 transition-transform ${active ? 'rotate-90 text-emerald-600' : 'text-slate-300 group-hover:text-slate-500'
                          }`} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {pages > 1 && (
            <div className="h-14 px-4 sm:px-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                <span className="text-slate-700 font-black">
                  {Math.min((page - 1) * limit + 1, total)}
                </span>
                {' '}–{' '}
                <span className="text-slate-700 font-black">
                  {Math.min(page * limit, total)}
                </span>
                {' '}of{' '}
                <span className="text-slate-700 font-black">{total}</span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1 || isFetching}
                  onClick={() => {
                    setPage((p) => p - 1)
                    setSelected(null)
                  }}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="min-w-8 text-center text-[10px] font-black text-slate-500">
                  {page}/{pages}
                </span>
                <button
                  disabled={page >= pages || isFetching}
                  onClick={() => {
                    setPage((p) => p + 1)
                    setSelected(null)
                  }}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Detail panel */}
        {selected && (() => {
          const cfg = typeConfig(selected.type)
          const Icon = cfg.Icon
          const payload = parseData(selected.data)
          const payloadEntries = payload
            ? Object.entries(payload).filter(([key]) => key !== 'url')
            : []

          return (
            <aside className="hidden xl:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-fit xl:sticky xl:top-4">
              <div className="h-12 px-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    Notification Detail
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.icon}`} />
                  </div>
                  <div className="min-w-0">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider ${cfg.badge}`}>
                      <Tag className="w-2.5 h-2.5" />
                      {cfg.label}
                    </span>
                    <h2 className="mt-2 text-sm font-black leading-snug text-slate-900">
                      {selected.title}
                    </h2>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Message
                  </p>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <p className="text-xs font-medium leading-relaxed text-slate-700">
                      {selected.message}
                    </p>
                  </div>
                </div>

                {(selected.shopName || selected.shopOwnerName) && (
                  <div className="mt-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Related Business
                    </p>
                    <div className="rounded-xl border border-slate-100 overflow-hidden">
                      {selected.shopName && (
                        <div className="px-3 py-2.5 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Store className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {selected.shopName}
                          </span>
                        </div>
                      )}
                      {selected.shopOwnerName && (
                        <div className="px-3 py-2.5 border-t border-slate-100 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 truncate">
                            {selected.shopOwnerName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Created
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(selected.createdAt, true)}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Read Status
                  </p>
                  <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-black ${selected.isRead
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-amber-50 text-amber-700'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selected.isRead ? 'bg-slate-400' : 'bg-amber-500'
                      }`} />
                    {selected.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>

                {payload && Object.keys(payload).length > 0 && (
                  <div className="mt-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Additional Data
                    </p>

                    <div className="space-y-1.5">
                      {payload.url != null && (
                        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                          <p className="text-[9px] font-black uppercase tracking-wider text-blue-400">
                            URL
                          </p>
                          <p className="mt-0.5 text-[10px] font-semibold text-blue-700 break-all">
                            {String(payload.url)}
                          </p>
                        </div>
                      )}

                      {payloadEntries.map(([key, value]) => (
                        <div key={key} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {key}
                          </p>
                          <p className="mt-0.5 text-[10px] font-semibold text-slate-700 break-all">
                            {value === null
                              ? 'null'
                              : typeof value === 'object'
                                ? JSON.stringify(value) ?? ''
                                : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/60">
                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={deleteMutation.isPending}
                  className="w-full h-9 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 text-[11px] font-black flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Delete Notification
                </button>
              </div>
            </aside>
          )
        })()}
      </div>
    </div>
  )
}
