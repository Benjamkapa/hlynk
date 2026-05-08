import { useState } from 'react'
import { Users, Phone, Search, Plus, Mail, User, Trash2, Edit, Download, Star, Eye } from 'lucide-react'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { SlideOver } from '../../components/shared/SlideOver'
import { exportToCSV } from '../../lib/utils/export'
import TablePagination from '../../components/shared/TablePagination'

import { useEffect } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { PaginatedResponse } from '../../lib/types/api'

export default function CustomersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const queryClient = useQueryClient()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data: customerData, isLoading } = useQuery<PaginatedResponse<any> & { stats: any }>({
    queryKey: ['customers', search, page, sortBy, sortOrder],
    queryFn: () => customersApi.list({ search, page, limit: 10, sortBy, sortOrder }),
    placeholderData: keepPreviousData,
  })

  const customers = customerData?.items || []
  const pages = customerData?.pages || 1
  const stats = customerData?.stats || { total: 0, activeToday: 0, topSpender: 'N/A' }

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer removed')
      setConfirmDeleteId(null)
    }
  })

  const handleExport = () => {
    if (!customers.length) return
    exportToCSV(customers, 'customers_list')
    toast.success('Customer list exported')
  }

  return (
    <div className="mx-auto space-y-12 animate-in fade-in duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Community</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
            <Users size={14} className="text-emerald-500" /> Relationship Management
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="h-14 px-6 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/50 flex items-center gap-2"
          >
            <Download size={18} /> Export
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-14 px-8 bg-[#0D4A3E] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-2xl shadow-emerald-900/20 flex items-center gap-2"
          >
            <Plus size={20} /> New Customer
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Database" value={stats.total} sub="Registered Customers" icon={Users} variant="emerald" />
        <KpiCard title="Active Today" value={stats.activeToday} sub="Visiting Customers" icon={Star} variant="amber" />
        <KpiCard title="Top Spender" value={stats.topSpender} sub="High Value Profile" icon={TrendingUpIcon} variant="blue" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-900/5 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-50 border-none rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Information</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spend</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Visit</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : customers.length > 0 ? customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} alt="avatar" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {c.id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Phone size={14} className="text-slate-300" /> {c.phone}
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                          <Mail size={14} className="text-slate-300" /> {c.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-900 text-sm hl-mono">
                    KES {Number(c.totalSpend || 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-400 hl-mono uppercase">
                    {c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => toast.info('Customer insights coming soon!', { description: 'Full performance and purchase history will be viewable here.'})}
                        className="p-2 hover:bg-white hover:shadow-lg rounded-xl transition-all text-slate-400 hover:text-blue-500"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => setEditingCustomer(c)}
                        className="p-2 hover:bg-white hover:shadow-lg rounded-xl transition-all text-slate-400 hover:text-emerald-600"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(c.id)}
                        className="p-2 hover:bg-white hover:shadow-lg rounded-xl transition-all text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-40 text-center">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <User size={40} className="text-slate-200" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-300">No customers found</p>
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

      <SlideOver isOpen={isAddModalOpen || !!editingCustomer} onClose={() => { setIsAddModalOpen(false); setEditingCustomer(null) }} title={editingCustomer ? "Edit Customer" : "Add New Customer"}>
        <CustomerForm
          customer={editingCustomer}
          onClose={() => { setIsAddModalOpen(false); setEditingCustomer(null) }}
        />
      </SlideOver>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Customer"
        message="Delete this customer? This will remove their profile but preserve sales history."
        confirmText="Delete Customer"
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

function CustomerForm({ customer, onClose }: { customer?: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || ''
  })

  const mutation = useMutation({
    mutationFn: (data: any) => customer ? customersApi.update(customer.id, data) : customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success(customer ? 'Profile updated' : 'Customer added')
      onClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Something went wrong')
  })

  return (
    <div className="space-y-6">
      <InputGroup label="Full Name" placeholder="e.g. John Doe" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
      <InputGroup label="Phone Number" placeholder="0712..." value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} />
      <InputGroup label="Email Address" placeholder="john@example.com" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />

      <button
        onClick={() => mutation.mutate(form)}
        disabled={mutation.isPending}
        className="w-full py-5 mt-8 bg-[#0D4A3E] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-2xl shadow-emerald-900/20"
      >
        {mutation.isPending ? 'Processing...' : customer ? 'Update Profile' : 'Register Customer'}
      </button>
    </div>
  )
}

function KpiCard({ title, value, sub, icon: Icon, variant }: any) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 flex items-center gap-6 hover:shadow-2xl transition-all border-b-4 group">
      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${variants[variant as keyof typeof variants]} border`}>
        <Icon size={32} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 hl-mono tracking-tight">{value}</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">{sub}</p>
      </div>
    </div>
  )
}

function InputGroup({ label, placeholder, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border-none rounded-2xl py-4.5 px-6 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold"
      />
    </div>
  )
}

function TrendingUpIcon(props: any) {
  return <Star {...props} />
}