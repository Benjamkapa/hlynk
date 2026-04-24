import { useState } from 'react'
import { Wallet, Plus, Search, TrendingDown, Calendar, Loader2, Receipt } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { expensesApi } from '../../lib/api/providers'

export default function ExpensesPage() {
  const [search, setSearch] = useState('')
  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', search],
    queryFn: () => expensesApi.list({ search })
  })

  const expenses = expensesData?.data || []
  const stats = expensesData?.stats || { monthlyTotal: 0, topCategory: 'None' }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0D1B12] font-nunito uppercase tracking-tight">Expense Tracking</h1>
          <p className="text-sm text-[#8FA398] font-medium">Monitor your business costs and overheads</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#20C997] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#20C997]/20 hover:scale-105 transition-transform">
          <Plus size={18} />
          <span>Record Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-[#8FA398] uppercase tracking-widest mb-1">Monthly Expenses</p>
            <p className="text-2xl font-black text-[#0D1B12] font-saira">KES {stats.monthlyTotal.toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444]">
            <TrendingDown size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <p className="text-[10px] font-black text-[#8FA398] uppercase tracking-widest mb-1">Top Category</p>
          <p className="text-2xl font-black text-[#0D1B12] font-saira">{stats.topCategory}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA398]" />
            <input 
              type="text" 
              placeholder="Filter expenses..." 
              className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#20C997]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-2 text-[#8FA398] hover:bg-[#F9FAFB] rounded-lg transition-colors"><Calendar size={20} /></button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 text-[#20C997] animate-spin" />
              <p className="text-sm font-bold text-[#8FA398] uppercase tracking-widest">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#F9FAFB] flex items-center justify-center text-[#8FA398] mb-4">
                <Receipt size={32} />
              </div>
              <h3 className="text-lg font-black text-[#0D1B12] font-nunito uppercase">No expenses recorded</h3>
              <p className="text-sm text-[#8FA398] max-w-xs mt-2">Keep track of every shilling that leaves your business to see your real profit.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {expenses.map((e: any) => (
                  <tr key={e.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-[#0D1B12]">{e.desc}</td>
                    <td className="px-6 py-4 text-xs text-[#8FA398] font-semibold">{e.category}</td>
                    <td className="px-6 py-4 font-black text-sm font-saira text-[#EF4444]">KES {e.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-[#8FA398] font-medium">{e.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                        e.status === 'PAID' ? 'bg-[#20C997]/10 text-[#20C997]' : 'bg-[#F5A623]/10 text-[#F5A623]'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
