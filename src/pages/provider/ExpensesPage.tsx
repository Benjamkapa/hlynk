import { useState } from 'react'
import { Plus, Search, Wallet, TrendingUp, Trash2, Download } from 'lucide-react'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { SlideOver } from '../../components/shared/SlideOver'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expensesApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { exportToCSV } from '../../lib/utils/export'
import { useEffect } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { PaginatedResponse } from '../../lib/types/api'

export default function ExpensesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: expensesData, isLoading, error } = useQuery<PaginatedResponse<any> & { stats: any }>({
    queryKey: ['expenses', search],
    queryFn: () => expensesApi.list({ search }),
    placeholderData: keepPreviousData
  })

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  const expenses = expensesData?.items || []
  const stats = expensesData?.stats || { totalExpenses: 0, highestCategory: 'N/A', burnRate: 0 }

  const handleExport = () => {
    if (!expenses.length) return
    exportToCSV(expenses, 'expense_report')
    toast.success('Expense report exported')
  }

  const deleteMutation = useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense record deleted')
    },
    onError: (err: any) => toast.error(getErrorMessage(err))
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Expense Tracking</h1>
          <p className="text-gray-500 font-medium">Monitor your business overheads and spending flow</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="bg-gray-100 text-gray-600 h-12 px-6 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0D4A3E] text-white h-12 px-6 rounded-xl font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2 shadow-xl shadow-emerald-900/10"
          >
            <Plus size={20} /> Log Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Expenses" value={`KES ${stats.totalExpenses.toLocaleString()}`} sub="Month to Date" icon={Wallet} variant="red" />
        <KpiCard title="Highest Category" value={stats.highestCategory} sub="Top spending area" icon={TrendingUp} variant="amber" />
        <BurnRateGauge value={stats.burnRate} target={50000} />
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
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
                  <td className="px-8 py-5 text-xs font-bold text-gray-400 hl-mono">{new Date(e.date || e.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-5">
                    <span className="font-black text-gray-900 text-sm">{e.description}</span>
                    <p className="text-[9px] text-gray-400 font-bold hl-mono tracking-tighter uppercase">ID: {e.id.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md uppercase tracking-widest">{e.category}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-red-600 text-sm hl-mono whitespace-nowrap">KES {Number(e.amount).toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this expense record?')) {
                          deleteMutation.mutate(e.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2 hover:bg-white hover:shadow-lg rounded-lg transition-all text-slate-300 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet size={32} className="text-gray-200" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">No expense records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log New Expense">
        <AddExpenseForm onClose={() => setIsAddModalOpen(false)} />
      </SlideOver>
    </div>
  )
}

// ─── Burn Rate Gauge ─────────────────────────────────────────────────────────

function BurnRateGauge({ value, target }: { value: number; target: number }) {
  const pct = Math.min(Math.round((value / target) * 100), 100)

  // Color ramps based on intensity zones
  const zone =
    pct < 40 ? { color: '#10b981', track: '#d1fae5', label: 'Safe', labelColor: '#065f46' }
    : pct < 70 ? { color: '#f59e0b', track: '#fef3c7', label: 'Moderate', labelColor: '#92400e' }
    : pct < 90 ? { color: '#f97316', track: '#ffedd5', label: 'Elevated', labelColor: '#9a3412' }
    : { color: '#ef4444', track: '#fee2e2', label: 'Critical', labelColor: '#991b1b' }

  const cx = 110
  const cy = 110
  const R = 84
  const strokeW = 14
  const circumference = Math.PI * R

  const pctToPoint = (p: number) => {
    const angle = Math.PI - (p / 100) * Math.PI
    return {
      x: cx + R * Math.cos(angle),
      y: cy - R * Math.sin(angle),
    }
  }

  const needle = pctToPoint(pct)
  const dashOffset = circumference - (pct / 100) * circumference

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-gray-900/10 transition-all p-6 flex flex-col items-center justify-between h-full group">
      <div className="w-full flex items-start justify-between mb-1">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Daily Burn</p>
          <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: zone.labelColor }}>{zone.label}</p>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest transition-colors duration-500" style={{ background: zone.track, color: zone.labelColor }}>{pct}%</span>
      </div>

      <div className="relative w-full flex items-center justify-center">
        <svg width="100%" viewBox="0 0 220 120" className="overflow-visible max-w-[240px]">
          <defs><filter id="gaugeGlow"><feGaussianBlur stdDeviation="2" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter></defs>
          <path d={`M ${cx - R},${cy} A ${R},${R} 0 0,1 ${cx + R},${cy}`} stroke={zone.track} strokeWidth={strokeW} strokeLinecap="round" fill="none" />
          <path d={`M ${cx - R},${cy} A ${R},${R} 0 0,1 ${cx + R},${cy}`} stroke={zone.color} strokeWidth={strokeW} strokeLinecap="round" fill="none" strokeDasharray={circumference} strokeDashoffset={dashOffset} filter="url(#gaugeGlow)" className="transition-all duration-1000 ease-out" />
          {[25, 50, 75].map((tick) => {
            const inner = pctToPoint(tick)
            const angle = Math.PI - (tick / 100) * Math.PI
            const outer = {
              x: cx + (R + strokeW * 0.5 + 4) * Math.cos(angle),
              y: cy - (R + strokeW * 0.5 + 4) * Math.sin(angle),
            }
            return <line key={tick} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#e2e8f0" strokeWidth={1.5} strokeLinecap="round" />
          })}
          <circle 
            cx={needle.x} 
            cy={needle.y} 
            r={7} 
            fill="white" 
            stroke={zone.color} 
            strokeWidth={3} 
            style={{ transition: 'cx 0.8s ease, cy 0.8s ease, stroke 0.6s ease' }} 
          />
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="26" fontWeight="800" fontFamily="monospace" fill="#0f172a">{value.toLocaleString()}</text>
          <text x={cx} y={cy + 28} textAnchor="middle" fontSize="9" fontWeight="700" fontFamily="sans-serif" fill="#94a3b8" letterSpacing="1.5">KES / DAY</text>
          <text x={cx - R - 4} y={cy + 20} textAnchor="middle" fontSize="9" fill="#cbd5e1" fontFamily="monospace">0</text>
          <text x={cx + R + 4} y={cy + 20} textAnchor="middle" fontSize="9" fill="#cbd5e1" fontFamily="monospace">{(target / 1000).toFixed(0)}k</text>
        </svg>
      </div>

      {/* Footer: rolling avg vs target */}
      <div className="w-full flex justify-between items-end pt-3 border-t border-gray-50">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rolling Avg</p>
          <p className="text-sm font-black text-slate-900 hl-mono">KES {value.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Daily Cap</p>
          <p className="text-sm font-black text-slate-400 hl-mono">KES {target.toLocaleString()}</p>
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
          className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-sm appearance-none"
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
        className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-2xl shadow-emerald-900/20 flex items-center justify-center"
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
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-900/5 flex items-center gap-6 hover:shadow-2xl hover:shadow-gray-900/10 transition-all group">
      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${variants[variant]} border`}>
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
        className={`w-full bg-gray-50 border-none rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold ${mono ? 'hl-mono text-red-600' : ''}`}
      />
    </div>
  )
}