import { useState, useEffect } from 'react'
import { Calendar, CreditCard, CheckCircle2, Zap, AlertTriangle, ChevronRight, Loader2, Phone, Star, RefreshCcw, Shield, Smartphone, Eye, Download, Info } from 'lucide-react'
import { subscriptionsApi } from '../../lib/api/providers'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { useAuth } from '../../lib/auth/AuthContext'
import Pagination from '../../components/shared/Pagination'
import { Filter, Search } from 'lucide-react'

const PLANS = [
  {
    id: 'LITE',
    name: 'Starter',
    price: 2999,
    desc: 'For small businesses that want better control of daily sales and expenses.',
    color: 'emerald',
    features: ['Record Sales', 'Track Expenses', 'Manage Stock', 'Save Customer Records', 'Track Cash & M-Pesa', 'Daily Profit Reports', 'Standard Support'],
    notIncluded: ['Profit Analytics', 'M-Pesa Paybill Integration', 'Staff Accounts']
  },
  {
    id: 'PLUS',
    name: 'Growth',
    price: 6999,
    desc: 'For growing businesses that need deeper reports and better business tracking.',
    color: 'blue',
    features: ['Everything in Starter', 'Profit Analytics', 'Sales Reports & Graphs', 'M-Pesa Paybill Integration', '1 Staff Account', 'Priority Support'],
    notIncluded: ['Unlimited Staff Accounts', 'Roles & Permissions']
  },
  {
    id: 'MAX',
    name: 'Business Pro',
    price: 16999,
    desc: 'For businesses that need complete operational and staff management.',
    color: 'purple',
    features: ['Everything in Growth', 'Unlimited Staff Accounts', 'Staff Activity Tracking', 'Roles & Permissions', 'Advanced Business Controls'],
    notIncluded: []
  },
]

const FEATURE_COMPARISON = [
  { name: 'Record & View Sales', lite: true, plus: true, max: true },
  { name: 'Manage Stock & Customers', lite: true, plus: true, max: true },
  { name: 'Track Daily Expenses', lite: true, plus: true, max: true },
  { name: 'Profit Analytics', lite: false, plus: true, max: true },
  { name: 'M-Pesa Paybill Integration', lite: false, plus: true, max: true },
  { name: '1 Staff Account', lite: false, plus: true, max: true },
  { name: 'Unlimited Staff Accounts', lite: false, plus: false, max: true },
  { name: 'Staff Activity Tracking', lite: false, plus: false, max: true },
  { name: 'Roles & Permissions', lite: false, plus: false, max: true },
  { name: 'Priority Support', lite: false, plus: true, max: true },
]

import { SubscriptionExpiredBanner } from '../../components/shared/SubscriptionGuard'
import { ConfirmModal } from '../../components/shared/ConfirmModal'

export default function SubscriptionPage() {
  const queryClient = useQueryClient()
  const { user, refreshUser } = useAuth()
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmChange, setShowConfirmChange] = useState(false)
  const [showConfirmRenew, setShowConfirmRenew] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false)
  const [waitingPaymentId, setWaitingPaymentId] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  // ── STAFF ACCESS LOCK ──
  if (user?.role === 'STAFF') {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="h-24 w-24 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-red-500/10 relative overflow-hidden">
          <Shield size={48} />
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        <div className="max-w-md">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">Access Restricted</h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Staff accounts are strictly prohibited from viewing or managing business billing plans. Please contact your administrator for assistance.
          </p>
        </div>
        <button 
          onClick={() => window.history.back()} 
          className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          Go Back
        </button>
      </div>
    )
  }

  // History Filters
  const [historyPage, setHistoryPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  const { data: subResponse, isLoading: subLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionsApi.getMe,
    refetchInterval: isWaitingForPayment ? 1500 : false
  })

  const { data: historyResponse, isLoading: historyLoading } = useQuery({
    queryKey: ['billing-history', historyPage, statusFilter, planFilter],
    queryFn: () => subscriptionsApi.getBillingHistory({
      page: historyPage,
      status: statusFilter || undefined,
      plan: planFilter || undefined,
      limit: 5
    }),
    enabled: activeTab === 'history' || isWaitingForPayment,
    refetchInterval: isWaitingForPayment ? 1500 : false
  })

  const [paymentResultMessage, setPaymentResultMessage] = useState<string | null>(null)
  const [initialPlan, setInitialPlan] = useState<string | null>(null)

  const subscription = subResponse?.data
  const history = historyResponse?.data?.payments || []
  const pagination = historyResponse?.data?.pagination

  const isTrial = subscription?.status === 2
  const isExpired = subscription?.status === 1 || (subscription?.endDate && new Date(subscription.endDate) < new Date())

  // Watch for payment status change
  useEffect(() => {
    if (!isWaitingForPayment) return;

    const currentPlan = subResponse?.data?.planName;
    const currentStatus = subResponse?.data?.status;

    // SUCCESS DETECTION 1: History Record updated
    const historyLatest = historyResponse?.data?.payments?.[0];
    const specificPayment = waitingPaymentId 
      ? historyResponse?.data?.payments?.find((p: any) => p.id === waitingPaymentId)
      : null;
    
    const paymentToTrack = specificPayment || historyLatest;
    
    const isPaid = paymentToTrack?.status === 0;
    const isCancelled = paymentToTrack?.status === 3;
    const isFailed = paymentToTrack?.status === 1 || paymentToTrack?.status === 4;

    // SUCCESS DETECTION 2: Subscription status or plan changed (Fallback)
    const planChanged = initialPlan && currentPlan && initialPlan !== currentPlan;
    const statusActivated = (isExpired || isTrial) && currentStatus === 0;
    
    if (isPaid || planChanged || statusActivated) {
      setWaitingPaymentId(null);
      setIsWaitingForPayment(false);
      setPaymentResultMessage(null);
      
      // Force refresh everything
      queryClient.invalidateQueries({ queryKey: ['subscriptions-me'] });
      queryClient.invalidateQueries({ queryKey: ['billing-history'] });
      refreshUser();
      
      // Switch back to current plan tab to show the update
      setActiveTab('current');
      
      toast.success('Payment Successful', {
        description: `Your ${currentPlan || 'new'} plan is now active. All features are unlocked.`,
        icon: <CheckCircle2 className="text-emerald-500" />
      });
      return;
    }

    // FAILURE DETECTION
    if (isCancelled || isFailed) {
      // console.log('[SUBSCRIPTION] Failure detected:', { isCancelled, isFailed });
      
      setWaitingPaymentId(null);
      setIsWaitingForPayment(false);
      
      const failureMsg = isCancelled ? 'Transaction Cancelled' : 'Payment Failed';
      const description = isCancelled 
        ? 'The STK push request was cancelled on the phone.'
        : (paymentToTrack?.message || 'M-Pesa could not process the payment. Please try again.');

      setPaymentResultMessage(failureMsg);
      toast.error(failureMsg, {
        description,
        icon: <AlertTriangle className="text-red-500" />
      });

      setTimeout(() => setPaymentResultMessage(null), 8000);
    }
  }, [historyResponse, subResponse, isWaitingForPayment, waitingPaymentId, initialPlan, isExpired, isTrial, queryClient, refreshUser]);


  const renewMutation = useMutation({
    mutationFn: (phone: string) => subscriptionsApi.renew(phone),
    onSuccess: (data) => {
      setInitialPlan(subResponse?.data?.planName || null)
      toast.success(data.message || 'STK Push sent!')
      setShowRenewModal(false)
      setIsWaitingForPayment(true)
      // Store the specific payment ID if returned, or we'll fallback to latest in history
      if (data.data?.id || data.id) {
        setWaitingPaymentId(data.data?.id || data.id)
      }
      // Safety timeout: stop waiting if no response after 60 seconds
      setTimeout(() => {
        setIsWaitingForPayment(false)
        setWaitingPaymentId(null)
      }, 60000)
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const changePlanMutation = useMutation({
    mutationFn: ({ plan, phone }: { plan: string, phone: string }) => subscriptionsApi.changePlan(plan, phone),
    onSuccess: (data) => {
      setInitialPlan(subResponse?.data?.planName || null)
      toast.success(data.message || 'Payment initiated for plan upgrade!')
      setShowChangeModal(false)
      setIsWaitingForPayment(true)
      if (data.data?.id || data.id) {
        setWaitingPaymentId(data.data?.id || data.id)
      }
      // Safety timeout: stop waiting if no response after 60 seconds
      setTimeout(() => {
        setIsWaitingForPayment(false)
        setWaitingPaymentId(null)
      }, 60000)
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const verifyMutation = useMutation({
    mutationFn: (paymentId: string) => subscriptionsApi.verify(paymentId),
    onSuccess: (data) => {
      setIsWaitingForPayment(false) // Force stop spinner immediately
      if (data.data.status === 'PAID') {
        toast.success("Payment verified successfully! Your plan is active.")
        queryClient.clear()
        refreshUser()
      } else {
        toast.info(`Transaction Status: ${data.data.status}`)
        queryClient.invalidateQueries({ queryKey: ['billing-history'] })
      }
    },
    onError: (err) => {
      setIsWaitingForPayment(false)
      toast.error(getErrorMessage(err))
    }
  })

  if (subLoading) return (
    <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
      <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center animate-bounce">
        <Zap size={24} fill="currentColor" />
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Subscription Status...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">

      {isWaitingForPayment && (
        <div className="space-y-4">
          <div className={`${paymentResultMessage ? (paymentResultMessage.includes('Success') || paymentResultMessage.includes('active') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800') : 'bg-emerald-50 border-emerald-200 text-emerald-800'} border px-6 py-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm ${!paymentResultMessage && 'animate-pulse'}`}>
            <div className="flex items-center gap-4">
              {paymentResultMessage ? (
                (paymentResultMessage.includes('Success') || paymentResultMessage.includes('active') ? <CheckCircle2 size={24} className="text-emerald-600" /> : <AlertTriangle size={24} className="text-red-600" />)
              ) : (
                <Loader2 className="animate-spin text-emerald-600" size={24} />
              )}
              <div>
                <h4 className="font-black text-sm tracking-tight">
                  {paymentResultMessage ? 'Transaction Finalized' : 
                   (historyResponse?.data?.payments?.[0]?.status === 2 ? 'Awaiting Your PIN...' : 'Waiting for M-Pesa...')}
                </h4>
                <p className={`text-xs font-medium ${paymentResultMessage ? '' : 'text-emerald-600/80'}`}>
                  {paymentResultMessage || 
                   (historyResponse?.data?.payments?.[0]?.status === 2 
                     ? "We've sent the prompt. Please enter your M-Pesa PIN on your phone to complete the activation." 
                     : "Requesting an STK prompt from Safaricom... Please keep your phone unlocked.")
                  }
                </p>
              </div>
            </div>

            {!paymentResultMessage && historyResponse?.data?.payments?.[0]?.id && (
              <button
                onClick={() => verifyMutation.mutate(historyResponse.data.payments[0].id)}
                disabled={verifyMutation.isPending}
                className="px-4 py-2 bg-white border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"
              >
                {verifyMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                Check Status
              </button>
            )}
          </div>

        </div>
      )}

      <SubscriptionExpiredBanner expired={isExpired} />


      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subscription</h1>
          <p className="text-gray-500 font-medium italic">"Know your real profit. Not just what came in — what stayed."</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-[.5em]">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-2 rounded-[.5em]lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Manage Plan
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-[.5em]lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Billing History
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <>
          {isTrial && !isExpired && (
            <div className="bg-emerald-900 text-white p-8 rounded-[.5em] shadow-2xl shadow-emerald-900/20 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-xl font-black tracking-tight">You're exploring HudumaLynk on a 7-Day Free Trial</h3>
                <p className="text-emerald-200 text-sm font-medium">No payment required. See your real profit before you pay.</p>
              </div>
              <div className="bg-emerald-800 px-6 py-3 rounded-[.5em] border border-emerald-700/50 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Trial Ends In</p>
                <p className="text-2xl font-black hl-mono">
                  {subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} Days
                </p>
              </div>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[.5em] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-[.5em] flex items-center justify-center text-[#0D4A3E] shadow-sm">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0D4A3E] uppercase tracking-widest">M-Pesa STK Push Only</h3>
                <p className="text-xs font-medium text-emerald-800/60">We only deal in automated STK prompts. No cash or manual payments are allowed.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-[.5em] border border-emerald-100">
              <Zap size={14} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0D4A3E]">Instant Activation</span>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[.5em] border border-gray-100 shadow-sm overflow-hidden relative">
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
                  className="px-12 py-5 rounded-[.5em] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-[#0D4A3E] text-white hover:bg-[#0A3D33] shadow-emerald-900/20"
                >
                  Renew Subscription
                </button>
                <button
                  onClick={() => setShowChangeModal(true)}
                  className="bg-white text-gray-600 px-12 py-5 rounded-[.5em] font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Change My Plan
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[.5em] border border-gray-100 shadow-sm">
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
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-[.5em] border border-gray-100">
            <div className="flex items-center gap-2 text-slate-400 mr-2">
              <Filter size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Filter By:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setHistoryPage(1); }}
              className="bg-slate-50 border-none rounded-[.5em] px-4 py-2 text-xs font-black text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[140px]"
            >
              <option value="">All Statuses</option>
              <option value="PAID">Paid Only</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setHistoryPage(1); }}
              className="bg-slate-50 border-none rounded-[.5em] px-4 py-2 text-xs font-black text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[140px]"
            >
              <option value="">All Plans</option>
              <option value="LITE">Lite Plan</option>
              <option value="PLUS">Plus Plan</option>
              <option value="MAX">Max Plan</option>
            </select>

            <div className="ml-auto text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Showing {history.length} of {pagination?.total || 0} Records
            </div>
          </div>

          <div className="bg-white rounded-[.5em] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-8 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historyLoading ? (
                  <tr><td colSpan={5} className="p-20 text-center animate-pulse text-slate-300 uppercase font-black text-[10px] tracking-widest">Loading history...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-medium italic">No billing records found matching your filters.</td></tr>
                ) : (
                  history.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="p-8 font-bold text-gray-900 text-sm">{new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</td>
                      <td className="p-8">
                        <p className="font-medium text-gray-400 text-[10px] hl-mono uppercase tracking-tighter">{inv.reference}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">{inv.plan}</p>
                      </td>
                      <td className="p-8">
                        {inv.mpesaReceipt ? (
                          <span className="font-black text-[10px] hl-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded-[.5em]">{inv.mpesaReceipt}</span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-300 italic">No receipt</span>
                        )}
                      </td>
                      <td className="p-8 font-black text-emerald-800 hl-mono text-right text-sm">KES {Number(inv.amount).toLocaleString()}</td>
                      <td className="p-8">
                        <div className="flex items-center gap-2">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 0 ? 'bg-emerald-100 text-emerald-700' :
                            inv.status === 1 ? 'bg-red-100 text-red-700' :
                              inv.status === 3 ? 'bg-amber-100 text-amber-700' :
                              inv.status === 4 ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {inv.status === 0 ? 'PAID' : inv.status === 1 ? 'FAILED' : inv.status === 3 ? 'CANCELLED' : inv.status === 4 ? 'ERROR' : 'PENDING'}
                          </span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {inv.status === 2 && (
                            <button
                              onClick={() => verifyMutation.mutate(inv.id)}
                              disabled={verifyMutation.isPending}
                              title="Verify Payment"
                              className="h-8 w-8 rounded-[.5em] bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all"
                            >
                              {verifyMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedTransaction(inv)}
                            className="h-8 w-8 rounded-[.5em] bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {pagination && pagination.totalPages > 1 && (
              <div className="p-8 bg-gray-50/30 border-t border-gray-50">
                <Pagination
                  page={historyPage}
                  pages={pagination.totalPages}
                  total={pagination.total}
                  onPageChange={setHistoryPage}
                  label="Transactions"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[.5em] shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 rounded-[.5em] bg-emerald-50 text-emerald-600 flex items-center justify-center">
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
                    className="w-full bg-gray-50 border-none rounded-[.5em] py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 text-lg font-black hl-mono"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-[.5em] flex justify-between items-center">
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
                className="w-full bg-[#0D4A3E] text-white py-4 rounded-[.5em] font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50"
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
          <div className="bg-slate-50 rounded-[.5em] shadow-2xl w-full max-w-4xl p-12 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
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
                  className={`p-8 rounded-[.5em] cursor-pointer transition-all border-2 flex flex-col ${selectedPlan?.id === plan.id ? 'bg-white border-emerald-500 shadow-xl ring-8 ring-emerald-500/5' : 'bg-white border-white hover:border-slate-200 shadow-sm'}`}
                >
                  <div className={`h-12 w-12 rounded-[.5em] bg-${plan.color}-50 text-${plan.color}-600 flex items-center justify-center mb-6`}>
                    <Star size={24} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-black text-slate-900 hl-mono">KES {plan.price.toLocaleString()}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hl-mono">/28 days</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8 flex-1">{plan.desc}</p>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan?.id === plan.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                    {selectedPlan?.id === plan.id && <CheckCircle2 size={14} />}
                  </div>
                </div>
              ))}
            </div>

            {selectedPlan && (
              <div className="bg-white p-8 rounded-[.5em] border border-slate-100 animate-in slide-in-from-bottom-4">
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
                        className="w-full bg-slate-50 border-none rounded-[.5em] py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 text-lg font-black hl-mono"
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
                    className="w-full md:w-auto bg-emerald-600 text-white px-12 py-5 rounded-[.5em] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 disabled:opacity-50"
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

      {/* ── TRANSACTION DETAIL MODAL ── */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[.5em] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-50 p-8 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-[.5em] flex items-center justify-center shadow-sm ${
                  selectedTransaction.status === 0 ? 'bg-emerald-50 text-emerald-600' :
                  selectedTransaction.status === 1 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Transaction Details</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">View comprehensive billing data</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</p>
                  <p className="text-sm font-bold text-slate-900">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Reference</p>
                  <p className="text-sm font-black text-emerald-600 hl-mono">{selectedTransaction.reference}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">M-Pesa Receipt</p>
                  <p className="text-sm font-black text-slate-900 hl-mono">{selectedTransaction.mpesaReceipt || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">M-Pesa Number</p>
                  <p className="text-sm font-black text-slate-900 hl-mono">{selectedTransaction.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-[.5em] p-8 border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subscription Plan</p>
                  <p className="text-lg font-black text-slate-900">{selectedTransaction.plan} Tier</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Paid</p>
                  <p className="text-2xl font-black text-emerald-900 hl-mono">KES {Number(selectedTransaction.amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    selectedTransaction.status === 0 ? 'bg-emerald-100 text-emerald-700' :
                    selectedTransaction.status === 1 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedTransaction.status === 0 ? 'Transaction Successful' : 
                     selectedTransaction.status === 1 ? 'Transaction Failed' : 
                     selectedTransaction.status === 3 ? 'Transaction Cancelled' : 'Payment Pending'}
                  </span>
                </div>
                
                {selectedTransaction.message && (
                  <div className="bg-slate-50/50 p-4 rounded-[.5em] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Info size={12} /> Gateway Response
                    </p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                      "{selectedTransaction.message}"
                    </p>
                  </div>
                )}

                {/* RAW SAFARICOM JSON AUDIT */}
                {(selectedTransaction.rawPayload || selectedTransaction.rawResponse) && (
                  <div className="bg-slate-900 rounded-[.5em] p-6 shadow-inner overflow-hidden border border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Zap size={12} className="text-amber-400" /> Technical Conversation
                      </p>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest hl-mono">Forensic Audit</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      <pre className="text-[10px] font-medium text-emerald-400/90 hl-mono leading-relaxed whitespace-pre-wrap">
                        {(() => {
                          try {
                            const payload = selectedTransaction.rawPayload || selectedTransaction.rawResponse;
                            const parsed = typeof payload === 'string' 
                              ? JSON.parse(payload) 
                              : payload;
                            return JSON.stringify(parsed, null, 2);
                          } catch (e) {
                            return selectedTransaction.rawPayload || selectedTransaction.rawResponse;
                          }
                        })()}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-[.5em] font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download Receipt
                </button>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-[.5em] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
