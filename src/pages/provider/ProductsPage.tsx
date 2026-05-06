import { useState } from 'react'
import { Plus, Search, Filter, Download, Edit, Trash2, Package, TrendingDown, Activity, Lock, AlertTriangle } from 'lucide-react'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { SlideOver } from '../../components/shared/SlideOver'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { exportToCSV } from '../../lib/utils/export'
import FeatureGate from '../../components/shared/FeatureGate'

import { useEffect } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { PaginatedResponse } from '../../lib/types/api'

export default function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const queryClient = useQueryClient()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data: productsData, isLoading, error } = useQuery<PaginatedResponse<any> & { stats: any }>({
    queryKey: ['inventory', search, page, sortBy, sortOrder],
    queryFn: () => inventoryApi.list({ search, page, limit: 10, sortBy, sortOrder }),
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard title="Total Items" value={stats.totalItems.toLocaleString()} sub="Unique SKUs" icon={Package} variant="emerald" />
        <FeatureGate feature="low_stock_alerts">
          <SummaryCard title="Low Stock" value={`${stats.lowStock} ALERTS`} sub="Requires attention" icon={TrendingDown} variant="red" />
        </FeatureGate>
        <SummaryCard title="Stock Value" value={`KES ${stats.totalValue.toLocaleString()}`} sub="Total inventory" icon={Activity} variant="blue" />
        <SummaryCard title="Expiring Soon" value={`${stats.expiringSoon || 0} ITEMS`} sub="Within 30 days" icon={AlertTriangle} variant="amber" />
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
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Product {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('category'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('stockLevel'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>In Stock {sortBy === 'stockLevel' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('buyingPrice'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Buying {sortBy === 'buyingPrice' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('price'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Selling {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
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
                <tr key={p.id ?? i} className="hover:bg-emerald-50/30 transition-all group cursor-pointer">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-sm transition-transform group-hover:scale-110" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all text-[10px]">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-black text-slate-900 text-sm block">{p.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 hl-mono tracking-tighter uppercase">SKU: {p.sku || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-widest">{p.category}</span>
                      {p.isPerishable && (
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${new Date(p.expiryDate) < new Date() ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                          {new Date(p.expiryDate) < new Date() ? 'Expired' : `Exp: ${new Date(p.expiryDate).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-sm font-black hl-mono ${p.stockLevel < 10 ? 'text-red-600' : 'text-slate-900'}`}>{p.stockLevel}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-slate-400 text-xs hl-mono">KES {Number(p.buyingPrice || 0).toLocaleString()}</td>
                  <td className="px-8 py-5 text-right font-black text-[#0D4A3E] text-sm hl-mono">KES {Number(p.price).toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingProduct(p) }}
                        className="p-2 hover:bg-white hover:shadow-lg rounded-lg transition-all text-slate-300 hover:text-emerald-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id) }}
                        disabled={deleteMutation.isPending}
                        className="p-2 hover:bg-white hover:shadow-lg rounded-lg transition-all text-slate-300 hover:text-red-600 disabled:opacity-50"
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
          <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Confirm Action"
        message="Are you sure you want to proceed? This action cannot be undone."
        confirmText="Confirm"
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
</div>
  )
}


function AddProductForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', category: 'Groceries', buyingPrice: '', price: '', stock: '', imageUrl: '', isPerishable: false, expiryDate: '' })

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
      <div className="flex flex-col items-center gap-4">
        <div 
          onClick={() => document.getElementById('image-upload')?.click()}
          className="h-32 w-32 rounded-3xl bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group relative"
        >
          {form.imageUrl ? (
            <>
              <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <Plus className="text-white" size={32} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300 group-hover:text-emerald-500 transition-all">
              <Plus size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest">Upload Image</span>
            </div>
          )}
          <input 
            id="image-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string })
                reader.readAsDataURL(file)
              }
            }}
          />
        </div>
        {form.imageUrl && (
          <button 
            type="button"
            onClick={() => setForm({ ...form, imageUrl: '' })}
            className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
          >
            Remove Image
          </button>
        )}
      </div>

      <InputGroup label="Product Name" placeholder="e.g. Fresh Milk" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />

      
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
        <select 
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold appearance-none text-sm"
        >
           {['Groceries', 'Bakery', 'Dairy', 'Hardware', 'Electronics', 'Clothing', 'Services', 'Other'].map(c => (
             <option key={c}>{c}</option>
           ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="Buying Price" placeholder="0.00" mono value={form.buyingPrice} onChange={(v: string) => setForm({ ...form, buyingPrice: v })} />
        <InputGroup label="Selling Price" placeholder="0.00" mono value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
      </div>
      <InputGroup label="Initial Stock" placeholder="0" mono value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} />
      
      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <input 
          type="checkbox" 
          id="isPerishableAdd" 
          checked={form.isPerishable} 
          onChange={(e) => setForm({ ...form, isPerishable: e.target.checked })}
          className="h-4 w-4 accent-emerald-600 rounded border-slate-300"
        />
        <label htmlFor="isPerishableAdd" className="text-sm font-bold text-slate-700 cursor-pointer">This item is perishable</label>
      </div>

      {form.isPerishable && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expiry Date</label>
          <input 
            type="date" 
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-sm hl-mono"
          />
        </div>
      )}
      
      <button 
       onClick={() => {
         if (!form.name || !form.price) return toast.error('Name and Price are required')
         mutation.mutate({
           ...form,
           price: parseFloat(form.price) || 0,
           buyingPrice: parseFloat(form.buyingPrice) || 0,
           stock: parseInt(form.stock) || 0,
           isPerishable: form.isPerishable,
           expiryDate: form.expiryDate || undefined
         })
       }}
       disabled={mutation.isPending}
       className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-2xl shadow-emerald-900/20 flex items-center justify-center"
      >
        {mutation.isPending ? 'Saving...' : 'Save Inventory Item'}
      </button>
          <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Confirm Action"
        message="Are you sure you want to proceed? This action cannot be undone."
        confirmText="Confirm"
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
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
    stock: product.stockLevel?.toString() || '',
    imageUrl: product.imageUrl || '',
    isPerishable: !!product.isPerishable,
    expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
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
      <div className="flex flex-col items-center gap-4">
        <div 
          onClick={() => document.getElementById('image-edit-upload')?.click()}
          className="h-32 w-32 rounded-3xl bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group relative"
        >
          {form.imageUrl ? (
            <>
              <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <Plus className="text-white" size={32} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300 group-hover:text-emerald-500 transition-all">
              <Plus size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest">Upload Image</span>
            </div>
          )}
          <input 
            id="image-edit-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string })
                reader.readAsDataURL(file)
              }
            }}
          />
        </div>
        {form.imageUrl && (
          <button 
            type="button"
            onClick={() => setForm({ ...form, imageUrl: '' })}
            className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
          >
            Remove Image
          </button>
        )}
      </div>

      <InputGroup label="Product Name" placeholder="e.g. Fresh Milk" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />

      
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
        <select 
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold appearance-none text-sm"
        >
           {['Groceries', 'Bakery', 'Dairy', 'Hardware', 'Electronics', 'Clothing', 'Services', 'Other'].map(c => (
             <option key={c}>{c}</option>
           ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="Buying Price" placeholder="0.00" mono value={form.buyingPrice} onChange={(v: string) => setForm({ ...form, buyingPrice: v })} />
        <InputGroup label="Selling Price" placeholder="0.00" mono value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
      </div>
      <InputGroup label="Current Stock" placeholder="0" mono value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} />
      
      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <input 
          type="checkbox" 
          id="isPerishableEdit" 
          checked={form.isPerishable} 
          onChange={(e) => setForm({ ...form, isPerishable: e.target.checked })}
          className="h-4 w-4 accent-emerald-600 rounded border-slate-300"
        />
        <label htmlFor="isPerishableEdit" className="text-sm font-bold text-slate-700 cursor-pointer">This item is perishable</label>
      </div>

      {form.isPerishable && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expiry Date</label>
          <input 
            type="date" 
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-sm hl-mono"
          />
        </div>
      )}
      
      <button 
       onClick={() => {
         mutation.mutate({
           ...form,
           price: parseFloat(form.price) || 0,
           buyingPrice: parseFloat(form.buyingPrice) || 0,
           stock: parseInt(form.stock) || 0,
           isPerishable: form.isPerishable,
           expiryDate: form.expiryDate || undefined
         })
       }}
       disabled={mutation.isPending}
       className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-2xl shadow-emerald-900/20 flex items-center justify-center"
      >
        {mutation.isPending ? 'Updating...' : 'Update Product Details'}
      </button>
          <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Confirm Action"
        message="Are you sure you want to proceed? This action cannot be undone."
        confirmText="Confirm"
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
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
          <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Confirm Action"
        message="Are you sure you want to proceed? This action cannot be undone."
        confirmText="Confirm"
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
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
