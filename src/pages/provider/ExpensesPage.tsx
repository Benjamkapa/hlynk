import { useState } from 'react'
import { Plus, Search, Filter, Wallet, TrendingUp, DollarSign, Trash2, Download } from 'lucide-react'
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
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Expense Tracking</h1>
          <p className="text-gray-500 font-medium">Monitor your business overheads and spending flow</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="bg-gray-100 text-gray-600 h-12 px-6 rounded-md font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <Download size={18} /> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-[#0D4A3E] text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} /> Log Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Expenses" value={`KES ${stats.totalExpenses.toLocaleString()}`} sub="Month to Date" icon={Wallet} variant="red" />
        <KpiCard title="Highest Category" value={stats.highestCategory} sub="Top spending area" icon={TrendingUp} variant="amber" />
        <KpiCard title="Burn Rate" value={`KES ${stats.burnRate.toLocaleString()}`} sub="Daily average" icon={DollarSign} variant="emerald" />
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by description or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-md py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-medium" 
            />
          </div>
          <button className="bg-gray-50 text-gray-500 h-12 px-4 rounded-md flex items-center gap-2 font-bold text-xs hover:bg-gray-100 transition-all border border-gray-100">
            <Filter size={16} />
            Filters
          </button>
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
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : expenses.length > 0 ? expenses.map((e: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-5 text-xs font-bold text-gray-400 hl-mono">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-5">
                    <span className="font-black text-gray-900 text-sm">{e.description}</span>
                    <p className="text-[9px] text-gray-400 font-bold hl-mono">{e.id.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-widest">{e.category}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-red-600 text-sm hl-mono">KES {e.amount.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => {
                        if (window.confirm('Delete this expense?')) {
                          deleteMutation.mutate(e.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2 hover:bg-red-50 rounded-md transition-all text-gray-300 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No expenses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      <SlideOver isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log New Expense">
         <AddExpenseForm onClose={() => setIsAddModalOpen(false)} />
      </SlideOver>
    </div>
  )
}

function AddExpenseForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ description: '', category: 'Utilities', amount: '' })

  const mutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense logged successfully')
      onClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to log expense')
  })

  return (
    <div className="space-y-6">
      <InputGroup label="Description" placeholder="e.g. Electricity Bill" value={form.description} onChange={(v: string) => setForm({ ...form, description: v })} />
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
        <select 
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full bg-gray-50 border-none rounded-md py-4 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-sm appearance-none"
        >
           <option>Utilities</option>
           <option>Rent</option>
           <option>Supplies</option>
           <option>Transport</option>
           <option>Staff Wages</option>
        </select>
      </div>
      <InputGroup label="Amount (KES)" placeholder="0.00" mono value={form.amount} onChange={(v: string) => setForm({ ...form, amount: v })} />
      
      <button 
        onClick={() => mutation.mutate(form)}
        disabled={mutation.isPending}
        className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-md font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-xl flex items-center justify-center"
      >
        {mutation.isPending ? 'Logging...' : 'Confirm Expense Log'}
      </button>
    </div>
  )
}

function KpiCard({ title, value, sub, icon: Icon, variant }: any) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
      <div className={`h-12 w-12 rounded-md flex items-center justify-center shrink-0 ${variants[variant as keyof typeof variants]} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h3 className="text-xl font-black text-gray-900 hl-mono">{value}</h3>
        <p className="text-[10px] text-gray-500 font-bold hl-mono">{sub}</p>
      </div>
    </div>
  )
}

function InputGroup({ label, placeholder, mono = false, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-none rounded-md py-4 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold ${mono ? 'hl-mono text-red-600' : ''}`} 
      />
    </div>
  )
}
