import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Eye, Download } from 'lucide-react'
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
import { getLocalDateString, formatLocalDate } from '../../lib/utils/date'

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
    refetchInterval: 15_000
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
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense deleted')
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  })

  const { data: selectedExpense, isLoading: isDetailLoading } = useQuery({
    queryKey: ['expense', viewDetailsId],
    queryFn: () => expensesApi.getById(viewDetailsId!),
    enabled: !!viewDetailsId,
  })

  const sort = (key: string) => {
    setSortBy(key)
    setSortOrder(sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="space-y-8 pt-4">

      <SlideOver
        isOpen={!!viewDetailsId}
        onClose={() => setViewDetailsId(null)}
        title="Expense details"
      >
        {isDetailLoading ? (
          <div className="py-24 text-center text-sm text-gray-400">Loading…</div>
        ) : selectedExpense && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Amount</p>
              <p className="text-3xl font-semibold text-gray-900 hl-mono">
                KES {Number(selectedExpense.amount).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 py-5 border-y border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-1">Category</p>
                <p className="text-sm font-medium text-gray-900">{selectedExpense.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Date</p>
                <p className="text-sm font-medium text-gray-900 hl-mono">{formatLocalDate(selectedExpense.date)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedExpense.description}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium">
                {(selectedExpense.recordedBy || 'S')[0]}
              </div>
              <div>
                <p className="text-xs text-gray-400">Recorded by</p>
                <p className="text-sm font-medium text-gray-900">{selectedExpense.recordedBy || 'System Admin'}</p>
              </div>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Page header */}
      <div className="grid grid-cols-3 sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Expenses</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track business overheads and spending</p>
        </div>
        <div className="gap-2 col-span-2 flex justify-end ">
          <button
            onClick={handleExport}
            className="h-9 px-4 rounded-[.5rem] text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download size={15} /> Export
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0D4A3E] text-white h-9 px-4 rounded-[.5rem] text-sm font-medium hover:bg-[#0A3D33] transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Log expense
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
        <SummaryCell label="Total expenses" value={`KES ${stats.totalExpenses.toLocaleString()}`} sub="Month to date" />
        <SummaryCell label="Highest category" value={stats.highestCategory} sub="Top spending area" />
        <BurnRateCell value={stats.totalExpenses} target={250000} />
      </div>

      {/* Expenses table */}
      <div className="bg-white rounded-[.5rem] border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
            <input
              type="text"
              placeholder="Search expenses…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full bg-gray-50 border-none rounded-[.5rem] py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <Th label="Date" active={sortBy === 'date'} order={sortOrder} onClick={() => sort('date')} />
                <Th label="Description" active={sortBy === 'description'} order={sortOrder} onClick={() => sort('description')} />
                <Th label="Category" active={sortBy === 'category'} order={sortOrder} onClick={() => sort('category')} />
                <Th label="Recorded by" active={sortBy === 'recordedBy'} order={sortOrder} onClick={() => sort('recordedBy')} />
                <Th label="Amount" align="right" active={sortBy === 'amount'} order={sortOrder} onClick={() => sort('amount')} />
                <th className="px-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-gray-400">Loading…</td>
                </tr>
              ) : expenses.length > 0 ? expenses.map((e: any, i: number) => (
                <tr key={e.id ?? i} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-gray-500 hl-mono whitespace-nowrap">
                    {new Date(e.date || e.createdAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-gray-900 text-sm">{e.description}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">{e.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-400">{e.recordedBy || 'System'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-medium text-gray-900 hl-mono whitespace-nowrap">
                    KES {Number(e.amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewDetailsId(e.id)}
                        disabled={viewDetailsMutation.isPending}
                        className="p-1.5 rounded-[.5rem] text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(e.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-[.5rem] text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-gray-400">No expenses found.</td>
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

      <SlideOver isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log new expense">
        <AddExpenseForm onClose={() => setIsAddModalOpen(false)} />
      </SlideOver>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmText="Delete expense"
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

// ─── Table header cell ─────────────────────────────────────────────────────

function Th({ label, active, order, onClick, align = 'left' }: any) {
  return (
    <th
      onClick={onClick}
      className={`px-5 py-3 text-xs font-medium cursor-pointer select-none transition-colors ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${active ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
    >
      {label}{active && (order === 'asc' ? ' ↑' : ' ↓')}
    </th>
  )
}

// ─── Overview cells ─────────────────────────────────────────────────────────

function SummaryCell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white p-6">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 hl-mono tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

function BurnRateCell({ value, target }: { value: number; target: number }) {
  const pct = Math.min(Math.round((value / target) * 100), 100)

  const zone =
    pct < 40
      ? { label: 'Healthy', color: '#0D4A3E' }
      : pct < 70
      ? { label: 'Moderate', color: '#b8860b' }
      : pct < 90
      ? { label: 'High', color: '#c2410c' }
      : { label: 'Critical', color: '#b91c1c' }

  // Simple flat arc — no gradient, no glow, a handful of ticks.
  const cx = 40, cy = 40, R = 32
  const startDeg = 220, sweep = 260
  const toRad = (d: number) => (d * Math.PI) / 180
  const polar = (a: number, r = R) => ({ x: cx + r * Math.cos(toRad(a)), y: cy - r * Math.sin(toRad(a)) })
  const p0 = polar(startDeg)
  const p1 = polar(startDeg - sweep)
  const arcPath = `M ${p0.x.toFixed(2)},${p0.y.toFixed(2)} A ${R},${R} 0 1,1 ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`
  const arcLen = (sweep / 360) * 2 * Math.PI * R
  const filled = (pct / 100) * arcLen

  return (
    <div className="bg-white p-6 flex items-center gap-5">
      <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
        <path d={arcPath} stroke="#f1f5f9" strokeWidth={7} strokeLinecap="round" fill="none" />
        <path
          d={arcPath}
          stroke={zone.color}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${filled.toFixed(2)} ${arcLen.toFixed(2)}`}
          className="transition-all duration-700 ease-out"
        />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fontWeight="600" fill="#111827" className="hl-mono">
          {pct}%
        </text>
      </svg>
      <div>
        <p className="text-xs text-gray-400 mb-2">Monthly budget</p>
        <p className="text-sm font-medium" style={{ color: zone.color }}>{zone.label}</p>
        <p className="text-xs text-gray-400 mt-1 hl-mono">
          {(value || 0).toLocaleString()} / {(target || 0).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

// ─── Add expense form ───────────────────────────────────────────────────────

function AddExpenseForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    description: '',
    category: 'Utilities',
    amount: '',
    date: getLocalDateString(),
  })

  const mutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense logged')
      onClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to log expense'),
  })

  return (
    <div className="space-y-5">
      <InputGroup label="Description" placeholder="e.g. Electricity bill" value={form.description} onChange={(v: string) => setForm({ ...form, description: v })} />

      <div className="space-y-1.5">
        <label className="text-xs text-gray-500">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm"
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
        className="w-full py-3.5 mt-4 bg-[#0D4A3E] text-white rounded-[.5rem] text-sm font-medium hover:bg-[#0A3D33] transition-colors"
      >
        {mutation.isPending ? 'Logging…' : 'Log expense'}
      </button>
    </div>
  )
}

function InputGroup({ label, placeholder, mono = false, type = 'text', value, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm ${mono ? 'hl-mono' : ''}`}
      />
    </div>
  )
}