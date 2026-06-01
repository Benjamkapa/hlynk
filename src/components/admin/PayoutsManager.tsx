import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Banknote, Clock, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Calendar, Search, Star } from 'lucide-react'
import { useState } from 'react'

export default function PayoutsManager() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data: payoutData, isLoading } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => adminApi.getPayouts()
  })

  const markPaidMutation = useMutation({
    mutationFn: (tenantId: string) => adminApi.markPayoutPaid(tenantId),
    onSuccess: (res: any) => {
      toast.success(res.message || 'Payout marked as paid')
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] })
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to process payout')
    }
  })

  const payouts = payoutData?.data?.items || []
  const summary = payoutData?.data?.summary || { volume7Days: 0, totalVolume: 0 }

  const filteredPayouts = payouts.filter((p: any) => 
    p.businessName.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Rented Gross</p>
            <h4 className="text-xl font-black text-slate-900 hl-mono">KES {Number(summary.totalGross || 0).toLocaleString()}</h4>
          </div>
          <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
             <Banknote size={16} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">hlynk Revenue (10%)</p>
            <h4 className="text-xl font-black text-emerald-600 hl-mono">KES {Number(summary.totalPlatformShare || 0).toLocaleString()}</h4>
          </div>
          <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
             <Star size={16} className="fill-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Net Provider Settlement</p>
            <h4 className="text-xl font-black text-blue-600 hl-mono">KES {Number(summary.totalNetSettlement || 0).toLocaleString()}</h4>
          </div>
          <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
             <Calendar size={16} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h3 className="text-xl font-black text-slate-900">Pending Settlements</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Managed via 10% Revenue Share Agreement</p>
           </div>
           
           <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Find provider..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
              />
           </div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredPayouts.length === 0 ? (
            <div className="p-20 text-center">
               <div className="inline-flex h-16 w-16 bg-slate-50 rounded-full items-center justify-center text-slate-300 mb-4">
                  <CheckCircle2 size={32} />
               </div>
               <p className="text-sm font-black text-slate-400 italic">No pending payouts found. All clear!</p>
            </div>
          ) : filteredPayouts.map((p: any) => {
            const isOverdue = new Date(p.oldestTransaction) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            
            return (
              <div key={p.tenantId} className="p-8 hover:bg-slate-50/50 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                   <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-50 text-red-500 shadow-lg shadow-red-100' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Banknote size={20} />
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h5 className="text-base font-black text-slate-900">{p.businessName}</h5>
                         {isOverdue && (
                           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-md animate-pulse">
                              <AlertCircle size={8} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Overdue 7D+</span>
                           </div>
                         )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><Clock size={12} /> {p.transactionCount} transactions</span>
                         <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(p.oldestTransaction).toLocaleDateString()} — {new Date(p.latestTransaction).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between xl:justify-end gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-right border-r border-slate-200 pr-6">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Collected</p>
                       <p className="text-sm font-black text-slate-500 hl-mono">KES {p.totalGross.toLocaleString()}</p>
                    </div>
                    <div className="text-right border-r border-slate-200 pr-6">
                       <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">hlynk Share (10%)</p>
                       <p className="text-sm font-black text-emerald-600 hl-mono">-KES {p.platformShare.toLocaleString()}</p>
                    </div>
                    <div className="text-right pr-4">
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Net Settlement</p>
                       <p className="text-xl font-black text-blue-600 hl-mono">KES {p.netSettlement.toLocaleString()}</p>
                    </div>
                    
                    <button 
                      disabled={markPaidMutation.isPending}
                      onClick={() => markPaidMutation.mutate(p.tenantId)}
                      className="px-6 py-4 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black active:scale-95 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center gap-2 group"
                    >
                      {markPaidMutation.isPending ? '...' : (
                        <>
                          Paid <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center gap-3">
           <AlertCircle size={16} className="text-slate-400" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Payouts are calculated based on successful STK pushes via HudumaLynk's system credentials.
           </p>
        </div>
      </div>
    </div>
  )
}
