import { useState } from 'react'
import { Bell, Search, Loader2, Trash2, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '../../lib/api/providers'

export default function SystemNotificationsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-notifications', { search, page, limit }],
    queryFn: async () => {
      const res = await adminApi.getNotifications({ search, page, limit })
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApi.deleteNotification(id)
    },
    onSuccess: () => {
      toast.success('Notification removed')
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
    },
    onError: () => toast.error('Failed to remove notification')
  })

  // Basic layout mirroring admin pages with table and search
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-200px)] lg:h-[calc(100vh-140px)]">
      <div className="flex-shrink-0 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            System Notifications
          </h1>
          <p className="text-sm text-slate-500 font-medium">Manage and monitor administrative alerts</p>
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search client, shop name, alert text..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-semibold">Loading notifications...</p>
            </div>
          ) : data?.items?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500">
              <Bell className="w-12 h-12 text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No notifications found</h3>
              <p className="text-sm mt-1">We couldn't find anything matching your search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="py-3.5 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 whitespace-nowrap">Alert Details</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 whitespace-nowrap">Related Entity</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 whitespace-nowrap hidden md:table-cell">Date & Time</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.items?.map((item: any) => {
                  const Icon = item.type === 'success' ? CheckCircle2 :
                               item.type === 'warning' ? AlertCircle :
                               item.type === 'danger' ? AlertCircle : Info

                  const iconColor = item.type === 'success' ? 'text-emerald-500' :
                                    item.type === 'warning' ? 'text-amber-500' :
                                    item.type === 'danger' ? 'text-red-500' : 'text-blue-500'
                                    
                  const iconBg = item.type === 'success' ? 'bg-emerald-50' :
                                 item.type === 'warning' ? 'bg-amber-50' :
                                 item.type === 'danger' ? 'bg-red-50' : 'bg-blue-50'

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3 px-4 max-w-xs md:max-w-md">
                        <div className="flex gap-3 items-start">
                          <div className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight mb-0.5">{item.title}</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.message}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {(item.shopName || item.shopOwnerName) ? (
                          <div className="flex flex-col">
                            {item.shopName && <span className="text-xs font-bold text-slate-800">{item.shopName}</span>}
                            {item.shopOwnerName && <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{item.shopOwnerName} (Owner)</span>}
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 italic">System Scope</span>
                        )}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold">{new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if(window.confirm('Delete this notification permanently?')) {
                              deleteMutation.mutate(item.id)
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Details */}
        {data?.pagination?.pages > 1 && (
          <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900">{((page - 1) * limit) + 1}</span> to <span className="text-slate-900">{Math.min(page * limit, data.pagination.total)}</span> of <span className="text-slate-900">{data.pagination.total}</span> entries
            </span>
            
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= data.pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
