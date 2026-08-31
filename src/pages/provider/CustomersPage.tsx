import { useState } from 'react'
import { Users, Phone, Search, Plus, Mail, User, Trash2, Edit, Download, Star, Eye } from 'lucide-react'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { SlideOver } from '../../components/shared/SlideOver'
import { exportToCSV } from '../../lib/utils/export'
import TablePagination from '../../components/shared/TablePagination'

import { keepPreviousData } from '@tanstack/react-query'
import { PaginatedResponse } from '../../lib/types/api'

export default function CustomersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [viewingCustomer, setViewingCustomer] = useState<any>(null)
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
    <div className="space-y-8 pt-4">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="text-gray-400 text-sm mt-0.5">Relationship management</p>
        </div>
        <div className="flex items-center gap-2">
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
            <Plus size={16} /> New customer
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
        <StatCell icon={Users} label="Total database" value={String(stats.total)} sub="Registered customers" />
        <StatCell icon={Star} label="Active today" value={String(stats.activeToday)} sub="Visiting customers" />
        <StatCell icon={Star} label="Top spender" value={String(stats.topSpender)} sub="High value profile" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[.5rem] border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
            <input
              type="text"
              placeholder="Search by name, phone or email…"
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
                <th className="px-5 py-3 text-xs font-medium text-gray-400">Customer profile</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400">Contact information</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400">Total spend</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400">Last visit</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-gray-400">Loading…</td>
                </tr>
              ) : customers.length > 0 ? customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-[.5rem] bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} alt="avatar" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400 hl-mono">ID: {c.id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={13} className="text-gray-300" /> {c.phone}
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Mail size={13} className="text-gray-300" /> {c.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900 text-sm hl-mono">
                    KES {Number(c.totalSpend || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400 hl-mono">
                    {c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setViewingCustomer(c)}
                        className="p-1.5 rounded-[.5rem] text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="View insights"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => setEditingCustomer(c)}
                        className="p-1.5 rounded-[.5rem] text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(c.id)}
                        className="p-1.5 rounded-[.5rem] text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-gray-400">No customers found.</td>
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

      <SlideOver
        isOpen={isAddModalOpen || !!editingCustomer || !!viewingCustomer}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCustomer(null);
          setViewingCustomer(null);
        }}
        title={viewingCustomer ? "Customer insights" : editingCustomer ? "Edit customer" : "Add new customer"}
      >
        {viewingCustomer ? (
          <CustomerInsights
            customer={viewingCustomer}
            onClose={() => setViewingCustomer(null)}
          />
        ) : (
          <CustomerForm
            customer={editingCustomer}
            onClose={() => { setIsAddModalOpen(false); setEditingCustomer(null) }}
          />
        )}
      </SlideOver>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete customer"
        message="Delete this customer? This will remove their profile but preserve sales history."
        confirmText="Delete customer"
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
    <div className="space-y-5">
      <InputGroup label="Full name" placeholder="e.g. John Doe" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
      <InputGroup label="Phone number" placeholder="0712…" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} />
      <InputGroup label="Email address" placeholder="john@example.com" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />

      <button
        onClick={() => mutation.mutate(form)}
        disabled={mutation.isPending}
        className="w-full py-3.5 mt-4 bg-[#0D4A3E] text-white rounded-[.5rem] text-sm font-medium hover:bg-[#0A3D33] transition-colors"
      >
        {mutation.isPending ? 'Processing…' : customer ? 'Update profile' : 'Register customer'}
      </button>
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

function InputGroup({ label, placeholder, value, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm"
      />
    </div>
  )
}

function CustomerInsights({ customer, onClose }: { customer: any; onClose: () => void }) {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['customer-sales', customer.id],
    queryFn: () => customersApi.getSales(customer.id),
    enabled: !!customer.id
  })

  const sales = salesData?.items || []

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-[.5rem] p-5 border border-gray-100 flex items-center gap-4">
        <div className="h-14 w-14 rounded-[.5rem] bg-white flex items-center justify-center p-1.5 border border-gray-100 flex-shrink-0">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`} alt="avatar" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{customer.name}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{customer.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
        <div className="bg-white p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Total spent</p>
          <h4 className="text-lg font-semibold text-gray-900 hl-mono">KES {Number(customer.totalSpend || 0).toLocaleString()}</h4>
        </div>
        <div className="bg-white p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Visits</p>
          <h4 className="text-lg font-semibold text-gray-900 hl-mono">{sales.length} purchases</h4>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs text-gray-400">Recent transactions</h4>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : sales.length > 0 ? (
          <div className="divide-y divide-gray-50 border border-gray-100 rounded-[.5rem]">
            {sales.slice(0, 5).map((sale: any) => (
              <div key={sale.id} className="p-3.5 flex justify-between items-center hover:bg-gray-50/60 transition-colors">
                <div className="text-sm text-gray-700 hl-mono">#{sale.id.slice(-6).toUpperCase()}</div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 hl-mono">KES {Number(sale.totalAmount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-gray-50 rounded-[.5rem] border border-gray-100 text-sm text-gray-400">No history found</div>
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full py-3.5 bg-gray-900 text-white rounded-[.5rem] text-sm font-medium hover:bg-black transition-colors"
      >
        Close
      </button>
    </div>
  )
}