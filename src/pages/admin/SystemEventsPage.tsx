import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Filter, ShieldCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { exportToCSV } from '../../lib/utils/export'
import { ADMIN_CSS } from './hl-design-system'

export default function SystemEventsPage() {
  const [page, setPage] = useState(1)
  const [level, setLevel] = useState('')
  const [category, setCategory] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-system-events', page, level, category],
    queryFn: () => adminApi.getSystemEvents({ page, limit: 40, level: level || undefined, category: category || undefined }),
  })

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  const events = data?.data?.events || []
  const pages = data?.data?.pages || 1

  const pruneMutation = useMutation({
    mutationFn: () => adminApi.pruneSystemEvents(90),
    onSuccess: (res: any) => {
      toast.success(`Pruned ${res.data.deleted} old events`)
      queryClient.invalidateQueries({ queryKey: ['admin-system-events'] })
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>

      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Events</h1>
          <p className="text-gray-500 font-medium">Structured telemetry for debugging, reliability and research</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportToCSV(events, `system_events_page_${page}`)}
            className="bg-white text-gray-600 h-11 px-4 rounded-md border border-gray-100 font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => pruneMutation.mutate()}
            disabled={pruneMutation.isPending}
            className="bg-red-50 text-red-600 h-11 px-4 rounded-md border border-red-100 font-bold text-xs hover:bg-red-100 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} /> {pruneMutation.isPending ? 'Pruning...' : 'Prune >90d'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex flex-wrap gap-3 items-center">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            <Filter size={14} /> Filters
          </div>
          <select
            value={level}
            onChange={(e) => { setPage(1); setLevel(e.target.value) }}
            className="bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-xs font-bold text-gray-700"
          >
            <option value="">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>
          <select
            value={category}
            onChange={(e) => { setPage(1); setCategory(e.target.value) }}
            className="bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-xs font-bold text-gray-700"
          >
            <option value="">All Categories</option>
            <option value="REQUEST">REQUEST</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="AUTH">AUTH</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="BUSINESS">BUSINESS</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actor</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td className="px-6 py-10 text-sm text-gray-400" colSpan={7}>Loading events...</td></tr>
              ) : events.length ? events.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {e.actor ? (
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-gray-800">{e.actor.name}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{e.actor.phone} {e.actor.email ? `• ${e.actor.email}` : ''}</p>
                        <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">{e.actor.role} {e.business?.businessName ? `• ${e.business.businessName}` : ''}</p>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400">System</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${e.level === 'ERROR' ? 'bg-red-100 text-red-700' : e.level === 'WARN' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {e.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-gray-700">{e.category}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-700 max-w-[520px] truncate">{e.action}</td>
                  <td className="px-6 py-4 text-xs font-black text-gray-500">{e.statusCode || '-'}</td>
                  <td className="px-6 py-4 text-xs font-black text-gray-500">{e.durationMs ? `${e.durationMs}ms` : '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td className="px-6 py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest" colSpan={7}>
                    <div className="inline-flex items-center gap-2">
                      <ShieldCheck size={14} /> No events found for current filters
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-2 rounded border border-gray-200 text-xs font-black text-gray-500 disabled:opacity-40">Prev</button>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="px-3 py-2 rounded border border-gray-200 text-xs font-black text-gray-500 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

    </div>
  )
}
