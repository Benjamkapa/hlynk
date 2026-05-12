import { useState, useEffect } from 'react'
import { Calendar, CreditCard, CheckCircle2, Zap, AlertTriangle, ChevronRight, Loader2, Phone, Star } from 'lucide-react'
import { subscriptionsApi } from '../../lib/api/providers'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { useAuth } from '../../lib/auth/AuthContext'

const PLANS = [
  { 
    id: 'LITE', 
    name: 'Lite Plan', 
    price: 1999, 
    desc: 'Simple digital control for everyday businesses like kiosks, salons, and mini shops.', 
    color: 'emerald',
    features: ['POS Checkout', 'Product & Service Sales', 'Cash & M-Pesa Tracking', 'Basic Inventory tracking'],
    notIncluded: ['Net Profit Tracking', 'Expense Tracking', 'Advanced Reports', 'Multi-User']
  },
  { 
    id: 'PLUS', 
    name: 'Plus Plan', 
    price: 4999, 
    desc: 'Built for growing businesses like minimarts, pharmacies, and hardware shops.', 
    color: 'blue',
    features: ['Everything in Lite', 'Net Profit Tracking', 'Expense Tracking', 'Revenue Trend Charts', 'Staff Salaries'],
    notIncluded: ['Unlimited Staff Accounts', 'Advanced Audit Logs']
  },
  { 
    id: 'MAX', 
    name: 'Max Plan', 
    price: 11999, 
    desc: 'Full operational management for large retail, distributors, and institutions.', 
    color: 'purple',
    features: ['Everything in Plus', 'Unlimited Staff Accounts', 'Advanced Audit Logs', 'Full KPI Dashboard Access', 'Priority Support'],
    notIncluded: []
  },
]

const FEATURE_COMPARISON = [
  { name: 'POS Checkout', lite: true, plus: true, max: true },
  { name: 'Inventory Tracking', lite: true, plus: true, max: true },
  { name: 'M-Pesa Tracking', lite: true, plus: true, max: true },
  { name: 'Net Profit Tracking', lite: false, plus: true, max: true },
  { name: 'Expense Tracking', lite: false, plus: true, max: true },
  { name: 'Staff Salaries', lite: false, plus: true, max: true },
  { name: 'Security Activity Logs', lite: false, plus: true, max: true },
  { name: 'Unlimited Staff', lite: false, plus: false, max: true },
  { name: 'Advanced Audit Logs', lite: false, plus: false, max: true },
  { name: 'Priority Support', lite: false, plus: false, max: true },
]

import { SubscriptionExpiredBanner } from '../../components/shared/SubscriptionGuard'
import { ConfirmModal } from '../../components/shared/ConfirmModal'

export default function SubscriptionPage() {
  const queryClient = useQueryClient()
  const { refreshUser } = useAuth()
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [showConfirmChange, setShowConfirmChange] = useState(false)
  const [showConfirmRenew, setShowConfirmRenew] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false)

  const { data: subResponse, isLoading: subLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionsApi.getMe,
    refetchInterval: isWaitingForPayment ? 3000 : false
  })

  const { data: historyResponse, isLoading: historyLoading } = useQuery({
    queryKey: ['billing-history'],
    queryFn: subscriptionsApi.getHistory,
    enabled: activeTab === 'history' || isWaitingForPayment,
    refetchInterval: isWaitingForPayment ? 3000 : false
  })

  // Watch for payment status change
  useEffect(() => {
    if (isWaitingForPayment && historyResponse?.data) {
      const latestPayment = historyResponse.data[0];
      if (latestPayment && latestPayment.status !== 'PENDING') {
        setIsWaitingForPayment(false);
        if (latestPayment.status === 'PAID') {
          toast.success("Payment successful! Your subscription is now active.");
          queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
          refreshUser();
        } else if (latestPayment.status === 'FAILED') {
          toast.error("Payment failed or was cancelled by user.");
        }
      }
    }
  }, [historyResponse, isWaitingForPayment, queryClient]);

  const subscription = subResponse?.data
  const history = historyResponse?.data || []

  const isTrial = subscription?.status === 'TRIAL'
  const isExpired = subscription?.status === 'EXPIRED' || (subscription?.endDate && new Date(subscription.endDate) < new Date())

  const renewMutation = useMutation({
    mutationFn: (phone: string) => subscriptionsApi.renew(phone),
    onSuccess: (data) => {
      toast.success(data.message || 'STK Push sent!')
      setShowRenewModal(false)
      setIsWaitingForPayment(true)
      setTimeout(() => setIsWaitingForPayment(false), 60000)
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const changePlanMutation = useMutation({
    mutationFn: ({ plan, phone }: { plan: string, phone: string }) => subscriptionsApi.changePlan(plan, phone),
    onSuccess: (data) => {
      toast.success(data.message || 'Payment initiated for plan upgrade!')
      setShowChangeModal(false)
      setIsWaitingForPayment(true)
      setTimeout(() => setIsWaitingForPayment(false), 60000)
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  if (subLoading) return <div className="p-12 text-center animate-pulse">Loading subscription details...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      {isWaitingForPayment && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin text-emerald-600" size={24} />
          <div>
            <h4 className="font-black text-sm tracking-tight">Waiting for Payment...</h4>
            <p className="text-xs font-medium text-emerald-600/80">Please check your phone and enter your M-Pesa PIN. The page will refresh automatically.</p>
          </div>
        </div>
      )}

      <SubscriptionExpiredBanner expired={isExpired} />

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subscription</h1>
          <p className="text-gray-500 font-medium italic">"Know your real profit. Not just what came in — what stayed."</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('current')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Manage Plan
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
          {isTrial && !isExpired && (
            <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-2xl shadow-emerald-900/20 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-xl font-black tracking-tight">You're exploring HudumaLynk on a 7-Day Free Trial</h3>
                <p className="text-emerald-200 text-sm font-medium">No payment required. See your real profit before you pay.</p>
              </div>
              <div className="bg-emerald-800 px-6 py-3 rounded-xl border border-emerald-700/50 flex flex-col items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Trial Ends In</p>
                 <p className="text-2xl font-black hl-mono">
                    {subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} Days
                 </p>
              </div>
            </div>
          )}

          <div className="bg-white p-10 rounded-[28px] border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Zap size={160} className="text-emerald-900" />
            </div>

            <div className="max-w-xl relative z-10">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isExpired ? 'EXPIRED' : (isTrial ? 'FREE TRIAL' : 'ACTIVE SUBSCRIPTION')}
              </span>
              <h2 className="text-5xl font-black text-gray-900 mt-6 mb-4 tracking-tighter">
                {PLANS.find(p => p.id === subscription?.planName)?.name || 'Custom'}
              </h2>
              <p className="text-gray-500 font-medium text-xl mb-12 leading-relaxed">
                {PLANS.find(p => p.id === subscription?.planName)?.desc || 'Your current subscription plan details.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-12">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Calendar size={14} className="text-emerald-500" /> {isTrial ? 'Trial Ends' : 'Next Billing Date'}
                   </p>
                   <p className="text-xl font-black text-gray-900 hl-mono">
                     {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                   </p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <CreditCard size={14} className="text-emerald-500" /> Monthly Investment
                   </p>
                   <p className="text-xl font-black text-[#0D4A3E] hl-mono">
                     KES {PLANS.find(p => p.id === subscription?.planName)?.price.toLocaleString() || '0'}
                   </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => {
                    setMpesaPhone('')
                    setShowRenewModal(true)
                  }}
                  className="px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-[#0D4A3E] text-white hover:bg-[#0A3D33] shadow-emerald-900/20"
                >
                  Renew Subscription
                </button>
                <button 
                  onClick={() => setShowChangeModal(true)}
                  className="bg-white text-gray-600 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Change My Plan
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[28px] border border-gray-100 shadow-sm">
             <div className="mb-12">
               <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Compare hlynk Packages</h3>
               <p className="text-gray-500 font-medium italic">Choose the level of control your business needs.</p>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-50">
                      <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Feature</th>
                      <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Lite</th>
                      <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Plus</th>
                      <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {FEATURE_COMPARISON.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                        <td className="py-6 font-bold text-slate-700 text-sm">{f.name}</td>
                        <td className="py-6 text-center">
                          {f.lite ? <CheckCircle2 size={20} className="mx-auto text-emerald-500" /> : <span className="text-slate-200">✕</span>}
                        </td>
                        <td className="py-6 text-center">
                          {f.plus ? <CheckCircle2 size={20} className="mx-auto text-blue-500" /> : <span className="text-slate-200">✕</span>}
                        </td>
                        <td className="py-6 text-center">
                          {f.max ? <CheckCircle2 size={20} className="mx-auto text-purple-500" /> : <span className="text-slate-200">✕</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historyLoading ? (
                <tr><td colSpan={5} className="p-20 text-center animate-pulse text-slate-300 uppercase font-black text-[10px] tracking-widest">Loading history...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-medium italic">No billing records found. Your business journey is just beginning.</td></tr>
              ) : (
                history.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="p-8 font-bold text-gray-900 text-sm">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="p-8 font-medium text-gray-400 text-xs hl-mono">{inv.reference}</td>
                    <td className="p-8">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                        {inv.plan}
                      </span>
                    </td>
                    <td className="p-8 font-black text-emerald-800 hl-mono">KES {Number(inv.amount).toLocaleString()}</td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {inv.status}
                      </span>
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
                  onClick={() => {
                    const daysLeft = subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                    if (daysLeft > 0) {
                      setShowConfirmRenew(true)
                    } else {
                      renewMutation.mutate(mpesaPhone)
                    }
                  }}
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
                  {/* The warning was moved to ConfirmModal */}
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
                       onClick={() => {
                         const daysLeft = subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                         if (daysLeft > 0 && subscription?.planName !== selectedPlan.id) {
                           setShowConfirmChange(true)
                         } else {
                           changePlanMutation.mutate({ plan: selectedPlan.id, phone: mpesaPhone })
                         }
                       }}
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

      <ConfirmModal
        isOpen={showConfirmChange}
        title="Override Existing Days?"
        message={`You currently have ${subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days left. Upgrading now will instantly unlock your new plan and apply a 28-day cycle starting today. Your existing days will be replaced and will not stack.`}
        confirmText="Upgrade Anyway"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={() => {
          changePlanMutation.mutate({ plan: selectedPlan.id, phone: mpesaPhone })
        }}
        onCancel={() => setShowConfirmChange(false)}
      />

      <ConfirmModal
        isOpen={showConfirmRenew}
        title="Override Existing Days?"
        message={`You currently have ${subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days left. Renewing early will simply apply 28 days to your plan starting today. Your existing days will be replaced and will not stack.`}
        confirmText="Renew Anyway"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={() => {
          renewMutation.mutate(mpesaPhone)
        }}
        onCancel={() => setShowConfirmRenew(false)}
      />
    </div>
  )
}
