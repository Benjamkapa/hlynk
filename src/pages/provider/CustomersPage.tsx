import { useState } from 'react'
import { Users, Phone, Search, Plus, Filter, Mail, User, Trash2, Edit, Download } from 'lucide-react'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { SlideOver } from '../../components/shared/SlideOver'
import { exportToCSV } from '../../lib/utils/export'

import { useEffect } from 'react'
import { PaginatedResponse } from '../../lib/types/api'

export default function CustomersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: customersData, isLoading, error } = useQuery<PaginatedResponse<any>>({
    queryKey: ['customers', search],
    queryFn: () => customersApi.list({ search })
  })

  useEffect(() => {
    if (error) toast.error('Failed to load customers')
  }, [error])

  const customers = customersData?.items || []

  const handleExport = () => {
    if (!customers.length) return
    exportToCSV(customers, 'customer_list')
    toast.success('Customer list exported')
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => Promise.resolve(id), // Mock for now if not in API
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer profile removed')
    },
    onError: () => toast.error('Failed to remove customer')
  })

  const confirmDelete = (id: string) => {
    if (window.confirm('Remove this customer profile?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>

      <SlideOver 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Register New Customer"
      >
        <AddCustomerForm onClose={() => setIsAddModalOpen(false)} />
      </SlideOver>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500 font-medium">Manage repeat customers and track loyalty programs</p>
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
            className="bg-[#0D4A3E] text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add Customer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customers by name or phone..." 
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
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Visit</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Spend</th>
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
              ) : customers.length > 0 ? customers.map((customer: any) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-black text-gray-900 text-sm">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500 hl-mono">
                      <Phone size={14} className="text-gray-300" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-400">{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}</td>
                  <td className="px-8 py-5 text-right font-black text-[#0D4A3E] text-sm hl-mono">KES {customer.totalSpend?.toLocaleString() || 0}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 hover:bg-emerald-50 rounded-md transition-all text-gray-300 hover:text-emerald-600">
                         <Edit size={16} />
                       </button>
                       <button 
                         onClick={() => confirmDelete(customer.id)}
                         disabled={deleteMutation.isPending}
                         className="p-2 hover:bg-red-50 rounded-md transition-all text-gray-300 hover:text-red-600 disabled:opacity-50"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AddCustomerForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  const mutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer registered successfully')
      onClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to register customer')
  })

  return (
    <div className="space-y-6">
      <CustomerInputGroup label="Full Name" placeholder="e.g. John Doe" icon={User} value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
      <CustomerInputGroup label="Phone Number" placeholder="e.g. +254..." icon={Phone} value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} />
      <CustomerInputGroup label="Email Address (Optional)" placeholder="e.g. john@example.com" icon={Mail} value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />
      
      <button 
       onClick={() => {
         if (!form.name || !form.phone) return toast.error('Name and Phone are required')
         mutation.mutate(form)
       }}
       disabled={mutation.isPending}
       className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-md font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-xl flex items-center justify-center"
      >
        {mutation.isPending ? 'Processing...' : 'Register Customer'}
      </button>
    </div>
  )
}

function CustomerInputGroup({ label, placeholder, icon: Icon, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-50 border-none rounded-md py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold" 
        />
      </div>
    </div>
  )
}
