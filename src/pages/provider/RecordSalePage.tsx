import { useState, useEffect } from 'react'
import { Search, Plus, Minus, Trash2, CreditCard, Wallet, Banknote, Zap, CheckCircle2, Package, Scan, ArrowRight, ShoppingCart, Loader2, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi, salesApi, paymentsApi, customersApi } from '../../lib/api/providers'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { getErrorMessage } from '../../lib/utils/error'
import { keepPreviousData } from '@tanstack/react-query'
import { PaginatedResponse } from '../../lib/types/api'

export default function RecordSalePage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [cart, setCart] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false)
  const queryClient = useQueryClient()

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery<PaginatedResponse<any>>({
    queryKey: ['inventory-pos', search, page],
    queryFn: () => inventoryApi.list({ search, page, limit: 12 }),
    placeholderData: keepPreviousData
  })

  useEffect(() => {
    if (productsError) toast.error(getErrorMessage(productsError))
  }, [productsError])

  // Reset to page 1 on search
  useEffect(() => {
    setPage(1)
  }, [search])

  const { data: customersData } = useQuery({
    queryKey: ['pos-customers', customerSearch],
    queryFn: () => customersApi.list({ search: customerSearch, limit: 10 }),
    enabled: customerSearch.length > 1
  })

  const selectedCustomer = customersData?.items?.find((c: any) => c.id === selectedCustomerId)

  const filteredProducts = productsData?.items || []

  const addToCart = (product: any) => {
    if (product.stockLevel <= 0) {
      toast.error(`${product.name} is out of stock`)
      return
    }
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      if (existing.quantity >= product.stockLevel) {
        toast.error(`Only ${product.stockLevel} units available`)
        return
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    toast.success(`Added ${product.name}`, { duration: 1000 })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta
        if (delta > 0 && newQty > item.stockLevel) {
          toast.error(`Only ${item.stockLevel} units available`)
          return item
        }
        if (newQty < 1) return item
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
  const discount = 0
  const total = subtotal - discount

  const handleCompleteSale = useMutation({
    mutationFn: () => salesApi.create({
      items: cart.map(i => ({
        productId: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      paymentMethod,
      totalAmount: total,
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || null
    }),
    onSuccess: (data: any) => {
      toast.success('Transaction Finalized', {
        description: `Receipt #${data.id?.slice(-6).toUpperCase()} issued successfully.`,
        icon: <CheckCircle2 className="text-emerald-500" />
      })
      setCart([])
      setMpesaPhone('')
      setSelectedCustomerId(null)
      setCustomerSearch('')
      queryClient.invalidateQueries({ queryKey: ['inventory-pos'] })
      queryClient.invalidateQueries({ queryKey: ['recent-sales'] })
      queryClient.invalidateQueries({ queryKey: ['provider-stats'] })
      queryClient.invalidateQueries({ queryKey: ['pos-customers'] })
    }
  })

  useEffect(() => {
    if (handleCompleteSale.error) toast.error(getErrorMessage(handleCompleteSale.error))
  }, [handleCompleteSale.error])

  const initiateMpesaPayment = async () => {
    if (!mpesaPhone || mpesaPhone.length < 10) {
      toast.error('Please enter a valid M-Pesa phone number')
      return
    }

    setIsProcessingMpesa(true)
    try {
      await paymentsApi.stkPush({
        phone: mpesaPhone,
        amount: total,
        reference: `SALE-${Date.now().toString().slice(-6)}`
      })

      toast.info('M-Pesa Prompt Sent', {
        description: 'Waiting for customer to enter PIN on their phone...',
      })

      handleCompleteSale.mutate()
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsProcessingMpesa(false)
    }
  }

  return (
    <div className="flex flex-col xl:flex-row gap-12 max-w-[1800px] mx-auto items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
      <style>{ADMIN_CSS}</style>

      {/* Left: Product Selection */}
      <div className="flex-1 space-y-10 min-w-0">
        {/* Sticky Header and Search */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md pt-4 pb-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Point of Sale</h1>
              <p className="text-slate-500 font-medium text-sm">Select items or scan barcode to add to cart</p>
            </div>
            <div className="flex items-center gap-3 self-stretch md:self-auto">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List size={20} />
                </button>
              </div>
              <button className="h-12 px-5 bg-white border border-slate-200 rounded-lg flex items-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                <Scan size={18} /> Barcode
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={24} />
            <input
              type="text"
              placeholder="Search by name, category, or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredProducts.length === 1) {
                  addToCart(filteredProducts[0])
                  setSearch('')
                }
              }}
              className="w-full bg-white border border-slate-200 shadow-xl shadow-slate-900/5 rounded-2xl py-5 pl-16 pr-8 text-lg font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Product Listing */}
        {productsLoading ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-black uppercase tracking-widest text-xs">Indexing Inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
              <Package size={40} className="opacity-20" />
            </div>
            <p className="font-black uppercase tracking-widest text-xs">No products found matching "{search}"</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative bg-white rounded-3xl cursor-pointer transition-all hover:shadow-2xl hover:shadow-emerald-900/20 overflow-hidden border border-slate-100 h-[380px]"
              >
                {/* Image Region */}
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <Package size={80} />
                  </div>
                )}

                {/* Stock Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${product.stockLevel <= 0 ? 'bg-red-600 text-white animate-pulse' : product.stockLevel < 10 ? 'bg-amber-500 text-white' : 'bg-white/90 backdrop-blur-md text-slate-900'}`}>
                    {product.stockLevel <= 0 ? 'Out of Stock' : `${product.stockLevel} in stock`}
                  </span>
                </div>

                {/* Faded Detail Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent pt-20">
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">{product.category}</p>
                  <h4 className="text-xl font-black text-white mb-2 line-clamp-1">{product.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-white hl-mono">KES {Number(product.price).toLocaleString()}</span>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <Plus size={24} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Price</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map(product => (
                  <tr
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="hover:bg-emerald-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-8 w-8 rounded-lg object-cover border border-slate-100" />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                            <Package size={14} />
                          </div>
                        )}
                        <span className="text-sm font-black text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black hl-mono ${product.stockLevel < 10 ? 'text-red-600' : 'text-slate-600'}`}>{product.stockLevel}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-black text-[#0D4A3E] hl-mono">KES {Number(product.price).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="inline-flex h-8 w-8 rounded-full bg-slate-100 text-slate-400 items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Plus size={16} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {productsData && productsData.pages > 1 && (
          <div className="flex justify-center items-center gap-6 py-12">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Page</span>
              <span className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white rounded-lg text-sm font-black hl-mono">{page}</span>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">of {productsData.pages}</span>
            </div>
            <button
              disabled={page === productsData.pages}
              onClick={() => setPage(p => Math.min(productsData.pages, p + 1))}
              className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Right: Cart & Payment (Sticky) */}
      <div className="w-full xl:w-[500px] flex flex-col gap-8 sticky top-8">
        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 flex-1 flex flex-col min-h-[500px] max-h-[calc(100vh-200px)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Cart Summary</h3>
            <span className="bg-[#0D4A3E] text-white px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest hl-mono shadow-lg shadow-emerald-900/20">
              {cart.length} ITEMS
            </span>
          </div>

          {/* Customer Selection */}
          <div className="mb-6 relative z-10">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Customer Association</label>
            {!selectedCustomerId ? (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search existing customer..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 text-xs font-bold"
                />
                {customerSearch.length > 1 && customersData?.items && customersData.items.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden divide-y divide-slate-50">
                    {customersData.items.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomerId(c.id)
                          setCustomerSearch('')
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-all flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-black text-slate-900">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{c.phone}</p>
                        </div>
                        <Plus size={14} className="text-emerald-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
                    {selectedCustomer?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{selectedCustomer?.name || 'Loading...'}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Linked</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="h-8 w-8 rounded-lg hover:bg-white hover:text-red-500 text-slate-400 transition-all flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar relative z-10">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 py-20">
                <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <ShoppingCart size={48} className="opacity-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 transition-all group">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-black text-slate-900 truncate">{item.name}</h5>
                    <p className="text-[10px] text-slate-400 font-bold hl-mono uppercase tracking-widest mt-0.5">KES {Number(item.price).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-black w-5 text-center hl-mono text-slate-900">{item.quantity}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} className="h-8 w-8 rounded-lg text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-5 pt-8 border-t-2 border-dashed border-slate-100 relative z-10">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
              <span className="text-sm font-black text-slate-900 hl-mono">KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-[#0D4A3E] rounded-2xl text-white shadow-2xl shadow-emerald-900/20">
              <span className="text-xs font-black uppercase tracking-widest opacity-80">Payable</span>
              <span className="text-3xl font-black hl-mono tracking-tighter">KES {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="absolute top-0 right-0 h-64 w-64 bg-slate-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
        </div>

        {/* Payment & Action */}
        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'CASH', label: 'Cash', icon: Banknote },
              { id: 'MPESA', label: 'M-Pesa', icon: Wallet },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex items-center justify-center gap-3 py-5 rounded-2xl border-2 transition-all ${paymentMethod === method.id
                  ? 'border-[#0D4A3E] bg-emerald-50/50 text-[#0D4A3E] shadow-lg shadow-emerald-900/5'
                  : 'border-slate-50 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
              >
                <method.icon size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
              </button>
            ))}
          </div>

          {paymentMethod === 'MPESA' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                placeholder="M-Pesa Phone (07...)"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all hl-mono"
              />
            </div>
          )}

          <button
            disabled={cart.length === 0 || handleCompleteSale.isPending || isProcessingMpesa}
            onClick={() => paymentMethod === 'MPESA' ? initiateMpesaPayment() : handleCompleteSale.mutate()}
            className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-4 ${cart.length === 0 || handleCompleteSale.isPending || isProcessingMpesa
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20 active:scale-[0.98]'
              }`}
          >
            {handleCompleteSale.isPending || isProcessingMpesa ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {paymentMethod === 'MPESA' ? 'Send STK Prompt' : 'Complete Sale'} <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
