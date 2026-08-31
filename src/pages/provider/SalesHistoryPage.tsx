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
    <div className="space-y-8 pt-4">
      <style>{thermalReceiptStyles}</style>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sales history</h1>
          <p className="text-gray-400 text-sm mt-0.5">Review and manage all recorded transactions</p>
        </div>
        <button
          onClick={exportToCSV}
          className="h-9 px-4 rounded-[.5rem] text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Save size={15} /> Export
        </button>
      </div>

      <SlideOver isOpen={!!selectedSale} onClose={() => { setSelectedSale(null); setVoidConfirm(false); setVoidReason('') }} title="Receipt view">
        {selectedSale && (
          <div className="space-y-6 pb-10">
            {/* Voided banner */}
            {Number(selectedSale.status) === 3 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-[.5rem] px-4 py-3.5">
                <div className="h-8 w-8 bg-white text-red-600 rounded-[.5rem] flex items-center justify-center flex-shrink-0 border border-red-100">
                  <Ban size={15} />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700">This sale is voided</p>
                  <p className="text-xs text-red-400 mt-0.5">Stock has been restored. Excluded from all revenue calculations.</p>
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
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-[.5rem] border border-red-100 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Ban size={15} />
                    Void this sale
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-100 rounded-[.5rem] p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 bg-white text-red-600 rounded-[.5rem] flex items-center justify-center flex-shrink-0 mt-0.5 border border-red-100">
                        <AlertTriangle size={13} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">Confirm void</p>
                        <p className="text-xs text-red-500 mt-0.5 leading-relaxed">
                          This will cancel sale #{selectedSale.id.slice(-8).toUpperCase()} and restore all stock quantities. This cannot be undone.
                        </p>
                      </div>
                    </div>

                    <textarea
                      value={voidReason}
                      onChange={e => setVoidReason(e.target.value)}
                      placeholder="Reason for voiding (optional)…"
                      rows={2}
                      className="w-full bg-white border border-red-100 rounded-[.5rem] px-3.5 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:ring-2 focus:ring-red-200 resize-none transition-all"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setVoidConfirm(false); setVoidReason('') }}
                        disabled={voidMutation.isPending}
                        className="flex-1 h-9 rounded-[.5rem] border border-gray-200 bg-white text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => voidMutation.mutate({ id: selectedSale.id, reason: voidReason || undefined })}
                        disabled={voidMutation.isPending}
                        className="flex-1 h-9 rounded-[.5rem] bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {voidMutation.isPending ? (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Ban size={13} />
                        )}
                        {voidMutation.isPending ? 'Voiding…' : 'Yes, void it'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SlideOver>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
        <StatCell
          icon={Receipt}
          label={selectedDate === getLocalDateString() ? 'Total today' : `Total (${selectedDate})`}
          value={`KES ${(stats.totalToday || 0).toLocaleString()}`}
          sub={activeSource === '__all__' ? 'All channels' : activeSource}
        />
        <StatCell
          icon={CreditCard}
          label="Transactions"
          value={stats.transactions.toString()}
          sub={activeSource === '__all__' ? 'All channels' : activeSource}
        />
      </div>

      {/* Channel tabs */}
      <div className="bg-white rounded-[.5rem] border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Layers size={15} className="text-gray-300" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Sales channels</h3>
            <p className="text-xs text-gray-400">Filter by channel — click to drill in</p>
          </div>
        </div>

        <div className="flex gap-2 p-4 overflow-x-auto">
          {/* "All" tab */}
          <button
            onClick={() => { setActiveSource('__all__'); setPage(1); }}
            className={`flex-shrink-0 flex flex-col gap-1 px-4 py-3 rounded-[.5rem] border text-left min-w-[130px] transition-colors ${
              activeSource === '__all__'
                ? 'border-[#0D4A3E] bg-gray-50'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <span className={`text-xs ${activeSource === '__all__' ? 'text-[#0D4A3E]' : 'text-gray-400'}`}>
              All channels
            </span>
            <span className="text-lg font-semibold text-gray-900 hl-mono leading-none">
              KES {allTotal.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 hl-mono">
              {allTxns} txns
            </span>
          </button>

          {sourceStats.map((s) => (
            <button
              key={s.source}
              onClick={() => { setActiveSource(s.source); setPage(1); }}
              className={`flex-shrink-0 flex flex-col gap-1 px-4 py-3 rounded-[.5rem] border text-left min-w-[130px] transition-colors ${
                activeSource === s.source
                  ? 'border-[#0D4A3E] bg-gray-50'
                  : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <span className={`text-xs leading-tight ${activeSource === s.source ? 'text-[#0D4A3E]' : 'text-gray-400'}`}>
                {s.source}
              </span>
              <span className="text-lg font-semibold text-gray-900 hl-mono leading-none">
                KES {Number(s.totalAmount).toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 hl-mono">
                {s.transactions} txns
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sales table */}
      <div className="bg-white rounded-[.5rem] border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
            <input
              type="text"
              placeholder="Search customer, payment method…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-gray-50 border-none rounded-[.5rem] py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-[.5rem]">
            <button onClick={() => shiftDate(-1)} className="p-1.5 hover:bg-white rounded-[.5rem] transition-colors text-gray-400 hover:text-gray-900">
              <ChevronLeft size={15} />
            </button>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
                className="bg-transparent pl-8 pr-3 py-1.5 text-sm font-medium text-gray-900 outline-none hl-mono"
              />
            </div>
            <button onClick={() => shiftDate(1)} className="p-1.5 hover:bg-white rounded-[.5rem] transition-colors text-gray-400 hover:text-gray-900">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Active filter tag */}
        {activeSource !== '__all__' && (
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Filtering: {activeSource}
            </span>
            <button
              onClick={() => { setActiveSource('__all__'); setPage(1); }}
              className="text-xs text-gray-400 hover:text-gray-900 underline transition-colors"
            >
              Clear filter
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-5 py-3 text-xs font-medium text-gray-400">Receipt #</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400">Time</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400">Customer</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 text-center">Items</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 text-center">Channel</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 text-right">Total</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 text-center">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={8} className="py-16 text-center text-sm text-gray-400">Loading…</td></tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                    No sales for this channel on {selectedDate}.
                  </td>
                </tr>
              ) : sales.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setSelectedSale(s)}>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900 hl-mono whitespace-nowrap">#{s.id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400 hl-mono whitespace-nowrap">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{s.customerName || 'Walk-in'}</td>
                  <td className="px-5 py-3.5 text-center text-sm text-gray-500 hl-mono">{s.items?.length || 0}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
                      {s.source || 'In-Store'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-medium text-gray-900 hl-mono whitespace-nowrap">KES {Number(s.totalAmount).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(s.status)}`}>
                      {getStatusLabel(s.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center">
                      <span className="p-1.5 rounded-[.5rem] text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors inline-block">
                        <Eye size={15} />
                      </span>
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

// ─── Overview cell ──────────────────────────────────────────────────────────

function StatCell({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="bg-white p-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-gray-300" />
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-gray-900 hl-mono tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}