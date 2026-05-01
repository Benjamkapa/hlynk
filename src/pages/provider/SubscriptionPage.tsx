import { useState, useEffect } from 'react'
import { Calendar, CreditCard, CheckCircle2, Zap, AlertTriangle, ChevronRight, Loader2, Phone, Star } from 'lucide-react'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { subscriptionsApi } from '../../lib/api/providers'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'

const PLANS = [
  { id: 'BASIC', name: 'Basic Plan', price: 1000, desc: 'Ideal for small businesses starting out with basic sales tracking.', color: 'emerald' },
  { id: 'PRO', name: 'Professional Plan', price: 2500, desc: 'Advanced inventory management and detailed business reports.', color: 'blue' },
]

export default function SubscriptionPage() {
  const queryClient = useQueryClient()
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')

  const { data: subResponse, isLoading: subLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionsApi.getMe
  })

  const { data: historyResponse, isLoading: historyLoading } = useQuery({
    queryKey: ['billing-history'],
    queryFn: subscriptionsApi.getHistory,
    enabled: activeTab === 'history'
  })

  const subscription = subResponse?.data
  const history = historyResponse?.data || []

  const renewMutation = useMutation({
    mutationFn: (phone: string) => subscriptionsApi.renew(phone),
    onSuccess: (data) => {
      toast.success(data.message || 'STK Push sent!')
      setShowRenewModal(false)
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const changePlanMutation = useMutation({
    mutationFn: ({ plan, phone }: { plan: string, phone: string }) => subscriptionsApi.changePlan(plan, phone),
    onSuccess: (data) => {
      toast.success(data.message || 'Payment initiated for plan upgrade!')
      setShowChangeModal(false)
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  if (subLoading) return <div className="p-12 text-center animate-pulse">Loading subscription details...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subscription</h1>
          <p className="text-gray-500 font-medium">Manage your business plan, billing cycle and features</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('current')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Current Plan
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Billing History
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <>
          <div className="bg-white p-10 rounded-[14px] border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10">
              <div className="h-20 w-20 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Zap size={40} />
              </div>
            </div>

            <div className="max-w-xl">
              <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${subscription?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {subscription?.status || 'TRIAL'} Status
              </span>
              <h2 className="text-4xl font-black text-gray-900 mt-6 mb-3 tracking-tight">
                {PLANS.find(p => p.id === subscription?.planName)?.name || 'Trial'} Plan
              </h2>
              <p className="text-gray-500 font-medium text-lg mb-10 leading-relaxed">
                {PLANS.find(p => p.id === subscription?.planName)?.desc || 'Your free trial period to explore the system.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Calendar size={14} /> {subscription?.status === 'TRIAL' ? 'Trial Ends' : 'Next Billing Date'}
                   </p>
                   <p className="text-lg font-black text-gray-900 hl-mono">
                     {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                   </p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <CreditCard size={14} /> Monthly Amount
                   </p>
                   <p className="text-lg font-black text-[#0D4A3E] hl-mono">
                     KES {PLANS.find(p => p.id === subscription?.planName)?.price.toLocaleString() || '0'} / mo
                   </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setMpesaPhone('')
                    setShowRenewModal(true)
                  }}
                  className="bg-[#0D4A3E] text-white px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-xl shadow-emerald-900/10"
                >
                  Renew Now
                </button>
                <button 
                  onClick={() => setShowChangeModal(true)}
                  className="bg-white text-gray-600 px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all"
                >
                  Change Plan
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-8 rounded-[14px] flex items-start gap-6">
            <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-amber-900 mb-1">Payment Method: M-Pesa</h4>
              <p className="text-sm text-amber-700 font-medium leading-relaxed">Your subscription is managed via M-Pesa. To renew or upgrade, you will receive an STK push on your registered number.</p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400">Loading history...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-medium">No billing records found</td></tr>
              ) : (
                history.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all group">
                    <td className="p-6 font-bold text-gray-900 text-sm">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="p-6 font-medium text-gray-500 text-xs hl-mono">{inv.reference}</td>
                    <td className="p-6 font-black text-emerald-700 hl-mono">KES {Number(inv.amount).toLocaleString()}</td>
                    <td className="p-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="text-gray-300 group-hover:text-emerald-600 transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300">
             <div className="flex justify-between items-start mb-6">
               <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                 <CreditCard size={24} />
               </div>
               <button onClick={() => setShowRenewModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
             </div>
             
             <h3 className="text-2xl font-black text-gray-900 mb-2">Renew Subscription</h3>
             <p className="text-gray-500 text-sm mb-8 font-medium">Enter your M-Pesa number to receive the payment prompt.</p>
             
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">M-Pesa Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="0712345678" 
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 text-lg font-black hl-mono"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount to Pay</span>
                  <span className="text-xl font-black text-emerald-900 hl-mono">KES {PLANS.find(p => p.id === subscription?.planName)?.price.toLocaleString() || '0'}</span>
                </div>

                <button 
                  onClick={() => renewMutation.mutate(mpesaPhone)}
                  disabled={renewMutation.isPending || !mpesaPhone}
                  className="w-full bg-[#0D4A3E] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                >
                  {renewMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : 'Pay via M-Pesa'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-slate-50 rounded-[40px] shadow-2xl w-full max-w-4xl p-12 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-start mb-12">
               <div>
                 <h3 className="text-3xl font-black text-slate-900 mb-2">Upgrade Your Business</h3>
                 <p className="text-slate-500 font-medium italic">Unlock advanced features and scale your operations.</p>
               </div>
               <button onClick={() => setShowChangeModal(false)} className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">✕</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {PLANS.map(plan => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-8 rounded-[32px] cursor-pointer transition-all border-2 flex flex-col ${selectedPlan?.id === plan.id ? 'bg-white border-emerald-500 shadow-xl ring-8 ring-emerald-500/5' : 'bg-white border-white hover:border-slate-200 shadow-sm'}`}
                  >
                    <div className={`h-12 w-12 rounded-2xl bg-${plan.color}-50 text-${plan.color}-600 flex items-center justify-center mb-6`}>
                      <Star size={24} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h4>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-2xl font-black text-slate-900 hl-mono">KES {plan.price.toLocaleString()}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/mo</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8 flex-1">{plan.desc}</p>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan?.id === plan.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                      {selectedPlan?.id === plan.id && <CheckCircle2 size={14} />}
                    </div>
                  </div>
                ))}
             </div>

             {selectedPlan && (
               <div className="bg-white p-8 rounded-[32px] border border-slate-100 animate-in slide-in-from-bottom-4">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                     <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">M-Pesa Payment Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            type="text" 
                            placeholder="0712345678" 
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 text-lg font-black hl-mono"
                          />
                        </div>
                     </div>
                     <button 
                       onClick={() => changePlanMutation.mutate({ plan: selectedPlan.id, phone: mpesaPhone })}
                       disabled={changePlanMutation.isPending || !mpesaPhone}
                       className="w-full md:w-auto bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 disabled:opacity-50"
                     >
                       {changePlanMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <>Upgrade to {selectedPlan.name}</>}
                     </button>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  )
}
