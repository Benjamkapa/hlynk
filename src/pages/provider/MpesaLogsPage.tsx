import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { paymentsApi } from '../../lib/api/providers'
import { Loader2, Smartphone, Calendar, User, Building2, CheckCircle2, XCircle, Clock, Search, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react'
import Pagination from '../../components/shared/Pagination'
import { format } from 'date-fns'

export default function MpesaLogsPage() {
  const [page, setPage] = useState(1)
  
  const { data, isLoading } = useQuery({
    queryKey: ['mpesa-logs', page],
    queryFn: () => paymentsApi.getMpesaLogs({ page, limit: 20 })
  })

  const logs = data?.data?.items || []
  const pagination = data?.data?.pagination

  // Group logs by day
  const groupedLogs = logs.reduce((acc: any, log: any) => {
    const day = format(new Date(log.createdAt), 'MMMM dd, yyyy')
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
             Transaction Audit Logs
          </h1>
          <p className="text-gray-500 font-medium">Real-time M-Pesa STK Push lifecycle tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {isLoading ? (
          <div className="p-32 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-black uppercase tracking-widest text-xs">Fetching Audit Stream...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
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
                <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 rounded-full border border-slate-100">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{day}</span>
                </div>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User / Customer</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Initiator</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Event</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {groupedLogs[day].map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="text-xs font-black text-slate-900 hl-mono">{format(new Date(log.createdAt), 'HH:mm:ss')}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                               <User size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate">{log.customerName || 'N/A'}</p>
                              <p className="text-[10px] font-medium text-slate-400 hl-mono">{log.phone || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{log.initiatorName || 'System'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-sm font-black text-slate-900 hl-mono">KES {Number(log.amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                             log.isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                           }`}>
                             {log.isComplete ? 'Completed' : 'Initiated'}
                           </span>
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
