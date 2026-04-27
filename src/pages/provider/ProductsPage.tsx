import { useState } from 'react'
import { Plus, Search, Filter, Download, Edit, Trash2, Package, TrendingDown, Activity } from 'lucide-react'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { SlideOver } from '../../components/shared/SlideOver'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { exportToCSV } from '../../lib/utils/export'

import { useEffect } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { PaginatedResponse } from '../../lib/types/api'

export default function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: productsData, isLoading, error } = useQuery<PaginatedResponse<any> & { stats: any }>({
    queryKey: ['inventory', search],
    queryFn: () => inventoryApi.list({ search }),
    placeholderData: keepPreviousData
  })

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  const products = productsData?.items || []
  const stats = productsData?.stats || {
    totalItems: 0,
    lowStock: 0,
    totalValue: 0
  }

  const handleExport = () => {
    if (!products.length) return
    exportToCSV(products, 'inventory_report')
    toast.success('Inventory report exported')
  }

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Product removed from inventory')
    },
    onError: (err: any) => toast.error(getErrorMessage(err))
  })

  const confirmDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Products & Stock</h1>
          <p className="text-gray-500 font-medium">Track your inventory, stock levels, and profit margins</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-white text-gray-600 h-12 px-6 rounded-md border border-gray-100 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-[#0D4A3E] text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Items" value={stats.totalItems.toLocaleString()} sub="Unique SKUs" icon={Package} variant="emerald" />
        <SummaryCard title="Low Stock" value={`${stats.lowStock} ALERTS`} sub="Requires attention" icon={TrendingDown} variant="red" />
        <SummaryCard title="Stock Value" value={`KES ${stats.totalValue.toLocaleString()}`} sub="Total inventory" icon={Activity} variant="blue" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      
      <SlideOver 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Product"
      >
        <AddProductForm onClose={() => setIsAddModalOpen(false)} />
      </SlideOver>

      <SlideOver 
        isOpen={!!editingProduct} 
        onClose={() => setEditingProduct(null)} 
        title="Edit Product"
      >
        {editingProduct && <EditProductForm product={editingProduct} onClose={() => setEditingProduct(null)} />}
      </SlideOver>

        <div className="p-6 border-b border-gray-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products by name or category..." 
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
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">In Stock</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Buying</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Selling</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                     <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : products.length > 0 ? products.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        {p.name.charAt(0)}
                      </div>
                      <span className="font-black text-gray-900 text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-widest">{p.category}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-sm font-black hl-mono ${p.stockLevel < 10 ? 'text-red-600' : 'text-gray-900'}`}>{p.stockLevel}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-gray-400 text-xs hl-mono">KES {p.buyingPrice?.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right font-black text-[#0D4A3E] text-sm hl-mono">KES {p.price?.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingProduct(p)}
                        className="p-2 hover:bg-emerald-50 rounded-md transition-all text-gray-300 hover:text-emerald-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(p.id)}
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
                  <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


function AddProductForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', category: 'Groceries', buyingPrice: '', price: '', stock: '' })

  const mutation = useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-pos'] })
      toast.success('Product added successfully')
      onClose()
    },
    onError: (err: any) => toast.error(getErrorMessage(err))
  })

  return (
    <div className="space-y-6">
      <InputGroup label="Product Name" placeholder="e.g. Fresh Milk" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
        <select 
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full bg-gray-50 border-none rounded-md py-4 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold appearance-none text-sm"
        >
           <option>Groceries</option>
           <option>Bakery</option>
           <option>Dairy</option>
           <option>Hardware</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="Buying Price" placeholder="0.00" mono value={form.buyingPrice} onChange={(v: string) => setForm({ ...form, buyingPrice: v })} />
        <InputGroup label="Selling Price" placeholder="0.00" mono value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
      </div>
      <InputGroup label="Initial Stock" placeholder="0" mono value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} />
      
      <button 
       onClick={() => {
         if (!form.name || !form.price) return toast.error('Name and Price are required')
         mutation.mutate({
           ...form,
           price: parseFloat(form.price) || 0,
           buyingPrice: parseFloat(form.buyingPrice) || 0,
           stock: parseInt(form.stock) || 0
         })
       }}
       disabled={mutation.isPending}
       className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-md font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-xl flex items-center justify-center"
      >
        {mutation.isPending ? 'Saving...' : 'Save Inventory Item'}
      </button>
    </div>
  )
}


function EditProductForm({ product, onClose }: { product: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ 
    name: product.name, 
    category: product.category, 
    buyingPrice: product.buyingPrice?.toString() || '', 
    price: product.price?.toString() || '', 
    stock: product.stockLevel?.toString() || '' 
  })

  const mutation = useMutation({
    mutationFn: (data: any) => inventoryApi.update(product.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-pos'] })
      toast.success('Product updated')
      onClose()
    },
    onError: (err: any) => toast.error(getErrorMessage(err))
  })

  return (
    <div className="space-y-6">
      <InputGroup label="Product Name" placeholder="e.g. Fresh Milk" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
        <select 
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full bg-gray-50 border-none rounded-md py-4 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold appearance-none text-sm"
        >
           <option>Groceries</option>
           <option>Bakery</option>
           <option>Dairy</option>
           <option>Hardware</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="Buying Price" placeholder="0.00" mono value={form.buyingPrice} onChange={(v: string) => setForm({ ...form, buyingPrice: v })} />
        <InputGroup label="Selling Price" placeholder="0.00" mono value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
      </div>
      <InputGroup label="Current Stock" placeholder="0" mono value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} />
      
      <button 
       onClick={() => {
         mutation.mutate({
           ...form,
           price: parseFloat(form.price) || 0,
           buyingPrice: parseFloat(form.buyingPrice) || 0,
           stock: parseInt(form.stock) || 0
         })
       }}
       disabled={mutation.isPending}
       className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-md font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-xl flex items-center justify-center"
      >
        {mutation.isPending ? 'Updating...' : 'Update Product Details'}
      </button>
    </div>
  )
}


function SummaryCard({ title, value, sub, icon: Icon, variant }: any) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
      <div className={`h-12 w-12 rounded-md flex items-center justify-center shrink-0 ${variants[variant as keyof typeof variants]} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h3 className="text-xl font-black text-gray-900 hl-mono">{value}</h3>
        <p className="text-[10px] text-gray-500 font-bold">{sub}</p>
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
        className={`w-full bg-gray-50 border-none rounded-md py-4 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold ${mono ? 'hl-mono text-[#0D4A3E]' : ''}`} 
      />
    </div>
  )
}
