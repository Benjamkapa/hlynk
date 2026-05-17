import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { paymentsApi } from '../../lib/api/providers'
import { Loader2, Smartphone, Calendar, User, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, Terminal, Database, ArrowRightLeft, Zap, Download, ArrowUpDown } from 'lucide-react'
import Pagination from '../../components/shared/Pagination'
import { SlideOver } from '../../components/shared/SlideOver'
import { toast } from 'sonner'

export default function MpesaLogsPage() {
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  
  const { data, isLoading } = useQuery({
    queryKey: ['mpesa-logs', page, sortOrder],
    queryFn: () => paymentsApi.getMpesaLogs({ page, limit: 8  , sortOrder })
  })

  const exportLogs = async () => {
    try {
      toast.info('Preparing forensic export...')
      const allLogs = await paymentsApi.getMpesaLogs({ page: 1, limit: 1000 })
      const blob = new Blob([JSON.stringify(allLogs.data.items, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mpesa-forensic-audit-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('Audit logs exported successfully')
    } catch (err) {
      toast.error('Failed to export logs')
    }
  }

  const logs = data?.data?.items || []
  const pagination = data?.data?.pagination

  // Group logs by day
  const groupedLogs = logs.reduce((acc: any, log: any) => {
    const day = new Date(log.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    if (!acc[day]) acc[day] = []
    acc[day].push(log)
    return acc
  }, {})

  const getStatusIcon = (status: number) => {
    switch(status) {
      case 0: return <CheckCircle2 className="text-emerald-500" size={16} />
      case 1: return <XCircle className="text-red-500" size={16} />
      case 2: return <Clock className="text-amber-500 animate-pulse" size={16} />
      case 3: return <XCircle className="text-slate-400" size={16} />
      case 4: return <AlertTriangle className="text-red-600" size={16} />
      default: return <Clock size={16} />
    }
  }

  const getStatusLabel = (status: number) => {
    switch(status) {
      case 0: return 'Success'
      case 1: return 'Failed'
      case 2: return 'Pending'
      case 3: return 'Cancelled'
      case 4: return 'Error'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <ShieldCheck className="text-emerald-600" size={32} />
             Forensic Audit Logs
          </h1>
          <p className="text-gray-500 font-medium">Real-time M-Pesa communication stream</p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-6 py-3 bg-white rounded-[.5rem] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all shadow-md active:scale-95"
        >
          <Download size={16} className="text-emerald-600" />
          Export All Logs
        </button>
      </div>

      <SlideOver 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        title="Transaction Payload"
      >
        {selectedLog && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[.5em] p-6 text-emerald-400 hl-mono text-[10px] overflow-auto max-h-[500px]">
              <pre>{JSON.stringify(selectedLog.rawPayload, null, 2)}</pre>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Technical Metadata</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-[.5em] border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Checkout ID</p>
                  <p className="text-[10px] font-black text-slate-900 hl-mono truncate">{selectedLog.checkoutRequestId}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-[.5em] border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Merchant ID</p>
                  <p className="text-[10px] font-black text-slate-900 hl-mono truncate">{selectedLog.merchantRequestId || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-[.5em] border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Result Code</p>
                  <p className="text-[10px] font-black text-slate-900 hl-mono">{selectedLog.resultCode || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-[.5em] border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Event Type</p>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{selectedLog.type === 0 ? 'Outbound (Push)' : 'Inbound (Callback)'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOver>

      <div className="grid grid-cols-1 gap-8">
        {isLoading ? (
          <div className="p-32 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-black uppercase tracking-widest text-xs">Fetching Audit Stream...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-32 text-center bg-white rounded-[.5em] border border-slate-100 shadow-sm">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
               <Smartphone size={40} />
            </div>
            <p className="text-slate-400 font-bold italic">No transaction logs recorded yet.</p>
          </div>
        ) : (
          Object.keys(groupedLogs).map((day) => (
            <div key={day} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-100" />
                <div className="flex items-center gap-2 px-6 py-2 bg-slate-200 shadow-sm rounded-[.5rem]">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{day}</span>
                </div>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="bg-white rounded-[.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th 
                        className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-emerald-600 transition-colors"
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                      >
                        <div className="flex items-center gap-2">
                          Time <ArrowUpDown size={10} />
                        </div>
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Event</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {groupedLogs[day].map((log: any) => (
                      <tr 
                        key={log.id} 
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-8 py-6">
                          <span className="text-xs font-black text-slate-900 hl-mono">{new Date(log.createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             {log.type === 0 ? <Database className="text-blue-500" size={14} /> : <ArrowRightLeft className="text-emerald-500" size={14} />}
                             <span className={`text-[10px] font-black uppercase tracking-widest ${log.type === 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                               {log.type === 0 ? 'STK Init' : 'Callback'}
                             </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate">{log.customerName || 'N/A'}</p>
                              <p className="text-[10px] font-medium text-slate-400 hl-mono">{log.phone || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-sm font-black text-slate-900 hl-mono">KES {Number(log.amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{getStatusLabel(log.status)}</p>
                              {log.resultDesc && log.resultDesc !== 'Success' && (
                                <p className="text-[9px] font-medium text-slate-400 truncate max-w-[150px]">{log.resultDesc}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="p-2 bg-slate-50 group-hover:bg-[#0D4A3E] group-hover:text-white rounded-[.5em] transition-all inline-block">
                              <Terminal size={14} />
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-8">
            <Pagination
              page={page}
              pages={pagination.totalPages}
              total={pagination.total}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
