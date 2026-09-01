import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Package, TrendingDown, Activity, AlertTriangle, LayoutGrid, List, Camera, FileText, Eye, Share2, ShoppingBag, Phone, MessageSquare, Check } from 'lucide-react'
import { CameraCapture } from '../../components/shared/CameraCapture'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { SlideOver } from '../../components/shared/SlideOver'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi, providersApi, requestsApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { getLocalDateString, formatLocalDate } from '../../lib/utils/date'
import { exportToCSV } from '../../lib/utils/export'
import FeatureGate from '../../components/shared/FeatureGate'

import { useEffect } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { PaginatedResponse } from '../../lib/types/api'
import { cacheInventory } from '../../lib/offline/db'

const PRESET_PRODUCT_PHOTOS = [
  { name: "Fresh Vegetables", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" },
  { name: "Groceries", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800" },
  { name: "Bakery / Bread", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800" },
  { name: "Coffee / Drinks", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800" },
  { name: "Juice / Smoothie", url: "https://images.unsplash.com/photo-1546173159-315724a31696?w=800" },
  { name: "Bottled Water", url: "https://images.unsplash.com/photo-1616118132534-381055b6a5cf?w=800" },
  { name: "Snacks / Chips", url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800" },
  { name: "Dairy / Milk", url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800" },
  { name: "Meat / Butchery", url: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800" },
  { name: "Electronics", url: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800" },
  { name: "Mobile Phone", url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800" },
  { name: "Laptop", url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800" },
  { name: "Clothing / Fashion", url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800" },
  { name: "Shoes / Footwear", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
  { name: "Beauty / Cosmetics", url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800" },
  { name: "Medicine / Pharmacy", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800" },
  { name: "Furniture", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800" },
  { name: "Hardware / Tools", url: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800" },
  { name: "Cleaning Products", url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800" },
  { name: "Stationery", url: "https://images.unsplash.com/photo-1527176930608-09cb256ab504?w=800" },
];

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
  const slug = profile?.data?.slug;
  const publicStoreUrl = slug ? `${window.location.origin}/store/${slug}` : null;

  const [isOrdersOpen, setIsOrdersOpen] = useState(false)

  const { data: requestsData, refetch: refetchRequests } = useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsApi.list(),
    refetchInterval: 10_000
  })

  const incomingOrders = requestsData?.requests || []
  const pendingOrdersCount = incomingOrders.filter((r: any) => r.status === 'PENDING').length

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await requestsApi.updateStatus(id, newStatus)
      toast.success(`Order status updated to ${newStatus}`)
      refetchRequests()
    } catch (err: any) {
      toast.error('Failed to update order status')
    }
  }

  const handleDeleteSingleOrder = async (id: string) => {
    try {
      await requestsApi.delete(id)
      toast.success('Order deleted')
      refetchRequests()
    } catch (err: any) {
      toast.error('Failed to delete order')
    }
  }

  const handleClearOrders = async (status: 'COMPLETED' | 'ALL') => {
    const confirmMsg = status === 'COMPLETED'
      ? 'Clear all completed and processed orders?'
      : 'Clear ALL client orders completely? This action cannot be undone.'
    if (!window.confirm(confirmMsg)) return
    try {
      await requestsApi.clear(status)
      toast.success(status === 'COMPLETED' ? 'Completed orders cleared' : 'All client orders cleared')
      refetchRequests()
    } catch (err: any) {
      toast.error('Failed to clear orders')
    }
  }

  const handleShareStore = () => {
    if (!publicStoreUrl) return toast.error('Your store link is not ready yet');
    navigator.clipboard.writeText(publicStoreUrl).then(() => {
      toast.success('Public store link copied to clipboard!', { description: publicStoreUrl });
    }).catch(() => {
      toast.info(`Your public store URL is: ${publicStoreUrl}`);
    });
  };

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
    <div className="space-y-8 pt-4">

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products & services</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track inventory, stock levels, and profit margins</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsOrdersOpen(true)}
            className="relative h-9 px-4 rounded-[.5rem] border border-gray-100 font-medium text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            title="View orders placed by clients via public link"
          >
            <ShoppingBag size={15} /> Orders
            {pendingOrdersCount > 0 && (
              <span className="bg-[#0D4A3E] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </button>
          {publicStoreUrl && (
            <a
              href={publicStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-4 rounded-[.5rem] border border-gray-100 font-medium text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              title="Preview your public store catalog"
            >
              <Eye size={15} /> Preview
            </a>
          )}
          <button
            onClick={handleShareStore}
            className="h-9 px-4 rounded-[.5rem] border border-gray-100 font-medium text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            title="Copy your store link to share with clients"
          >
            <Share2 size={15} /> Share
          </button>
          <button
            onClick={handleExport}
            className="h-9 px-4 rounded-[.5rem] border border-gray-100 font-medium text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={15} /> CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            title="Add Product"
            className="bg-[#0D4A3E] text-white h-9 px-5 rounded-[.5rem] font-medium text-sm hover:bg-[#0A3D33] transition-colors flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
          >
            <Plus size={16} /> Add item
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
        <SummaryCell title="Total items" value={stats.totalItems.toLocaleString()} sub="Unique SKUs" />
        <FeatureGate feature="low_stock_alerts" variant="tease">
          <SummaryCell title="Low stock" value={`${stats.lowStock}`} sub="Requires attention" tone={stats.lowStock > 0 ? 'red' : undefined} />
        </FeatureGate>
        <SummaryCell title="Stock value" value={`KES ${stats.totalValue.toLocaleString()}`} sub="Total inventory" />
        <SummaryCell title="Expiring soon" value={`${stats.expiringSoon || 0}`} sub="Within 30 days" tone={stats.expiringSoon > 0 ? 'amber' : undefined} />
      </div>

      {/* Products */}
      <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden">

        <SlideOver
          isOpen={isOrdersOpen}
          onClose={() => setIsOrdersOpen(false)}
          title={`Incoming client orders (${incomingOrders.length})`}
        >
          <div className="space-y-4">
            {incomingOrders.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 mb-2">
                <span className="text-xs text-gray-400">Order management</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleClearOrders('COMPLETED')}
                    className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-[.5rem] text-xs font-medium transition-colors"
                  >
                    Clear completed
                  </button>
                  <button
                    onClick={() => handleClearOrders('ALL')}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-[.5rem] text-xs font-medium transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {incomingOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingBag size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="font-medium text-sm">No incoming orders yet.</p>
                <p className="text-xs text-gray-400 mt-1">Share your store link with clients to start receiving orders.</p>
              </div>
            ) : (
              incomingOrders.map((req: any) => {
                let msgData: any = null;
                try { msgData = JSON.parse(req.message); } catch (_) {}

                const cleanPhone = (req.customerPhone || '').replace(/[^0-9]/g, '');

                return (
                  <div key={req.id} className="bg-gray-50 border border-gray-100 rounded-[.5rem] p-4 space-y-3 relative group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{req.customerName}</h4>
                        <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                          req.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                          req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {req.status}
                        </span>
                        <button
                          onClick={() => handleDeleteSingleOrder(req.id)}
                          title="Delete this order"
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-[.5rem] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Phone & contact */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${req.customerPhone}`}
                        className="px-3 py-1.5 bg-[#0D4A3E] text-white font-medium text-xs rounded-[.5rem] flex items-center gap-1.5 hover:bg-[#0A3D33] transition-colors"
                      >
                        <Phone size={13} /> Call {req.customerPhone}
                      </a>
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-green-600 text-white font-medium text-xs rounded-[.5rem] flex items-center gap-1.5 hover:bg-green-700 transition-colors"
                        >
                          <MessageSquare size={13} /> WhatsApp
                        </a>
                      )}
                    </div>

                    {/* Message details */}
                    {msgData && (
                      <div className="bg-white p-3 rounded-[.5rem] border border-gray-100 text-xs space-y-2">
                        {msgData.deliveryAddress && (
                          <p className="text-gray-600"><strong>Address/location:</strong> {msgData.deliveryAddress}</p>
                        )}
                        {msgData.notes && (
                          <p className="text-gray-600"><strong>Notes:</strong> {msgData.notes}</p>
                        )}
                        {msgData.items && Array.isArray(msgData.items) && (
                          <div>
                            <strong className="text-gray-700 block mb-1">Items ordered:</strong>
                            <ul className="divide-y divide-gray-100">
                              {msgData.items.map((it: any, idx: number) => (
                                <li key={idx} className="py-1 flex justify-between">
                                  <span>{it.quantity}x {it.name}</span>
                                  <span className="font-medium text-gray-800">KES {(it.price * it.quantity).toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {msgData.totalAmount && (
                          <div className="pt-2 border-t border-gray-100 flex justify-between font-semibold text-sm text-[#0D4A3E]">
                            <span>Total amount</span>
                            <span>KES {Number(msgData.totalAmount).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status actions */}
                    <div className="flex gap-2 pt-1">
                      {req.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(req.id, 'COMPLETED')}
                          className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 font-medium text-xs rounded-[.5rem] border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Check size={13} /> Mark completed
                        </button>
                      )}
                      {req.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(req.id, 'CONTACTED')}
                          className="flex-1 py-1.5 bg-blue-50 text-blue-700 font-medium text-xs rounded-[.5rem] border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                        >
                          Mark contacted
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SlideOver>

        <SlideOver
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add new product"
        >
          <ProductForm onClose={() => setIsAddModalOpen(false)} />
        </SlideOver>

        <SlideOver
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title="Edit product"
        >
          {editingProduct && <EditProductForm product={editingProduct} onClose={() => setEditingProduct(null)} />}
        </SlideOver>

        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-[.5rem] py-2.5 pl-9 pr-4 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-[.5rem] border border-gray-100 pr-2">
              <Filter className="ml-2 text-gray-300" size={14} />
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="hl-select !bg-transparent !border-none !py-0 !px-1 !pr-6 !h-auto !ring-0 text-xs font-medium text-gray-600 cursor-pointer"
              >
                <option value="">All categories</option>
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
                className={`p-1.5 rounded-[.4rem] transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[.4rem] transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <Th label="Product" active={sortBy === 'name'} order={sortOrder} onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }} />
                  <Th label="Category" active={sortBy === 'category'} order={sortOrder} onClick={() => { setSortBy('category'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }} />
                  <Th label="In stock" align="center" active={sortBy === 'stockLevel'} order={sortOrder} onClick={() => { setSortBy('stockLevel'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }} />
                  <Th label="Buying" align="right" active={sortBy === 'buyingPrice'} order={sortOrder} onClick={() => { setSortBy('buyingPrice'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }} />
                  <Th label="Selling" align="right" active={sortBy === 'price'} order={sortOrder} onClick={() => { setSortBy('price'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }} />
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-gray-400">Loading…</td>
                  </tr>
                ) : products.length > 0 ? products.map((p: any, i: number) => (
                  <tr key={p.id ?? i} className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setEditingProduct(p)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-[.5rem] object-cover border border-gray-100" />
                        ) : (
                          <div className="h-10 w-10 rounded-[.5rem] bg-gray-50 text-gray-400 flex items-center justify-center font-medium border border-gray-100 text-xs">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-900 text-sm block">{p.name}</span>
                          <span className="text-xs text-gray-400 hl-mono">SKU: {p.sku || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">{p.category}</span>
                        {p.isPerishable && p.type !== 'SERVICE' && (
                          <span className={`text-xs px-2 py-1 rounded-full ${p.expiryDate.split('T')[0] < getLocalDateString() ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            {p.expiryDate.split('T')[0] < getLocalDateString() ? 'Expired' : `Exp: ${formatLocalDate(p.expiryDate)}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-sm font-medium hl-mono ${p.stockLevel < threshold ? 'text-red-600' : 'text-gray-900'}`}>{p.stockLevel}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-400 text-sm hl-mono">KES {Number(p.buyingPrice || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-900 text-sm hl-mono">KES {Number(p.price).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingProduct(p) }}
                          className="p-1.5 rounded-[.5rem] text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id) }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-[.5rem] text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-gray-400">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {isLoading ? (
              <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {products.map((p: any) => (
                  <div
                    key={p.id}
                    className="group bg-white border border-gray-100 rounded-[.5rem] overflow-hidden hover:border-gray-200 transition-colors cursor-pointer relative"
                    onClick={() => setEditingProduct(p)}
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xl font-semibold text-gray-200">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingProduct(p) }}
                          className="h-7 w-7 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id) }}
                          className="h-7 w-7 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="mb-2">
                        <p className="text-[10px] text-gray-400 mb-0.5">{p.category}</p>
                        <h4 className="text-xs font-medium text-gray-900 leading-tight truncate">{p.name}</h4>
                      </div>
                      <div className="flex items-end justify-between">
                        <p className="text-xs font-semibold text-[#0D4A3E] hl-mono">KES {Number(p.price).toLocaleString()}</p>
                        <span className={`text-[10px] hl-mono ${p.stockLevel < threshold ? 'text-red-500' : 'text-gray-400'}`}>{p.stockLevel} in stock</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-gray-400">No products found.</div>
            )}
          </div>
        )}

        {productsData && productsData.pages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">
                Showing {products.length} of {productsData.total} items
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-9 px-3.5 bg-white border border-gray-100 rounded-[.5rem] text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <div className="h-9 px-3.5 flex items-center justify-center text-xs font-medium hl-mono text-gray-600 bg-gray-50 rounded-[.5rem]">
                  {page} / {productsData.pages}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(productsData.pages, p + 1))}
                  disabled={page === productsData.pages}
                  className="h-9 px-3.5 bg-white border border-gray-100 rounded-[.5rem] text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
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
        title="Delete product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
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
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${active ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
    >
      {label}{active && (order === 'asc' ? ' ↑' : ' ↓')}
    </th>
  )
}

// ─── Summary cell ───────────────────────────────────────────────────────────

function SummaryCell({ title, value, sub, tone }: { title: string; value: string; sub: string; tone?: 'red' | 'amber' }) {
  const toneColor = tone === 'red' ? 'text-red-600' : tone === 'amber' ? 'text-amber-600' : 'text-gray-900'
  return (
    <div className="bg-white p-6">
      <p className="text-xs text-gray-400 mb-2">{title}</p>
      <p className={`text-2xl font-semibold hl-mono tracking-tight ${toneColor}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
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
    <div className="space-y-5 pb-16">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-28 w-28 rounded-[.5rem] bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-300 transition-colors group relative"
        >
          {form.imageUrl ? (
            <>
              <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="text-white" size={28} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-gray-400 transition-colors">
              <Plus size={28} />
              <span className="text-xs">Upload image</span>
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
            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-[.5rem] text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-[.5rem] text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1.5"
          >
            <Camera size={14} />
            Camera
          </button>
          {form.imageUrl && (
            <button
              type="button"
              onClick={() => setForm({ ...form, imageUrl: '', file: null })}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-[.5rem] text-xs font-medium hover:bg-red-100 transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        {/* Stock photo presets */}
        <div className="w-full px-1">
          <p className="text-xs text-gray-400 mb-1.5">Or pick a stock photo:</p>
          <div className="flex flex-wrap gap-1">
            {PRESET_PRODUCT_PHOTOS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setForm({ ...form, imageUrl: p.url, file: null })}
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full border transition-colors ${
                  form.imageUrl === p.url
                    ? 'bg-[#0D4A3E] text-white border-[#0D4A3E]'
                    : 'bg-white hover:bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
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

      <InputGroup label="Product name" placeholder="e.g. Fresh Milk" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />

      <div className="space-y-1.5">
        <label className="text-xs text-gray-500">Category</label>
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
      <div className="space-y-1.5">
        <label className="text-xs text-gray-500">Product type</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm"
        >
          <option value="GOOD">Physical good (track stock)</option>
          <option value="SERVICE">Service (barber, consult, etc)</option>
        </select>
      </div>

      <div className={`grid ${form.type === 'GOOD' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {form.type === 'GOOD' && (
          <InputGroup label="Buying price" placeholder="0.00" mono value={form.buyingPrice} onChange={(v: string) => setForm({ ...form, buyingPrice: v })} />
        )}
        <InputGroup label="Selling price" placeholder="0.00" mono value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
      </div>

      {form.type === 'GOOD' && (
        <InputGroup label="Initial stock" placeholder="0" mono value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} />
      )}

      {form.type === 'GOOD' && (
        <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-[.5rem] border border-gray-100 mt-4">
          <input
            type="checkbox"
            id="isPerishableAdd"
            checked={form.isPerishable}
            onChange={(e) => setForm({ ...form, isPerishable: e.target.checked })}
            className="h-4 w-4 accent-[#0D4A3E] rounded border-gray-300"
          />
          <label htmlFor="isPerishableAdd" className="text-sm text-gray-700 cursor-pointer">This item is perishable</label>
        </div>
      )}

      {form.type === 'GOOD' && form.isPerishable && (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
          <label className="text-xs text-gray-500">Expiry date</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm hl-mono"
          />
        </div>
      )}

      <button
        onClick={() => {
          if (!form.name || !form.price) return toast.error('Name and price are required')
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
        className="w-full py-3.5 mt-4 bg-[#0D4A3E] text-white rounded-[.5rem] text-sm font-medium hover:bg-[#0A3D33] transition-colors"
      >
        {mutation.isPending ? 'Saving…' : 'Save inventory item'}
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
    expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : ''
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
    <div className="space-y-5 pb-16">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-28 w-28 rounded-[.5rem] bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-300 transition-colors group relative"
        >
          {form.imageUrl ? (
            <>
              <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="text-white" size={28} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-gray-400 transition-colors">
              <Plus size={28} />
              <span className="text-xs">Upload image</span>
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
            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-[.5rem] text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-[.5rem] text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1.5"
          >
            <Camera size={14} />
            Camera
          </button>
          {form.imageUrl && (
            <button
              type="button"
              onClick={() => setForm({ ...form, imageUrl: '', file: null })}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-[.5rem] text-xs font-medium hover:bg-red-100 transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        {/* Stock photo presets */}
        <div className="w-full px-1">
          <p className="text-xs text-gray-400 mb-1.5">Or pick a stock photo:</p>
          <div className="flex flex-wrap gap-1">
            {PRESET_PRODUCT_PHOTOS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setForm({ ...form, imageUrl: p.url, file: null })}
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full border transition-colors ${
                  form.imageUrl === p.url
                    ? 'bg-[#0D4A3E] text-white border-[#0D4A3E]'
                    : 'bg-white hover:bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
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

      <InputGroup label="Product name" placeholder="e.g. Fresh Milk" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />

      <div className="space-y-1.5">
        <label className="text-xs text-gray-500">Category</label>
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
      <div className="space-y-1.5">
        <label className="text-xs text-gray-500">Product type</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm"
        >
          <option value="GOOD">Physical good (track stock)</option>
          <option value="SERVICE">Service (barber, consult, etc)</option>
        </select>
      </div>

      <div className={`grid ${form.type === 'GOOD' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {form.type === 'GOOD' && (
          <InputGroup label="Buying price" placeholder="0.00" mono value={form.buyingPrice} onChange={(v: string) => setForm({ ...form, buyingPrice: v })} />
        )}
        <InputGroup label="Selling price" placeholder="0.00" mono value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
      </div>

      {form.type === 'GOOD' && (
        <InputGroup label="Current stock" placeholder="0" mono value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} />
      )}

      {form.type === 'GOOD' && (
        <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-[.5rem] border border-gray-100 mt-4">
          <input
            type="checkbox"
            id="isPerishableEdit"
            checked={form.isPerishable}
            onChange={(e) => setForm({ ...form, isPerishable: e.target.checked })}
            className="h-4 w-4 accent-[#0D4A3E] rounded border-gray-300"
          />
          <label htmlFor="isPerishableEdit" className="text-sm text-gray-700 cursor-pointer">This item is perishable</label>
        </div>
      )}

      {form.type === 'GOOD' && form.isPerishable && (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
          <label className="text-xs text-gray-500">Expiry date</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm hl-mono"
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
        className="w-full py-3.5 mt-4 bg-[#0D4A3E] text-white rounded-[.5rem] text-sm font-medium hover:bg-[#0A3D33] transition-colors"
      >
        {mutation.isPending ? 'Updating…' : 'Update product details'}
      </button>
    </div>
  )
}

function InputGroup({ label, placeholder, mono = false, value, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm ${mono ? 'hl-mono' : ''}`}
      />
    </div>
  )
}