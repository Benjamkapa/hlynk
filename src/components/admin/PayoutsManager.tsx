import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Banknote, Clock, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Calendar, Search, Star, Smartphone } from 'lucide-react'
import { useState } from 'react'

export default function PayoutsManager() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data: payoutData, isLoading } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => adminApi.getPayouts()
  })

  const markPaidMutation = useMutation({
    mutationFn: ({ tenantId, payoutId, disburse }: { tenantId: string, payoutId?: string, disburse?: boolean }) => 
      adminApi.markPayoutPaid(tenantId, { payoutId, disburse }),
    onSuccess: (res: any) => {
      toast.success(res.message || 'Payout processed successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] })
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to process payout')
    }
  })

  const payouts = payoutData?.data?.payouts || []
  const accrued = payoutData?.data?.accrued || []
  const summary = payoutData?.data?.summary || { totalDue: 0, totalAccrued: 0 }

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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ready for Payout (Dues)</p>
            <h4 className="text-2xl font-black text-slate-900 hl-mono">KES {Number(summary.totalDue || 0).toLocaleString()}</h4>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
             <Banknote size={20} />
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Accruing (Unbatched)</p>
            <h4 className="text-2xl font-black text-blue-900 hl-mono">KES {Number(summary.totalAccrued || 0).toLocaleString()}</h4>
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
             <Clock size={20} />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div>
              <h3 className="text-xl font-black text-slate-900">Qualified Payout Dues</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ready for automated M-Pesa B2C disbursement</p>
           </div>
           <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Search payouts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
              />
           </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filteredPayouts.length === 0 ? (
              <div className="p-20 text-center">
                 <p className="text-sm font-black text-slate-300 italic">No batched payouts ready at this time.</p>
              </div>
            ) : filteredPayouts.map((p: any) => (
              <div key={p.id} className="p-8 hover:bg-slate-50/50 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                   <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${p.type === 'REFERRAL' ? 'bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100'}`}>
                      {p.type === 'REFERRAL' ? <Star size={20} /> : <Banknote size={20} />}
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h5 className="text-base font-black text-slate-900">{p.businessName}</h5>
                         <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${p.type === 'REFERRAL' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {p.type === 'REFERRAL' ? 'Referral Bonus' : 'Vendor Settlement (85/15)'}
                         </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} /> Logged on {new Date(p.createdAt).toLocaleDateString()} — {p.message}
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-10 bg-slate-50 p-4 pr-6 rounded-xl border border-slate-100">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Payout Amount</p>
                       <p className="text-xl font-black text-blue-600 hl-mono">KES {Number(p.amount).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex gap-2">
                       <button 
                         disabled={markPaidMutation.isPending}
                         onClick={() => markPaidMutation.mutate({ tenantId: p.tenantId, payoutId: p.id, disburse: true })}
                         className="px-6 py-2.5 bg-[#0D4A3E] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#0A3D33] active:scale-95 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                       >
                         {markPaidMutation.isPending ? '...' : <><Smartphone size={12} /> B2C Payout</>}
                       </button>
                       <button 
                         disabled={markPaidMutation.isPending}
                         onClick={() => markPaidMutation.mutate({ tenantId: p.tenantId, payoutId: p.id, disburse: false })}
                         className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                       >
                         Mark Paid
                       </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900">Future Liability (Accrued Volume)</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Transaction volume accumulating for next weekly settlement</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {accrued.map((a: any) => (
            <div key={a.tenantId} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <h6 className="text-sm font-black text-slate-700">{a.businessName}</h6>
                <span className="text-[8px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md uppercase tracking-widest">{a.transactionCount} Tx</span>
              </div>
              <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Accrued Net</p>
                  <p className="text-lg font-black text-slate-900 hl-mono">KES {Math.floor(a.netSettlement).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Platform Share</p>
                  <p className="text-[10px] font-black text-emerald-600 hl-mono">KES {Math.floor(a.platformShare).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          {accrued.length === 0 && (
            <div className="col-span-full p-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No unbatched transaction volume detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
