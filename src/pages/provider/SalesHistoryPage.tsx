import { useState, useEffect } from 'react'
import { Search, Save, Calendar, Receipt, CreditCard, ChevronLeft, ChevronRight, Eye, Layers, Ban, AlertTriangle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { getLocalDateString } from '../../lib/utils/date'
import { SlideOver } from '../../components/shared/SlideOver'
import { PaginatedResponse } from '../../lib/types/api'
import TablePagination from '../../components/shared/TablePagination'
import ThermalReceipt, { thermalReceiptStyles } from '../../components/shared/ThermalReceipt'

const getStatusLabel = (status: any) => {
  const s = Number(status);
  if (s === 0) return 'Success';
  if (s === 2) return 'Pending';
  if (s === 3) return 'Cancelled';
  if (s === 1) return 'Failed';
  return 'Success';
};

const getStatusColor = (status: any) => {
  const s = Number(status);
  if (s === 0) return 'text-emerald-600 bg-emerald-50';
  if (s === 2) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
};

export default function SalesHistoryPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy] = useState('createdAt')
  const [sortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedDate, setSelectedDate] = useState(getLocalDateString())
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [status, setStatus] = useState('')
  const [activeSource, setActiveSource] = useState<string>('__all__')
  const [voidConfirm, setVoidConfirm] = useState(false)
  const [voidReason, setVoidReason] = useState('')
  const queryClient = useQueryClient()

  // First fetch: NO date filter — so channel tabs show ALL channels ever, not just today's
  const { data: allData } = useQuery<PaginatedResponse<any> & { stats: any }>({
    queryKey: ['sales-history-all-sources'],
    queryFn: () => salesApi.list({ limit: 1, includeStats: true }),
    staleTime: 60_000,
  })

  // Main fetch: filtered by selected source
  const { data: salesData, isLoading, error } = useQuery<PaginatedResponse<any> & { stats: any }>({
    queryKey: ['sales-history', search, selectedDate, page, status, sortBy, sortOrder, activeSource],
    queryFn: () => salesApi.list({
      search,
      date: selectedDate,
      page,
      limit: 10,
      status: status || undefined,
      sortBy,
      sortOrder,
      includeStats: true,
      source: activeSource === '__all__' ? undefined : activeSource
    }),
    refetchInterval: 15_000,
    staleTime: 10_000,
  })

  const voidMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => salesApi.void(id, reason),
    onSuccess: () => {
      toast.success('Sale voided. Stock has been restored.')
      setVoidConfirm(false)
      setVoidReason('')
      setSelectedSale(null)
      queryClient.invalidateQueries({ queryKey: ['sales-history'] })
      queryClient.invalidateQueries({ queryKey: ['sales-history-all-sources'] })
      queryClient.invalidateQueries({ queryKey: ['provider-stats'] })
      queryClient.invalidateQueries({ queryKey: ['provider-reports'] })
      queryClient.invalidateQueries({ queryKey: ['recent-sales'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to void sale')
    }
  })

  useEffect(() => {
    if (selectedSale && salesData?.items) {
      const fresh = salesData.items.find((s: any) => s.id === selectedSale.id)
      if (fresh) setSelectedSale(fresh)
    }
  }, [salesData])

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  const sales = salesData?.items || []
  const pages = salesData?.pages || 1
  const stats = {
    totalToday: salesData?.stats?.totalToday || 0,
    transactions: salesData?.stats?.transactions || 0,
  }

  // Build channel tabs from the unfiltered stats
  const sourceStats: { source: string; totalAmount: number; transactions: number }[] =
    allData?.stats?.bySource || []

  const allTotal = sourceStats.reduce((s, c) => s + Number(c.totalAmount), 0)
  const allTxns = sourceStats.reduce((s, c) => s + Number(c.transactions), 0)

  const exportToCSV = () => {
    if (sales.length === 0) return toast.error('No data to export')
    const headers = ['Receipt #', 'Date', 'Customer', 'Items Count', 'Total Amount', 'Payment Method', 'Source']
    const rows = sales.map((s: any) => [
      s.id.slice(-8).toUpperCase(),
      new Date(s.createdAt).toLocaleString(),
      s.customerName || 'Walk-in',
      s.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0,
      s.totalAmount,
      s.paymentMethod,
      s.source || 'In-Store',
    ])
    const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map((r: any[]) => r.join(",")).join("\n")
    const link = document.createElement("a")
    link.href = encodeURI(csv)
    link.download = `sales_report_${selectedDate}${activeSource !== '__all__' ? `_${activeSource}` : ''}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Report exported successfully')
  }

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + days)
    setSelectedDate(getLocalDateString(d))
    setPage(1)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{thermalReceiptStyles}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales History</h1>
          <p className="text-gray-500 font-medium">Review and manage all recorded transactions</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-gray-100 text-gray-600 h-12 px-6 rounded-[.5rem] font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <Save size={18} /> CSV
        </button>
      </div>

      <SlideOver isOpen={!!selectedSale} onClose={() => { setSelectedSale(null); setVoidConfirm(false); setVoidReason('') }} title="Receipt View">
        {selectedSale && (
          <div className="space-y-6 pb-10">
            {/* Voided banner */}
            {Number(selectedSale.status) === 3 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-[.5rem] px-5 py-4">
                <div className="h-9 w-9 bg-red-100 text-red-600 rounded-[.5rem] flex items-center justify-center flex-shrink-0">
                  <Ban size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-red-700 uppercase tracking-widest">This Sale Is Voided</p>
                  <p className="text-[11px] text-red-400 font-bold mt-0.5">Stock has been restored. This sale is excluded from all revenue calculations.</p>
                </div>
              </div>
            )}

            <ThermalReceipt sale={selectedSale} />

            {/* Void action — only for non-voided sales */}
            {Number(selectedSale.status) !== 3 && (
              <div className="border-t border-gray-100 pt-6">
                {!voidConfirm ? (
                  <button
                    onClick={() => setVoidConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-[.5rem] border-2 border-red-100 bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 hover:border-red-200 transition-all"
                  >
                    <Ban size={15} />
                    Void This Sale
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-100 rounded-[.5rem] p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-red-100 text-red-600 rounded-[.5rem] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-red-800">Confirm Void</p>
                        <p className="text-[11px] text-red-500 font-bold mt-0.5 leading-relaxed">
                          This will cancel sale <span className="font-black">#{selectedSale.id.slice(-8).toUpperCase()}</span> and restore all stock quantities. This cannot be undone.
                        </p>
                      </div>
                    </div>

                    <textarea
                      value={voidReason}
                      onChange={e => setVoidReason(e.target.value)}
                      placeholder="Reason for voiding (optional)..."
                      rows={2}
                      className="w-full bg-white border border-red-100 rounded-[.5rem] px-4 py-3 text-sm font-bold text-gray-700 placeholder-gray-300 outline-none focus:ring-2 focus:ring-red-200 resize-none transition-all"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setVoidConfirm(false); setVoidReason('') }}
                        disabled={voidMutation.isPending}
                        className="flex-1 h-10 rounded-[.5rem] border border-gray-200 bg-white text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => voidMutation.mutate({ id: selectedSale.id, reason: voidReason || undefined })}
                        disabled={voidMutation.isPending}
                        className="flex-1 h-10 rounded-[.5rem] bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {voidMutation.isPending ? (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Ban size={13} />
                        )}
                        {voidMutation.isPending ? 'Voiding...' : 'Yes, Void It'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SlideOver>


      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title={selectedDate === getLocalDateString() ? "Total Today" : `Total (${selectedDate})`}
          value={`KES ${(stats.totalToday || 0).toLocaleString()}`}
          sub={activeSource === '__all__' ? 'All channels' : activeSource}
          icon={Receipt}
          variant="emerald"
        />
        <StatCard
          title="Transactions"
          value={stats.transactions.toString()}
          sub={activeSource === '__all__' ? 'All channels' : activeSource}
          icon={CreditCard}
          variant="blue"
        />
      </div>

      {/* ── Channel / Source Tabs ── */}
      <div className="bg-white rounded-[.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center gap-3">
          <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-[.5rem] flex items-center justify-center">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Sales Channels</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Filter by channel · click to drill in</p>
          </div>
        </div>

        <div className="flex gap-2 p-4 overflow-x-auto custom-scrollbar">
          {/* "All" tab */}
          <button
            onClick={() => { setActiveSource('__all__'); setPage(1); }}
            className={`group flex-shrink-0 flex flex-col gap-1 px-5 py-4 rounded-[.5rem] border-2 transition-all text-left min-w-[140px] ${
              activeSource === '__all__'
                ? 'border-[#0D4A3E] bg-emerald-50 shadow-lg shadow-emerald-900/10'
                : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-md'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest ${activeSource === '__all__' ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
              All Channels
            </span>
            <span className={`text-2xl font-black hl-mono leading-none ${activeSource === '__all__' ? 'text-[#0D4A3E]' : 'text-slate-900'}`}>
              KES {allTotal.toLocaleString()}
            </span>
            <span className={`text-[10px] font-bold hl-mono ${activeSource === '__all__' ? 'text-emerald-600' : 'text-slate-400'}`}>
              {allTxns} txns
            </span>
          </button>

          {sourceStats.map((s) => (
            <button
              key={s.source}
              onClick={() => { setActiveSource(s.source); setPage(1); }}
              className={`group flex-shrink-0 flex flex-col gap-1 px-5 py-4 rounded-[.5rem] border-2 transition-all text-left min-w-[140px] ${
                activeSource === s.source
                  ? 'border-[#0D4A3E] bg-emerald-50 shadow-lg shadow-emerald-900/10'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-md'
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-widest leading-tight ${activeSource === s.source ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {s.source}
              </span>
              <span className={`text-2xl font-black hl-mono leading-none ${activeSource === s.source ? 'text-[#0D4A3E]' : 'text-slate-900'}`}>
                KES {Number(s.totalAmount).toLocaleString()}
              </span>
              <span className={`text-[10px] font-bold hl-mono ${activeSource === s.source ? 'text-emerald-600' : 'text-slate-400'}`}>
                {s.transactions} txns
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-[.5rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customer, payment method..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-gray-50 border-none rounded-[.5rem] py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-[.5rem] border border-gray-100">
            <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-[.5rem] transition-all text-gray-400 hover:text-slate-900">
              <ChevronLeft size={18} />
            </button>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
                className="bg-transparent pl-10 pr-4 py-2 text-sm font-black text-slate-900 outline-none hl-mono"
              />
            </div>
            <button onClick={() => shiftDate(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-[.5rem] transition-all text-gray-400 hover:text-slate-900">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Active filter tag */}
        {activeSource !== '__all__' && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
              Filtering: {activeSource}
            </span>
            <button
              onClick={() => { setActiveSource('__all__'); setPage(1); }}
              className="text-[10px] font-black text-emerald-600 hover:text-emerald-900 underline uppercase tracking-widest transition-colors"
            >
              Clear filter
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt #</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Items</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Channel</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={8} className="py-20 text-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" /></td></tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No sales for this channel on {selectedDate}</p>
                  </td>
                </tr>
              ) : sales.map((s: any) => (
                <tr key={s.id} className="hover:bg-emerald-50/30 transition-all group cursor-pointer" onClick={() => setSelectedSale(s)}>
                  <td className="px-8 py-5 text-sm font-black text-gray-900 hl-mono">#{s.id.slice(-8).toUpperCase()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-400 hl-mono">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-600">{s.customerName || 'Walk-in'}</td>
                  <td className="px-8 py-5 text-center text-sm font-black hl-mono">{s.items?.length || 0}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-[.5rem] uppercase tracking-widest">
                      {s.source || 'In-Store'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-[#0D4A3E] text-sm hl-mono">KES {Number(s.totalAmount).toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-[.5rem] uppercase tracking-widest ${getStatusColor(s.status)}`}>
                      {getStatusLabel(s.status)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="p-2 bg-slate-50 group-hover:bg-white group-hover:shadow-lg rounded-[.5rem] transition-all text-gray-300 group-hover:text-emerald-600 inline-block">
                      <Eye size={18} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={page}
          pages={pages}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(pages, current + 1))}
        />
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, icon: Icon, variant }: any) {
  const variants: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  }
  return (
    <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-xl shadow-gray-900/5 flex items-center gap-6 hover:shadow-2xl transition-all border-b-4 group">
      <div className={`h-16 w-16 rounded-[.5rem] flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${variants[variant]} border`}>
        <Icon size={32} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 hl-mono tracking-tight">{value}</h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">{sub}</p>
      </div>
    </div>
  )
}
