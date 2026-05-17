import { useState, useEffect, useRef } from 'react'
import { Search, Download, Calendar, Eye, Receipt, User, CreditCard, ChevronLeft, ChevronRight, Printer, Store, CheckCircle, Filter, Zap, AlertTriangle } from 'lucide-react'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { useQuery } from '@tanstack/react-query'
import { salesApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { SlideOver } from '../../components/shared/SlideOver'
import { PaginatedResponse } from '../../lib/types/api'
import TablePagination from '../../components/shared/TablePagination'

const RECEIPT_PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

  @media print {
    @page { size: 80mm auto; margin: 0; }
    body * { visibility: hidden !important; }
    #thermal-receipt, #thermal-receipt * { visibility: visible !important; }
    #thermal-receipt {
      position: fixed !important;
      inset: 0 !important;
      width: 80mm !important;
      margin: 0 auto !important;
      padding: 0 !important;
      font-family: 'Share Tech Mono', 'Courier New', monospace !important;
      font-size: 11px !important;
      line-height: 1.5 !important;
      color: #000 !important;
      background: #fff !important;
    }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
  }
`

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
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [status, setStatus] = useState('')

  const { data: salesData, isLoading, error } = useQuery<PaginatedResponse<any> & { stats: any }>({
    queryKey: ['sales-history', search, selectedDate, page, status, sortBy, sortOrder],
    queryFn: () => salesApi.list({ search, date: selectedDate, page, limit: 10, status: status || undefined, sortBy, sortOrder }),
    refetchInterval: 15_000,       // live refresh every 15s
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  })

  // Keep selectedSale in sync if the list refreshes
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
    avgSale: salesData?.stats?.avgSale || 0
  }

  const exportToCSV = () => {
    if (sales.length === 0) return toast.error('No data to export')
    const headers = ['Receipt #', 'Date', 'Customer', 'Items Count', 'Total Amount', 'Payment Method']
    const rows = sales.map((s: any) => [
      s.id.slice(-8).toUpperCase(),
      new Date(s.createdAt).toLocaleString(),
      s.customerName || 'Walk-in',
      s.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0,
      s.totalAmount,
      s.paymentMethod,
    ])
    const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map((r: any[]) => r.join(",")).join("\n")
    const link = document.createElement("a")
    link.href = encodeURI(csv)
    link.download = `sales_report_${selectedDate}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Report exported successfully')
  }

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{RECEIPT_PRINT_CSS}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales History</h1>
          <p className="text-gray-500 font-medium">Review and manage all recorded transactions</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-gray-100 text-gray-600 h-12 px-6 rounded-[.5rem] font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <SlideOver isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} title="Forensic Receipt View">
        {selectedSale && (
          <div className="space-y-8 pb-10">
            <ThermalReceipt sale={selectedSale} />
            
            {/* {selectedSale.paymentMethod === 'MPESA' && (
              <div className="px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="bg-slate-900 rounded-[.5rem] p-8 shadow-2xl border border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-[.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                         <Zap size={16} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safaricom Conversation</h4>
                    </div>
                    <span className="text-[8px] font-black bg-slate-800 text-slate-500 px-2 py-1 rounded-[.5rem] uppercase tracking-tighter hl-mono">Audit JSON</span>
                  </div>
                  
                  <div className="bg-slate-950 rounded-[.5rem] p-4 overflow-auto max-h-[300px] custom-scrollbar">
                    {selectedSale.rawPayload ? (
                      <pre className="text-[10px] text-emerald-400 hl-mono leading-relaxed">
                        {JSON.stringify(selectedSale.rawPayload, null, 2)}
                      </pre>
                    ) : (
                      <div className="py-10 text-center opacity-30 text-emerald-400 text-[10px] italic">
                        No technical communication logs found for this POS transaction.
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">M-Pesa Request ID</p>
                      <p className="text-[10px] font-black text-slate-400 hl-mono truncate">{selectedSale.mpesaRequestId || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Receipt Number</p>
                      <p className="text-[10px] font-black text-slate-400 hl-mono">{selectedSale.mpesaReceipt || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        )}
      </SlideOver>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={selectedDate === new Date().toISOString().split('T')[0] ? "Total Today" : `Total (${selectedDate})`}
          value={`KES ${(stats.totalToday || 0).toLocaleString()}`}
          sub="Gross Revenue"
          icon={Receipt}
          variant="emerald"
        />
        <StatCard title="Transactions" value={stats.transactions.toString()} sub="Sales processed" icon={CreditCard} variant="blue" />
        <StatCard title="Avg. Sale" value={`KES ${(stats.avgSale || 0).toLocaleString()}`} sub="Per customer" icon={User} variant="amber" />
      </div>

      <div className="bg-white rounded-[.5rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by receipt # or customer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full bg-gray-50 border-none rounded-[.5rem] py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold"
              />
            </div>
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-[.5rem] border border-gray-100">
            <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-[.5rem] transition-all text-gray-400 hover:text-slate-900">
              <ChevronLeft size={18} />
            </button>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" size={16} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setPage(1)
                }}
                className="bg-transparent pl-10 pr-4 py-2 text-sm font-black text-slate-900 outline-none hl-mono"
              />
            </div>
            <button onClick={() => shiftDate(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-[.5rem] transition-all text-gray-400 hover:text-slate-900">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-[.5rem] border border-gray-100">
             <Filter className="ml-2 text-slate-400" size={14} />
             <select 
               value={status}
               onChange={(e) => { setStatus(e.target.value); setPage(1); }}
               className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-slate-600 px-2 cursor-pointer"
             >
               <option value="">All Statuses</option>
               <option value="COMPLETED">Completed</option>
               <option value="PENDING">Pending</option>
               <option value="FAILED">Failed</option>
             </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th 
                  className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => { setSortBy('id'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}
                >
                  Receipt # {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => { setSortBy('createdAt'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}
                >
                  Time {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => { setSortBy('customerName'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}
                >
                  Customer {sortBy === 'customerName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Items</th>
                <th 
                  className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => { setSortBy('totalAmount'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}
                >
                  Total {sortBy === 'totalAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Method</th>

                <th 
                  className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => { setSortBy('status'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}
                >
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={7} className="py-20 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                </td></tr>
              ) : sales.length > 0 ? sales.map((s: any, i: number) => (
                <tr key={s.id ?? i} className="hover:bg-emerald-50/30 transition-all group cursor-pointer" onClick={() => setSelectedSale(s)}>
                  <td className="px-8 py-5 text-sm font-black text-gray-900 hl-mono">#{s.id.slice(-8).toUpperCase()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-400 hl-mono">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-600">{s.customerName || 'Walk-in'}</td>
                  <td className="px-8 py-5 text-center text-sm font-black hl-mono">{s.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0}</td>
                  <td className="px-8 py-5 text-right font-black text-[#0D4A3E] text-sm hl-mono">KES {Number(s.totalAmount).toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-[.5rem] uppercase tracking-widest ${s.paymentMethod === 'MPESA' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'}`}>
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-[.5rem] uppercase tracking-widest ${getStatusColor(s.status)}`}>
                      {getStatusLabel(s.status)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right flex gap-1">
                    <div className="p-2 bg-slate-50 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-emerald-900/10 rounded-[.5rem] transition-all text-gray-300 group-hover:text-emerald-600 inline-block">
                      <Eye size={18} />
                    </div>
                    {/* <div className="p-2 bg-slate-50 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-emerald-900/10 rounded-[.5rem] transition-all text-gray-300 group-hover:text-emerald-600 inline-block">
                      <Receipt size={18} />
                    </div> */}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="py-32 text-center">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt size={32} className="text-gray-200" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">No transactions recorded for this date</p>
                </td></tr>
              )}
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

// ─── Thermal Receipt ───────────────────────────────────────────────────────────

function ThermalReceipt({ sale }: { sale: any }) {
  const subtotal = sale.items?.reduce((acc: number, item: any) => acc + Number(item.price) * item.quantity, 0) ?? Number(sale.totalAmount)

  const handlePrint = () => window.print()

  const handleDownload = () => {
    const el = document.getElementById('thermal-receipt')
    if (!el) return
    // Open a new window with just the receipt HTML for clean PDF save
    const win = window.open('', '_blank', 'width=400,height=700')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Receipt #${sale.id.slice(-8).toUpperCase()}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com"/>
          <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Share Tech Mono', 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.6;
              color: #000;
              background: #fff;
              padding: 12px 14px;
              width: 80mm;
            }
            ${receiptStyles}
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 600)
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        .receipt-font { font-family: 'Share Tech Mono', 'Courier New', monospace; }
        ${receiptStyles}
      `}</style>

      {/* Paper receipt card */}
      <div
        id="thermal-receipt"
        className="receipt-font bg-white text-black shadow-2xl shadow-gray-400/30 relative"
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '20px 18px 28px',
          fontSize: 11,
          lineHeight: 1.65,
          // Tear-off jagged bottom via SVG mask
          clipPath: 'none',
          borderRadius: '2px 2px 0 0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 1px 0 rgba(0,0,0,0.05)',
        }}
      >
        {/* Torn top edge */}
        <div style={{ position: 'absolute', top: -6, left: 0, right: 0, height: 6, background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'6\'%3E%3Cpath d=\'M0 6 Q5 0 10 6 Q15 0 20 6\' fill=\'%23fff\' stroke=\'%23e5e7eb\' stroke-width=\'1\'/%3E%3C/svg%3E") repeat-x bottom', }} />

        {/* Store header */}
        <div style={{ textAlign: 'center', marginBottom: 14, borderBottom: '1px dashed #999', paddingBottom: 12 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 36, margin: '0 auto 6px', display: 'block', filter: 'grayscale(100%)' }} />
          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: '#555', marginTop: 4 }}>— OFFICIAL RECEIPT —</div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#666', marginBottom: 10 }}>
          <div>
            <div style={{ color: '#999', fontSize: 8, letterSpacing: '0.1em' }}>RECEIPT</div>
            <div style={{ fontWeight: 'bold', color: '#000' }}>#{sale.id.slice(-8).toUpperCase()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#999', fontSize: 8, letterSpacing: '0.1em' }}>DATE</div>
            <div>{new Date(sale.createdAt).toLocaleDateString()}</div>
            <div>{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#666', marginBottom: 12, paddingBottom: 10, borderBottom: '1px dashed #bbb' }}>
          <div>
            <div style={{ color: '#999', fontSize: 8, letterSpacing: '0.1em' }}>CUSTOMER</div>
            <div style={{ color: '#000', fontWeight: 'bold' }}>{sale.customerName || 'Walk-in'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#999', fontSize: 8, letterSpacing: '0.1em' }}>SERVED BY</div>
            <div style={{ color: '#000' }}>{sale.user?.name || 'Operator'}</div>
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#aaa', letterSpacing: '0.1em', marginBottom: 6 }}>
          <span style={{ flex: 1 }}>ITEM</span>
          <span style={{ width: 28, textAlign: 'center' }}>QTY</span>
          <span style={{ width: 48, textAlign: 'center' }}>PRICE</span>
          <span style={{ width: 52, textAlign: 'right' }}>TOTAL</span>
        </div>

        {/* Line items */}
        <div style={{ borderBottom: '1px dashed #bbb', paddingBottom: 10, marginBottom: 10 }}>
          {sale.items?.map((item: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
              <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingRight: 4 }}>
                {item.name}
              </span>
              <span style={{ width: 28, textAlign: 'center', color: '#555' }}>{item.quantity}</span>
              <span style={{ width: 48, textAlign: 'center', color: '#555' }}>{Number(item.price).toLocaleString()}</span>
              <span style={{ width: 52, textAlign: 'right', fontWeight: 'bold' }}>
                {(Number(item.price) * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Totals block */}
        <div style={{ fontSize: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 3 }}>
            <span>SUBTOTAL</span><span>KES {subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 6 }}>
            <span>PAYMENT</span>
            <span style={{ background: '#000', color: '#fff', padding: '0 6px', borderRadius: 2, fontSize: 8, letterSpacing: '0.1em' }}>
              {sale.paymentMethod}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 6 }}>
            <span>STATUS</span>
            <span style={{ fontWeight: 'bold' }}>{getStatusLabel(sale.status)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 15, borderTop: '2px solid #000', paddingTop: 8, marginTop: 4 }}>
            <span>TOTAL</span><span>KES {Number(sale.totalAmount).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px dashed #bbb', paddingTop: 12, textAlign: 'center', fontSize: 9, color: '#888', lineHeight: 1.8 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.15em', marginBottom: 4 }}>* * * THANK YOU * * *</div>
          <div>Please keep this receipt for your records.</div>
          <div style={{ marginTop: 8, fontSize: 8, letterSpacing: '0.05em', color: '#bbb' }}>
            {new Date(sale.createdAt).toISOString()}
          </div>
        </div>

        {/* Tear-off bottom edge */}
        <div style={{ position: 'absolute', bottom: -6, left: 0, right: 0, height: 6, background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'6\'%3E%3Cpath d=\'M0 0 Q5 6 10 0 Q15 6 20 0\' fill=\'%23fff\' stroke=\'%23e5e7eb\' stroke-width=\'1\'/%3E%3C/svg%3E") repeat-x top', }} />
      </div>

      {/* Action buttons */}
      <div className="no-print flex gap-3 w-full" style={{ maxWidth: 320 }}>
        {/* <button
          onClick={handleDownload}
          className="flex-1 h-12 bg-gray-900 text-white rounded-[.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-700 transition-all"
        >
          <Printer size={15} /> Download PDF
        </button> */}
        <button
          onClick={handlePrint}
          className="h-12 px-5 bg-gray-100 text-gray-600 rounded-[.5rem] mx-auto font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
        >
          <Printer size={15} /> Print
        </button>
      </div>
    </div>
  )
}

const receiptStyles = `
  .receipt-header { text-align: center; }
  .receipt-dashed { border-top: 1px dashed #999; margin: 8px 0; }
`

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, icon: Icon, variant }: any) {
  const variants: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  }
  return (
    <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-xl shadow-gray-900/5 flex items-center gap-6 hover:shadow-2xl hover:shadow-gray-900/10 transition-all border-b-4 group">
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
