import { useState } from 'react'
import { Plus, Search, Filter, Download, Edit, Trash2, Package, TrendingDown, Activity, AlertTriangle, LayoutGrid, List, Camera, FileText } from 'lucide-react'
import { CameraCapture } from '../../components/shared/CameraCapture'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { SlideOver } from '../../components/shared/SlideOver'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi, providersApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { exportToCSV } from '../../lib/utils/export'
import FeatureGate from '../../components/shared/FeatureGate'

import { useEffect } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { PaginatedResponse } from '../../lib/types/api'
import { cacheInventory } from '../../lib/offline/db'

export default function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [category, setCategory] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const queryClient = useQueryClient()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data: productsData, isLoading, error } = useQuery<PaginatedResponse<any> & { stats: any }>({
    queryKey: ['inventory', search, page, sortBy, sortOrder, category],
    queryFn: () => inventoryApi.list({ search, page, limit: 10, sortBy, sortOrder, category: category || undefined, includeStats: true }),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000
  })

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile
  })

  const threshold = profile?.data?.operationalSettings?.lowStockThreshold || 10;

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  // Sync with Offline DB for POS use
  useEffect(() => {
    if (productsData?.items && page === 1 && !search && !category) {
      cacheInventory(productsData.items).catch(err => console.error('Failed to update offline inventory:', err))
    }
  }, [productsData, page, search, category])

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
      setConfirmDeleteId(null)
    },
    onError: (err: any) => toast.error(getErrorMessage(err))
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">

      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Products & Services</h1>
          <p className="text-gray-500 font-medium">Track your inventory, stock levels, and profit margins</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-white text-gray-600 h-12 px-6 rounded-[.5rem] border border-gray-100 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <FileText size={18} />
            CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0D4A3E] text-white h-12 px-6 rounded-[.5rem] font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Product
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 grid-compact-cols md:grid-cols-4 gap-6">
        <SummaryCard title="Total Items" value={stats.totalItems.toLocaleString()} sub="Unique SKUs" icon={Package} variant="emerald" />
        <FeatureGate feature="low_stock_alerts" variant="tease">
          <SummaryCard title="Low Stock" value={`${stats.lowStock} ALERTS`} sub="Requires attention" icon={TrendingDown} variant="red" />
        </FeatureGate>
        <SummaryCard title="Stock Value" value={`KES ${stats.totalValue.toLocaleString()}`} sub="Total inventory" icon={Activity} variant="blue" />
        <SummaryCard title="Expiring Soon" value={`${stats.expiringSoon || 0} ITEMS`} sub="Within 30 days" icon={AlertTriangle} variant="amber" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-[.5rem] border border-gray-100 shadow-sm overflow-hidden">

        <SlideOver
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Product"
        >
          <ProductForm onClose={() => setIsAddModalOpen(false)} />
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
              className="w-full bg-gray-50 border-none rounded-[.5rem] py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-[.5rem] border border-gray-100 pr-2">
            <Filter className="ml-2 text-slate-400" size={14} />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="hl-select !bg-transparent !border-none !py-0 !px-1 !pr-6 !h-auto !ring-0 text-[10px] font-black tracking-widest text-slate-600 cursor-pointer"
            >
              <option value="">All Categories</option>
              {[
                'Accounting & Tax Services',
                'Agrovet',
                'Agricultural Cooperative',
                'Art & Craft Business',
                'Bakery',
                'Barber Shop',
                'Cafe',
                'Car Wash',
                'Car Yard',
                'Catering Services',
                'Church',
                'Clinic',
                'College',
                'Community Organization',
                'Construction Services',
                'Consultancy',
                'Cosmetics Shop',
                'Courier Services',
                'Cyber Cafe',
                'Cyber Security',
                'Dairy Business',
                'Daycare',
                'Dental Clinic',
                'Digital Agency',
                'Driving School',
                'E-commerce Business',
                'Electrical Services',
                'Electronics Shop',
                'Farm',
                'Fashion & Boutique',
                'Fast Food',
                'Financial Services',
                'Freelancer',
                'Furniture Workshop',
                'Garage',
                'Guest House',
                'Hardware Store',
                'Hospital',
                'Hotel',
                'Insurance Agency',
                'Interior Design',
                'Internet Service Provider',
                'IT Services',
                'Legal Services',
                'Lounge & Bar',
                'Manufacturing',
                'Marketing Agency',
                'Mechanic Garage',
                'Microfinance',
                'Mini Mart',
                'Mobile Phone Shop',
                'Mosque',
                'NGO',
                'Online Business',
                'Optical Clinic',
                'Other',
                'Pharmacy',
                'Plumbing Services',
                'Poultry Farm',
                'Printing & Branding',
                'Real Estate Agency',
                'Restaurant',
                'Retail Store',
                'SACCO',
                'Salon',
                'School',
                'Software Development',
                'Spa & Beauty',
                'Supermarket',
                'Tailoring & Fashion Design',
                'Training Centre',
                'Transport Services',
                'Travel Agency',
                'University',
                'Veterinary Clinic',
                'Welding & Fabrication',
                'Wholesale Shop'
              ].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-gray-50 p-1 rounded-[.5rem] border border-gray-100">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-[.4rem] transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-[.4rem] transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
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
                  <tr key={p.id ?? i} className="hover:bg-emerald-50/30 transition-all group cursor-pointer" onClick={() => setEditingProduct(p)}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-12 w-12 rounded-[.5rem] object-cover border border-slate-100 shadow-sm transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="h-12 w-12 rounded-[.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all text-[10px]">
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
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-[.5rem] uppercase tracking-widest">{p.category}</span>
                        {p.isPerishable && p.type !== 'SERVICE' && (
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-[.5rem] uppercase tracking-widest ${new Date(p.expiryDate) < new Date() ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            {new Date(p.expiryDate) < new Date() ? 'Expired' : `Exp: ${new Date(p.expiryDate).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`text-sm font-black hl-mono ${p.stockLevel < threshold ? 'text-red-600' : 'text-slate-900'}`}>{p.stockLevel}</span>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-slate-400 text-xs hl-mono">KES {Number(p.buyingPrice || 0).toLocaleString()}</td>
                    <td className="px-8 py-5 text-right font-black text-[#0D4A3E] text-sm hl-mono">KES {Number(p.price).toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingProduct(p) }}
                          className="p-2 hover:bg-white hover:shadow-lg rounded-[.5rem] transition-all text-slate-300 hover:text-emerald-600"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id) }}
                          disabled={deleteMutation.isPending}
                          className="p-2 hover:bg-white hover:shadow-lg rounded-[.5rem] transition-all text-slate-300 hover:text-red-600 disabled:opacity-50"
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
        ) : (
          <div className="p-8">
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {products.map((p: any) => (
                  <div
                    key={p.id}
                    className="group bg-white border border-gray-100 rounded-[.5rem] overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/10 transition-all cursor-pointer relative"
                    onClick={() => setEditingProduct(p)}
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xl font-black text-emerald-100">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingProduct(p) }}
                          className="h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id) }}
                          className="h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 translate-y-12 group-hover:translate-y-0 transition-all duration-300">
                        <div className="bg-white/90 backdrop-blur-md p-2 rounded-[.4rem] border border-white/20 shadow-xl">
                          <p className="text-[8px] font-black text-[#0D4A3E] hl-mono text-center">STOCK: {p.stockLevel}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="mb-2">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{p.category}</p>
                        <h4 className="text-[11px] font-black text-slate-900 leading-tight group-hover:text-[#0D4A3E] transition-colors truncate">{p.name}</h4>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[12px] font-black text-[#0D4A3E] hl-mono -mb-1">KES {Number(p.price).toLocaleString()}</p>
                        </div>
                        <div className={`h-1.5 w-1.5 rounded-full ${p.stockLevel < threshold ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No products found</div>
            )}
          </div>
        )}

        {productsData && productsData.pages > 1 && (
          <div className="p-6 bg-gray-50/30 border-t border-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {products.length} of {productsData.total} items
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-10 px-4 bg-white border border-slate-200 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  Previous
                </button>
                <div className="h-10 px-4 flex items-center justify-center font-black text-xs hl-mono text-emerald-600 bg-emerald-50 rounded-[.5rem]">
                  {page} / {productsData.pages}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(productsData.pages, p + 1))}
                  disabled={page === productsData.pages}
                  className="h-10 px-4 bg-white border border-slate-200 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ConfirmModal lives here, in the parent, where confirmDeleteId and deleteMutation are in scope */}
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

function ProductForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '', category: 'Groceries', buyingPrice: '', price: '', stock: '',
    imageUrl: '', file: null as File | null, isPerishable: false, expiryDate: '', type: 'GOOD'
  })
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Remove base64 image and file before sending to create
      const payload = { ...data };
      delete payload.file;
      if (data.file) delete payload.imageUrl;

      const res = await inventoryApi.create(payload);
      if (data.file && res.data?.id) {
        await inventoryApi.uploadImage(res.data.id, data.file);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-pos'] })
      toast.success('Product added to inventory')
      onClose()
    },
    onError: (err: any) => toast.error(getErrorMessage(err))
  })

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-32 w-32 rounded-[.5rem] bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group relative"
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
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string, file: file })
                reader.readAsDataURL(file)
              }
            }}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => document.getElementById('image-upload')?.click()}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2"
          >
            <Camera size={14} />
            Camera
          </button>
          {form.imageUrl && (
            <button
              type="button"
              onClick={() => setForm({ ...form, imageUrl: '', file: null })}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
            >
              Remove
            </button>
          )}
        </div>

        {isCameraOpen && (
          <CameraCapture
            onCapture={(file) => {
              const reader = new FileReader()
              reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string, file: file })
              reader.readAsDataURL(file)
            }}
            onClose={() => setIsCameraOpen(false)}
          />
        )}
      </div>

      <InputGroup label="Product Name" placeholder="e.g. Fresh Milk" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
        <input
          list="product-categories"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="e.g. Groceries"
          className="hl-select"
        />
        <datalist id="product-categories">
          {[
            'Accounting & Tax Services',
            'Agrovet',
            'Agricultural Cooperative',
            'Art & Craft Business',
            'Bakery',
            'Barber Shop',
            'Cafe',
            'Car Wash',
            'Car Yard',
            'Catering Services',
            'Church',
            'Clinic',
            'College',
            'Community Organization',
            'Construction Services',
            'Consultancy',
            'Cosmetics Shop',
            'Courier Services',
            'Cyber Cafe',
            'Cyber Security',
            'Dairy Business',
            'Daycare',
            'Dental Clinic',
            'Digital Agency',
            'Driving School',
            'E-commerce Business',
            'Electrical Services',
            'Electronics Shop',
            'Farm',
            'Fashion & Boutique',
            'Fast Food',
            'Financial Services',
            'Freelancer',
            'Furniture Workshop',
            'Garage',
            'Guest House',
            'Hardware Store',
            'Hospital',
            'Hotel',
            'Insurance Agency',
            'Interior Design',
            'Internet Service Provider',
            'IT Services',
            'Legal Services',
            'Lounge & Bar',
            'Manufacturing',
            'Marketing Agency',
            'Mechanic Garage',
            'Microfinance',
            'Mini Mart',
            'Mobile Phone Shop',
            'Mosque',
            'NGO',
            'Online Business',
            'Optical Clinic',
            'Other',
            'Pharmacy',
            'Plumbing Services',
            'Poultry Farm',
            'Printing & Branding',
            'Real Estate Agency',
            'Restaurant',
            'Retail Store',
            'SACCO',
            'Salon',
            'School',
            'Software Development',
            'Spa & Beauty',
            'Supermarket',
            'Tailoring & Fashion Design',
            'Training Centre',
            'Transport Services',
            'Travel Agency',
            'University',
            'Veterinary Clinic',
            'Welding & Fabrication',
            'Wholesale Shop'
          ]
            .map(c => (
              <option key={c} value={c} />
            ))}
        </datalist>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product Type</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full bg-slate-50 border-none rounded-[.5rem] py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold appearance-none text-sm"
        >
          <option value="GOOD">Physical Good (Track Stock)</option>
          <option value="SERVICE">Service (Barber, Consult, etc)</option>
        </select>
      </div>

      <div className={`grid ${form.type === 'GOOD' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {form.type === 'GOOD' && (
          <InputGroup label="Buying Price" placeholder="0.00" mono value={form.buyingPrice} onChange={(v: string) => setForm({ ...form, buyingPrice: v })} />
        )}
        <InputGroup label="Selling Price" placeholder="0.00" mono value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
      </div>

      {form.type === 'GOOD' && (
        <InputGroup label="Initial Stock" placeholder="0" mono value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} />
      )}

      {form.type === 'GOOD' && (
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-[.5rem] border border-slate-100 mt-4">
          <input
            type="checkbox"
            id="isPerishableAdd"
            checked={form.isPerishable}
            onChange={(e) => setForm({ ...form, isPerishable: e.target.checked })}
            className="h-4 w-4 accent-emerald-600 rounded border-slate-300"
          />
          <label htmlFor="isPerishableAdd" className="text-sm font-bold text-slate-700 cursor-pointer">This item is perishable</label>
        </div>
      )}

      {form.type === 'GOOD' && form.isPerishable && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expiry Date</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-[.5rem] py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-sm hl-mono"
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
        className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-[.5rem] font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-2xl shadow-emerald-900/20 flex items-center justify-center"
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
    type: product.type || 'GOOD',
    buyingPrice: product.buyingPrice?.toString() || '',
    price: product.price?.toString() || '',
    stock: product.stockLevel?.toString() || '',
    imageUrl: product.imageUrl || '',
    file: null as File | null,
    isPerishable: !!product.isPerishable,
    expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
  })
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data };
      delete payload.file;
      if (data.file) delete payload.imageUrl;

      const res = await inventoryApi.update(product.id, payload);
      if (data.file) {
        await inventoryApi.uploadImage(product.id, data.file);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-pos'] })
      toast.success('Product updated')
      onClose()
    },
    onError: (err: any) => toast.error(getErrorMessage(err))
  })

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-32 w-32 rounded-[.5rem] bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group relative"
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
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string, file: file })
                reader.readAsDataURL(file)
              }
            }}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => document.getElementById('image-edit-upload')?.click()}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2"
          >
            <Camera size={14} />
            Camera
          </button>
          {form.imageUrl && (
            <button
              type="button"
              onClick={() => setForm({ ...form, imageUrl: '', file: null })}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
            >
              Remove
            </button>
          )}
        </div>

        {isCameraOpen && (
          <CameraCapture
            onCapture={(file) => {
              const reader = new FileReader()
              reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string, file: file })
              reader.readAsDataURL(file)
            }}
            onClose={() => setIsCameraOpen(false)}
          />
        )}
      </div>

      <InputGroup label="Product Name" placeholder="e.g. Fresh Milk" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
        <input
          list="product-categories-edit"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="e.g. Groceries"
          className="hl-select"
        />
        <datalist id="product-categories-edit">
          {['Accounting & Tax Services', 'Agrovet', 'Agricultural Cooperative', 'Art & Craft Business', 'Bakery', 'Barber Shop', 'Cafe', 'Car Wash', 'Car Yard', 'Catering Services', 'Church', 'Clinic', 'College', 'Community Organization', 'Construction Services', 'Consultancy', 'Cosmetics Shop', 'Courier Services', 'Cyber Cafe', 'Cyber Security', 'Dairy Business', 'Daycare', 'Dental Clinic', 'Digital Agency', 'Driving School', 'E-commerce Business', 'Electrical Services', 'Electronics Shop', 'Farm', 'Fashion & Boutique', 'Fast Food', 'Financial Services', 'Freelancer', 'Furniture Workshop', 'Garage', 'Guest House', 'Hardware Store', 'Hospital', 'Hotel', 'Insurance Agency', 'Interior Design', 'Internet Service Provider', 'IT Services', 'Legal Services', 'Lounge & Bar', 'Manufacturing', 'Marketing Agency', 'Mechanic Garage', 'Microfinance', 'Mini Mart', 'Mobile Phone Shop', 'Mosque', 'NGO', 'Online Business', 'Optical Clinic', 'Other', 'Pharmacy', 'Plumbing Services', 'Poultry Farm', 'Printing & Branding', 'Real Estate Agency', 'Restaurant', 'Retail Store', 'SACCO', 'Salon', 'School', 'Software Development', 'Spa & Beauty', 'Supermarket', 'Tailoring & Fashion Design', 'Training Centre', 'Transport Services', 'Travel Agency', 'University', 'Veterinary Clinic', 'Welding & Fabrication', 'Wholesale Shop'].map(c => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product Type</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full bg-slate-50 border-none rounded-[.5rem] py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold appearance-none text-sm"
        >
          <option value="GOOD">Physical Good (Track Stock)</option>
          <option value="SERVICE">Service (Barber, Consult, etc)</option>
        </select>
      </div>

      <div className={`grid ${form.type === 'GOOD' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {form.type === 'GOOD' && (
          <InputGroup label="Buying Price" placeholder="0.00" mono value={form.buyingPrice} onChange={(v: string) => setForm({ ...form, buyingPrice: v })} />
        )}
        <InputGroup label="Selling Price" placeholder="0.00" mono value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
      </div>

      {form.type === 'GOOD' && (
        <InputGroup label="Current Stock" placeholder="0" mono value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} />
      )}

      {form.type === 'GOOD' && (
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-[.5rem] border border-slate-100 mt-4">
          <input
            type="checkbox"
            id="isPerishableEdit"
            checked={form.isPerishable}
            onChange={(e) => setForm({ ...form, isPerishable: e.target.checked })}
            className="h-4 w-4 accent-emerald-600 rounded border-slate-300"
          />
          <label htmlFor="isPerishableEdit" className="text-sm font-bold text-slate-700 cursor-pointer">This item is perishable</label>
        </div>
      )}

      {form.type === 'GOOD' && form.isPerishable && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expiry Date</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-[.5rem] py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-sm hl-mono"
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
        className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-[.5rem] font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-2xl shadow-emerald-900/20 flex items-center justify-center"
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
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="bg-white p-6 rounded-[.5rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
      <div className={`h-12 w-12 rounded-[.5rem] flex items-center justify-center shrink-0 ${variants[variant as keyof typeof variants]} group-hover:scale-110 transition-transform`}>
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
        className={`w-full bg-gray-50 border-none rounded-[.5rem] py-4 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold ${mono ? 'hl-mono text-[#0D4A3E]' : ''}`}
      />
    </div>
  )
}