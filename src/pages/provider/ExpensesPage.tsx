import { useEffect, useState } from 'react'
import { Download, Plus, Search, Trash2, Eye, TrendingUp, Wallet, Loader2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'

import { toast } from 'sonner'
import { SlideOver } from '../../components/shared/SlideOver'
import TablePagination from '../../components/shared/TablePagination'
import { ConfirmModal } from '../../components/shared/ConfirmModal'

import { expensesApi } from '../../lib/api/providers'
import { exportToCSV } from '../../lib/utils/export'
import { getErrorMessage } from '../../lib/utils/error'
import { PaginatedResponse } from '../../lib/types/api'

export default function ExpensesPage() {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const queryClient = useQueryClient()

  const { data: expensesData, isLoading, error } = useQuery<
    PaginatedResponse<any> & { stats: any }
  >({
    queryKey: ['expenses', search, page, sortBy, sortOrder],
    queryFn: () =>
      expensesApi.list({
        search,
        page,
        limit: 10,
        sortBy,
        sortOrder,
      }),
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  const expenses = expensesData?.items || []
  const pages = expensesData?.pages || 1
  const stats = {
    totalExpenses: expensesData?.stats?.totalExpenses || 0,
    highestCategory: expensesData?.stats?.highestCategory || 'N/A',
    burnRate: expensesData?.stats?.burnRate || 0,
  }

  const handleExport = () => {
    if (!expenses.length) return
    exportToCSV(expenses, 'expense_report')
    toast.success('Expense report exported')
  }

  const viewDetailsMutation = useMutation({
    mutationFn: expensesApi.getById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense details retrieved')
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense record deleted')
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  })

  const { data: selectedExpense, isLoading: isDetailLoading } = useQuery({
    queryKey: ['expense', viewDetailsId],
    queryFn: () => expensesApi.getById(viewDetailsId!),
    enabled: !!viewDetailsId,
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">

      <SlideOver
        isOpen={!!viewDetailsId}
        onClose={() => setViewDetailsId(null)}
        title="Expense Details"
      >
        {isDetailLoading ? (
          <div className="p-32 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-black uppercase tracking-widest text-xs">Fetching Details...</p>
          </div>
        ) : selectedExpense && (
          <div className="space-y-8">
            <div className="bg-slate-50 p-8 rounded-[.5rem] border border-slate-100 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount</p>
               <h2 className="text-4xl font-black text-slate-900 hl-mono">KES {Number(selectedExpense.amount).toLocaleString()}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-white rounded-[.5rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                  <p className="text-sm font-black text-slate-900">{selectedExpense.category}</p>
               </div>
               <div className="p-6 bg-white rounded-[.5rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-sm font-black text-slate-900 hl-mono">{new Date(selectedExpense.date).toLocaleDateString()}</p>
               </div>
            </div>

            <div className="p-6 bg-white rounded-[.5rem] border border-slate-100 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
               <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{selectedExpense.description}"</p>
            </div>

            <div className="p-6 bg-slate-900 rounded-[.5rem] shadow-xl">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-[.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                     <Eye size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Recorded By</p>
                    <p className="text-xs font-black text-white uppercase tracking-widest">{selectedExpense.recordedBy || 'System Admin'}</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </SlideOver>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Expense Tracking</h1>
          <p className="text-gray-500 font-medium">Monitor your business overheads and spending flow</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="bg-gray-100 text-gray-600 h-12 px-6 rounded-[.5rem] font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0D4A3E] text-white h-12 px-6 rounded-[.5rem] font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2 shadow-xl shadow-emerald-900/10"
          >
            <Plus size={20} /> Log Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Expenses" value={`KES ${stats.totalExpenses.toLocaleString()}`} sub="Month to Date" icon={Wallet} variant="red" />
        <KpiCard title="Highest Category" value={stats.highestCategory} sub="Top spending area" icon={TrendingUp} variant="amber" />
        <BurnRateGauge value={stats.totalExpenses} target={250000} />
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-[.5rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full bg-gray-50 border-none rounded-[.5rem] py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('description'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Description {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('category'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('recordedBy'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Recorded By {sortBy === 'recordedBy' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('amount'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : expenses.length > 0 ? expenses.map((e: any, i: number) => (
                <tr key={e.id ?? i} className="hover:bg-red-50/30 transition-all group cursor-pointer">
                  <td className="px-8 py-5 text-xs font-bold text-gray-400 hl-mono">{new Date(e.date || e.createdAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase()}</td>
                  <td className="px-8 py-5">
                    <span className="font-black text-gray-900 text-sm">{e.description}</span>
                    <p className="text-[9px] text-gray-400 font-bold hl-mono tracking-tighter uppercase">ID: {e.id.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-1 rounded-[.5rem] uppercase tracking-widest">{e.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-1 rounded-[.5rem] uppercase tracking-widest">{e.recordedBy || 'System Provider'}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-red-600 text-sm hl-mono whitespace-nowrap">KES {Number(e.amount).toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => setConfirmDeleteId(e.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 hover:bg-white hover:shadow-lg rounded-[.5rem] transition-all text-slate-300 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                    {/* view details */}
                    <button
                      onClick={() => setViewDetailsId(e.id)}
                      disabled={ viewDetailsMutation.isPending }
                      className="p-2 hover:bg-white hover:shadow-lg rounded-[.5rem] transition-all text-slate-300 hover:text-red-600 disabled:opacity-50"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-sm font-bold text-gray-400">
                    No expenses found.
                  </td>
                </tr>
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

      <SlideOver isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log New Expense">
        <AddExpenseForm onClose={() => setIsAddModalOpen(false)} />
      </SlideOver>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmText="Delete Expense"
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

// ─── Burn Rate Gauge ─────────────────────────────────────────────────────────

function BurnRateGauge({ value, target }: { value: number; target: number }) {
  const pct = Math.min(Math.round((value / target) * 100), 100)

  const zone =
    pct < 40
      ? { label: 'Healthy',  color: '#10b981', glow: '#34d399' }
      : pct < 70
      ? { label: 'Moderate', color: '#f59e0b', glow: '#fbbf24' }
      : pct < 90
      ? { label: 'High',     color: '#f43f5e', glow: '#fb7185' }
      : { label: 'Critical', color: '#e11d48', glow: '#f43f5e' }

  // ── Geometry ──────────────────────────────────────────────────────────────
  const cx = 110, cy = 108, R = 80
  const startDeg = 225   
  const totalSweep = 270 

  const toRad = (d: number) => (d * Math.PI) / 180
  const polar = (angleDeg: number, r = R) => ({
    x: cx + r * Math.cos(toRad(angleDeg)),
    y: cy - r * Math.sin(toRad(angleDeg)),
  })

  const a0 = polar(startDeg)
  const a1 = polar(startDeg - totalSweep)
  const arcPath = `M ${a0.x.toFixed(2)},${a0.y.toFixed(2)} A ${R},${R} 0 1,1 ${a1.x.toFixed(2)},${a1.y.toFixed(2)}`

  const arcLen = (totalSweep / 360) * 2 * Math.PI * R 
  const filled = (pct / 100) * arcLen

  const needlePt = polar(startDeg - (pct / 100) * totalSweep)

  // ── Ticks ─────────────────────────────────────────────────────────────────
  const NUM_TICKS = 48
  const ticks = Array.from({ length: NUM_TICKS + 1 }, (_, i) => {
    const a = startDeg - (i / NUM_TICKS) * totalSweep
    const major = i % 8 === 0
    return {
      p1: polar(a, major ? R - 8  : R - 4),
      p2: polar(a, major ? R + 10 : R + 6),
      major,
    }
  })

  return (
    <div className="bg-white rounded-[.5rem] border border-gray-100 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-gray-900/10 transition-all p-6 flex flex-col items-center h-full">
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div className="w-full flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly Budget</p>
          <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: zone.color }}>{zone.label}</p>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 uppercase tracking-widest">{pct}%</span>
      </div>

      {/* ── SVG Gauge ──────────────────────────────────────────────────── */}
      <div className="w-full flex justify-center">
        <svg width="100%" viewBox="0 0 220 200" className="overflow-visible max-w-[240px]">
          <defs>
            <linearGradient id="brGaugeGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%"   stopColor="#10b981" />
              <stop offset="40%"  stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>

            <filter id="brArcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.p1.x} y1={t.p1.y}
              x2={t.p2.x} y2={t.p2.y}
              stroke={t.major ? '#cbd5e1' : '#f1f5f9'}
              strokeWidth={t.major ? 2 : 1}
              strokeLinecap="round"
            />
          ))}

          {/* Background track */}
          <path d={arcPath} stroke="#f8fafc" strokeWidth={16} strokeLinecap="round" fill="none" />
          
          {/* Gradient filled arc */}
          <path
            d={arcPath}
            stroke="url(#brGaugeGrad)"
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${filled.toFixed(2)} ${arcLen.toFixed(2)}`}
            filter="url(#brArcGlow)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle dot */}
          <circle
            cx={needlePt.x}
            cy={needlePt.y}
            r={6}
            fill="white"
            stroke={zone.color}
            strokeWidth={2.5}
            className="transition-all duration-1000"
          />
          <circle
            cx={needlePt.x}
            cy={needlePt.y}
            r={2}
            fill={zone.color}
            className="transition-all duration-1000"
          />

          {/* Center value */}
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="25" fontWeight="900" className="hl-mono" fill="#0f172a">
            {(value || 0).toLocaleString()}
          </text>
          
          <text x={cx} y={cy + 32} textAnchor="middle" fontSize="10" fontWeight="800" className="uppercase tracking-widest" fill={zone.color}>
            {zone.label}
          </text>

          {/* Min / Max labels */}
          <text x={a0.x - 10} y={a0.y + 16} textAnchor="middle" fontSize="8" fontWeight="900" fill="#cbd5e1" className="hl-mono">0</text>
          <text x={a1.x + 10} y={a1.y + 16} textAnchor="middle" fontSize="8" fontWeight="900" fill="#cbd5e1" className="hl-mono">
            {(target / 1000).toFixed(0)}K
          </text>
        </svg>
      </div>

      {/* ── Footer row ─────────────────────────────────────────────────── */}
      <div className="w-full flex justify-between items-end pt-4 border-t border-gray-50 mt-auto">
        <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
          <p className="text-sm font-black text-gray-900 hl-mono">KES {(value || 0).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Budget</p>
          <p className="text-sm font-black text-gray-400 hl-mono">KES {(target || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Supporting components ────────────────────────────────────────────────────

function AddExpenseForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    description: '',
    category: 'Utilities',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })

  const mutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense logged successfully')
      onClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to log expense'),
  })

  return (
    <div className="space-y-6">
      <InputGroup label="Description" placeholder="e.g. Electricity Bill" value={form.description} onChange={(v: string) => setForm({ ...form, description: v })} />

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full bg-gray-50 border-none rounded-[.5rem] py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-sm appearance-none"
        >
          {['Utilities', 'Rent', 'Supplies', 'Transport', 'Staff Wages', 'Marketing', 'Maintenance', 'Other'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <InputGroup label="Date" type="date" value={form.date} onChange={(v: string) => setForm({ ...form, date: v })} />
      <InputGroup label="Amount (KES)" placeholder="0.00" mono value={form.amount} onChange={(v: string) => setForm({ ...form, amount: v })} />

      <button
        onClick={() => {
          if (!form.description || !form.amount) return toast.error('Please fill in all required fields')
          mutation.mutate(form)
        }}
        disabled={mutation.isPending}
        className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-[.5rem] font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-2xl shadow-emerald-900/20 flex items-center justify-center"
      >
        {mutation.isPending ? 'Logging...' : 'Confirm Expense Log'}
      </button>
    </div>
  )
}

function KpiCard({ title, value, sub, icon: Icon, variant }: any) {
  const variants: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  }

  return (
    <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-xl shadow-gray-900/5 flex items-center gap-6 hover:shadow-2xl hover:shadow-gray-900/10 transition-all group">
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

function InputGroup({ label, placeholder, mono = false, type = 'text', value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-none rounded-[.5rem] py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold ${mono ? 'hl-mono text-red-600' : ''}`}
      />
    </div>
  )
}