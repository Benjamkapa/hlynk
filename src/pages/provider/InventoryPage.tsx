import { useState } from 'react'
import { Package, Plus, Search, Filter, AlertTriangle, Loader2, PackageX } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../../lib/api/providers'

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', search],
    queryFn: () => inventoryApi.list({ search })
  })

  const products = inventoryData?.data || []
  const stats = inventoryData?.stats || { totalItems: 0, lowStock: 0, totalValue: 0 }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0D1B12] font-nunito uppercase tracking-tight">Inventory Management</h1>
          <p className="text-sm text-[#8FA398] font-medium">Manage your products and supply levels</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#20C997] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#20C997]/20 hover:scale-105 transition-transform">
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <p className="text-[10px] font-black text-[#8FA398] uppercase tracking-widest mb-1">Total Products</p>
          <p className="text-2xl font-black text-[#0D1B12] font-saira">{stats.totalItems} Items</p>
        </div>
        <div className={`p-6 rounded-2xl border shadow-sm ${stats.lowStock > 0 ? 'bg-[#FEF2F2] border-[#FEE2E2]' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`flex items-center gap-2 mb-1 ${stats.lowStock > 0 ? 'text-[#EF4444]' : 'text-[#8FA398]'}`}>
            <AlertTriangle size={14} />
            <p className="text-[10px] font-black uppercase tracking-widest">Low Stock Alert</p>
          </div>
          <p className={`text-2xl font-black font-saira ${stats.lowStock > 0 ? 'text-[#EF4444]' : 'text-[#0D1B12]'}`}>
            {stats.lowStock} Items
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <p className="text-[10px] font-black text-[#8FA398] uppercase tracking-widest mb-1">Inventory Value</p>
          <p className="text-2xl font-black text-[#0D1B12] font-saira">KES {stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA398]" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#20C997]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 text-[#20C997] animate-spin" />
              <p className="text-sm font-bold text-[#8FA398] uppercase tracking-widest">Syncing inventory...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#F9FAFB] flex items-center justify-center text-[#8FA398] mb-4">
                <PackageX size={32} />
              </div>
              <h3 className="text-lg font-black text-[#0D1B12] font-nunito uppercase">Inventory is empty</h3>
              <p className="text-sm text-[#8FA398] max-w-xs mt-2">Add your products to start tracking stock levels and valuation.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Product Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#4A5E52]">
                          <Package size={14} />
                        </div>
                        <span className="font-bold text-sm text-[#0D1B12]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#8FA398] font-semibold">{p.category}</td>
                    <td className="px-6 py-4 font-black text-sm font-saira">{p.stock}</td>
                    <td className="px-6 py-4 font-bold text-sm font-saira text-[#20C997]">KES {p.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                        p.stock <= p.lowStockThreshold ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#20C997]/10 text-[#20C997]'
                      }`}>
                        {p.stock <= p.lowStockThreshold ? 'Low Stock' : 'In Stock'}
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
