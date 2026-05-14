import { useState } from 'react'
import { Shield, RefreshCcw, FileText, Loader2, Calendar, HardDrive, Filter } from 'lucide-react'
import { providersApi } from '../../lib/api/providers'
import { useQuery } from '@tanstack/react-query'
import FeatureGate from '../../components/shared/FeatureGate'

export default function LogsPage() {
  const [page, setPage] = useState(1)
  const { data: logsData, isLoading: logsLoading, refetch, isRefetching } = useQuery({
    queryKey: ['activity-logs', page],
    queryFn: () => providersApi.getActivityLogs({ page, limit: 15 })
  })

  const handleExport = () => {
    const items = logsData?.data?.items;
    if (!items) return
    const csvContent = [
      ['Date', 'User', 'Action', 'Details', 'IP Address'],
      ...items.map((log: any) => [
        new Date(log.createdAt).toLocaleString(),
        log.user?.name || 'System',
        log.logName || log.action,
        log.details,
        log.ipAddress
      ])
    ].map(e => e.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <FeatureGate feature="audit_logs">
      <div className="space-y-8 animate-in fade-in duration-500 pt-6">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
               <Shield className="text-emerald-600" size={32} />
               Security & Audit Logs
            </h1>
            <p className="text-gray-500 font-medium">Monitor system access and critical data modifications in real-time</p>
          </div>
          <div className="flex gap-3">
             <button
              onClick={() => refetch()}
              className={`p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm ${isRefetching && 'animate-spin'}`}
            >
              <RefreshCcw size={18} />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 h-12 px-8 bg-[#0D4A3E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:-translate-y-0.5 transition-all"
            >
              <FileText size={18} /> Export Full Audit
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: 'Total Events', value: logsData?.data?.pagination?.total || 0, icon: HardDrive, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Retention Period', value: '30 Days', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
             { label: 'Active Filters', value: 'None', icon: Filter, color: 'text-slate-600', bg: 'bg-slate-50' },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 flex items-center gap-4 shadow-sm">
                <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                   <stat.icon size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{stat.label}</p>
                   <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Timeline</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Operation</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Technical Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logsLoading ? (
                  <tr><td colSpan={4} className="p-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-emerald-600 h-10 w-10 mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Decrypting Audit Logs...</p>
                  </td></tr>
                ) : logsData?.data?.items?.length === 0 ? (
                  <tr><td colSpan={4} className="p-32 text-center text-slate-300 italic font-medium">No security events found in this period.</td></tr>
                ) : (
                  logsData?.data?.items?.map((log: any) => (
                    <tr key={log.id} className="hover:bg-emerald-50/20 transition-all group">
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-slate-900 leading-none mb-1.5">{new Date(log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[10px] font-bold text-slate-400 hl-mono">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-white transition-all shadow-inner">
                            {log.user?.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 leading-none mb-1.5">{log.user?.name || 'System'}</p>
                            <p className="text-[10px] font-medium text-slate-400 hl-mono">{log.ipAddress || 'Internal Router'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-1.5 bg-white text-slate-900 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200 shadow-sm group-hover:border-emerald-200 group-hover:text-emerald-700 transition-colors">
                          {log.logName || log.action}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <p className="text-xs text-slate-600 font-medium max-w-[350px] leading-relaxed italic">"{log.details}"</p>
                          {log.actionId && (
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-emerald-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hl-mono opacity-60 group-hover:opacity-100 transition-opacity">Trace: {log.actionId}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {logsData?.data?.pagination && logsData.data.pagination.totalPages > 1 && (
            <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Viewing Page {page} of {logsData.data.pagination.totalPages}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-12 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                >
                  Previous Page
                </button>
                <button
                  onClick={() => setPage(p => Math.min(logsData?.data?.pagination?.totalPages || 1, p + 1))}
                  disabled={page === (logsData?.data?.pagination?.totalPages || 1)}
                  className="h-12 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                >
                  Next Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </FeatureGate>
  )
}
