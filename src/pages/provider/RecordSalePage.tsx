import { useState, useEffect } from 'react'
import { Search, Plus, Minus, Trash2, CreditCard, Wallet, Banknote, Zap, CheckCircle2, Package, Scan, ArrowRight, ShoppingCart, Loader2, LayoutGrid, List, ChevronLeft, ChevronRight, Lock, Smartphone, AlertTriangle, RefreshCcw, Wifi, X } from 'lucide-react'

const KcbBankIcon = ({ className, size = 64 }: { className?: string, size?: number }) => (
  <img src="https://buni.kcbgroup.com/_nuxt/logo.71b8fc4b.svg" alt="KCB" style={{ width: size, height: size }} className={`${className || ''} object-contain shrink-0`} />
);

const MpesaBankIcon = ({ className, size = 64 }: { className?: string, size?: number }) => (
  <img src="https://monisnapcontent.kinsta.cloud/wp-content/uploads/2021/09/M-PESA_LOGO-640x467.png?v=1632335437" alt="M-Pesa" style={{ width: size, height: size }} className={`${className || ''} object-contain shrink-0 pt-2`} />
);
import FeatureGate, { FEATURE_PLANS } from '../../components/shared/FeatureGate'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi, salesApi, paymentsApi, customersApi, providersApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { keepPreviousData } from '@tanstack/react-query'
import { useAuth } from '../../lib/auth/AuthContext'
import { PaginatedResponse } from '../../lib/types/api'
import { useOfflineStatus } from '../../lib/offline/useOfflineStatus'
import { enqueueSale, cacheInventory, getCachedInventory, cacheCustomers, getCachedCustomers } from '../../lib/offline/db'

export default function RecordSalePage() {
  const { user } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile
  })
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem('hlynk_pos_cart')
    return saved ? JSON.parse(saved) : []
  })
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerSearchInput, setCustomerSearchInput] = useState('')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false)
  const [waitingMpesaSaleId, setWaitingMpesaSaleId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products')
  const { isOnline, pendingCount } = useOfflineStatus()
  const queryClient = useQueryClient()

  // Debounce searches
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const timer = setTimeout(() => setCustomerSearch(customerSearchInput), 300)
    return () => clearTimeout(timer)
  }, [customerSearchInput])

  // Persist cart
  useEffect(() => {
    localStorage.setItem('hlynk_pos_cart', JSON.stringify(cart))
  }, [cart])

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery<PaginatedResponse<any>>({
    queryKey: ['inventory-pos', search, page],
    queryFn: async () => {
      if (!isOnline) {
        console.log('[POS] Offline: Loading inventory from IndexedDB')
        const cached = await getCachedInventory()
        // Simple client-side search if offline
        const filtered = search
          ? cached.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
          : cached

        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pages: 1
        }
      }

      const res = await inventoryApi.list({ search, page, limit: 100 })

      // Background cache if it was a broad search (page 1, no search or just a few chars)
      if (res.items && page === 1 && !search) {
        cacheInventory(res.items).catch(err => console.error('Failed to cache inventory:', err))
      }

      return res
    },
    placeholderData: keepPreviousData,
    staleTime: isOnline ? 30000 : Infinity
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
    queryFn: async () => {
      if (!isOnline) {
        const cached = await getCachedCustomers()
        const filtered = customerSearch
          ? cached.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch))
          : cached
        return { items: filtered.slice(0, 10), total: filtered.length }
      }

      const res = await customersApi.list({ search: customerSearch, limit: 10 })

      // Cache customers in background if we fetched them
      if (res.items && !customerSearch) {
        cacheCustomers(res.items).catch(err => console.error('Failed to cache customers:', err))
      }

      return res
    },
    enabled: isOnline ? customerSearch.length > 1 : true
  })

  const selectedCustomer = customersData?.items?.find((c: any) => c.id === selectedCustomerId)

  const filteredProducts = productsData?.items || []

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id)
    const currentQty = existing ? existing.quantity : 0
    const isService = product.type === 'SERVICE'

    if (!isService && currentQty >= product.stockLevel) {
      toast.error(product.stockLevel <= 0 ? `${product.name} is out of stock` : `Only ${product.stockLevel} units available`)
      return
    }
    if (existing) {
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
        const isService = item.type === 'SERVICE'
        if (delta > 0 && !isService && newQty > item.stockLevel) {
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
    mutationFn: (args?: { status?: string | number, mpesaRequestId?: string }) => salesApi.create({
      items: cart.map(i => ({
        productId: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      paymentMethod,
      totalAmount: total,
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || null,
      customerPhone: mpesaPhone || undefined,
      status: args?.status !== undefined ? args.status : 0,
      mpesaRequestId: args?.mpesaRequestId
    }),
    onSuccess: (data: any, variables: any) => {
      const saleId = data.data?.saleId || data.data?.sale?.id || data.data?.id || data.id;
      // console.log('[MUTATION SUCCESS] Got saleId:', saleId);

      if (variables?.status === 2) {
        if (saleId) {
          setWaitingMpesaSaleId(saleId)
        } else {
          console.error('[MUTATION ERROR] No saleId found in response:', data);
        }
        setTimeout(() => {
          setWaitingMpesaSaleId((prev) => {
            if (prev === saleId) {
              setIsProcessingMpesa(false)
              toast.error('Transaction Timed Out', {
                description: 'No response received from M-Pesa. Please check if the customer received the prompt.'
              })
              return null
            }
            return prev
          })
        }, 130000)
      } else {
        toast.success('Transaction Finalized', {
          description: `Receipt #${saleId?.slice(-6)?.toUpperCase() || 'issued'} successfully.`,
          icon: <CheckCircle2 className="text-emerald-500" />
        })
        setCart([])
        localStorage.removeItem('hlynk_pos_cart')
        setMpesaPhone('')
        setPaymentMethod('CASH')
        setSelectedCustomerId(null)
        setCustomerSearch('')
        queryClient.invalidateQueries({ queryKey: ['inventory-pos'] })
        queryClient.invalidateQueries({ queryKey: ['inventory'] })
        queryClient.invalidateQueries({ queryKey: ['recent-sales'] })
        queryClient.invalidateQueries({ queryKey: ['provider-stats'] })
        queryClient.invalidateQueries({ queryKey: ['pos-customers'] })
      }
    }
  })

  useEffect(() => {
    if (handleCompleteSale.error) {
      const errorMsg = getErrorMessage(handleCompleteSale.error)

      // If it's a network error and we are offline, it's already handled or should be
      if (!navigator.onLine) {
        // Silently consume or handle differently
      } else {
        toast.error(errorMsg)
      }
    }
  }, [handleCompleteSale.error])

  const handleOfflineSale = async () => {
    const salePayload = {
      items: cart.map(i => ({
        productId: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      paymentMethod,
      totalAmount: total,
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || null,
      customerPhone: mpesaPhone || undefined,
      status: 0, // Recorded as cash/completed offline
    }

    const offlineId = crypto.randomUUID()

    await enqueueSale({
      id: offlineId,
      createdAt: Date.now(),
      payload: salePayload,
      retries: 0
    })

    toast.success('Sale Recorded Offline', {
      description: 'Transaction queued and will sync automatically once you are back online.',
      icon: <RefreshCcw className="text-amber-500 animate-spin-slow" />
    })

    // Reset UI
    setCart([])
    localStorage.removeItem('hlynk_pos_cart')
    setMpesaPhone('')
    setPaymentMethod('CASH')
    setSelectedCustomerId(null)
    setCustomerSearch('')
  }

  useEffect(() => {
    let timeout: any;
    if (waitingMpesaSaleId && isProcessingMpesa) {
      timeout = setTimeout(() => {
        setWaitingMpesaSaleId(null);
        setIsProcessingMpesa(false);
        toast.error('Payment polling timed out. Please check the transaction status in Sales History.');
      }, 60000); // 60s safety cutoff
    }
    return () => clearTimeout(timeout);
  }, [waitingMpesaSaleId, isProcessingMpesa]);

  const { data: pendingSaleData } = useQuery({
    queryKey: ['sale-details', waitingMpesaSaleId],
    queryFn: () => {
      return salesApi.getDetails(waitingMpesaSaleId!);
    },
    enabled: !!waitingMpesaSaleId,
    refetchInterval: (query) => {
      const sale = query.state.data?.data;
      // Stop on all terminal states: 0 (Paid), 1 (Failed), 3 (Cancelled), 4 (Error)
      if (sale && [0, 1, 3, 4].includes(sale.status)) {
        return false;
      }
      return 2000;
    },
    refetchIntervalInBackground: true,
    staleTime: 0,
    retry: 3
  })

  useEffect(() => {
    if (waitingMpesaSaleId && pendingSaleData?.data) {
      const sale = pendingSaleData.data;
      // console.log('[POLLING] Current Sale Status:', sale.status);

      if ([0, 1, 3, 4].includes(sale.status)) {
        const status = sale.status;
        setWaitingMpesaSaleId(null)
        setIsProcessingMpesa(false)

        if (status === 0) {
          toast.success('Transaction Finalized', {
            description: `M-Pesa payment received. Receipt #${sale.id?.slice(-6).toUpperCase()} issued.`,
            icon: <CheckCircle2 className="text-emerald-500" />
          })
          setCart([])
          localStorage.removeItem('hlynk_pos_cart')
          setMpesaPhone('')
          setPaymentMethod('CASH')
          setSelectedCustomerId(null)
          setCustomerSearch('')
          queryClient.invalidateQueries({ queryKey: ['inventory-pos'] })
          queryClient.invalidateQueries({ queryKey: ['inventory'] })
          queryClient.invalidateQueries({ queryKey: ['recent-sales'] })
          queryClient.invalidateQueries({ queryKey: ['provider-stats'] })
          queryClient.invalidateQueries({ queryKey: ['pos-customers'] })
        } else {
          const isCancelled = status === 3;
          toast.error(isCancelled ? 'Transaction Cancelled' : 'Payment Failed', {
            description: isCancelled
              ? 'The customer cancelled the request on their phone.'
              : sale.message || 'M-Pesa could not process the payment at this time.',
            icon: <AlertTriangle className="text-red-500" />
          })
        }
      }
    }
  }, [pendingSaleData, waitingMpesaSaleId, queryClient])

  const initiateMpesaPayment = async () => {
    if (!mpesaPhone || mpesaPhone.length < 10) {
      toast.error('Please enter a valid M-Pesa phone number')
      return
    }

    setIsProcessingMpesa(true)
    try {
      toast.info('M-Pesa Prompt Sent', {
        description: 'Waiting for customer to enter PIN on their phone...',
      })

      const res = await salesApi.vendorMpesaPush({
        phone: mpesaPhone,
        amount: total,
        reference: `SALE-${Date.now().toString().slice(-6)}`
      })

      handleCompleteSale.mutate({ status: 2, mpesaRequestId: res?.data?.CheckoutRequestID || res?.CheckoutRequestID })
    } catch (err: any) {
      toast.error(getErrorMessage(err))
      setIsProcessingMpesa(false)
    }
  }

  const initiateKcbPayment = async () => {
    if (!mpesaPhone || mpesaPhone.length < 10) {
      toast.error('Please enter a valid phone number for KCB STK Push')
      return
    }

    setIsProcessingMpesa(true)
    try {
      toast.info('KCB STK Prompt Sent', {
        description: 'Waiting for customer to enter PIN...',
      })

      const res = await salesApi.vendorKcbPush({
        phone: mpesaPhone,
        amount: total,
        reference: `KCB-${Date.now().toString().slice(-6)}`
      })

      // KCB Buni UAT wraps ids in a "response" object
      const checkoutId = res?.data?.response?.CheckoutRequestID 
        || res?.data?.CheckoutRequestID 
        || res?.CheckoutRequestID;

      handleCompleteSale.mutate({ status: 2, mpesaRequestId: checkoutId })
    } catch (err: any) {
      toast.error(getErrorMessage(err))
      setIsProcessingMpesa(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-100px)] pb-32 xl:pb-0">
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-12 mx-auto items-start animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Left: Product Selection */}
        <div className={`flex-1 space-y-6 md:space-y-10 min-w-0 w-full ${activeTab === 'cart' ? 'hidden xl:block' : 'block'}`}>
          {/* Sticky Header and Search */}

          <div className="sticky top-0 z-30 backdrop-blur-md py-2 rounded-l-full rounded-r-[5rem]">
            <div className="flex items-center justify-between px-2 w-full">

              {/* Search wrapper — constrained width, not full stretch */}
              <div className="relative group w-64 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredProducts.length === 1) {
                      addToCart(filteredProducts[0])
                      setSearchInput('')
                      setSearch('')
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 shadow-sm rounded-full py-1.5 pl-9 pr-4 text-sm font-normal focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Grid/List toggle — on the far right */}
              <div className="flex bg-slate-100 p-1 shrink-0 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List size={15} />
                </button>
              </div>

            </div>
          </div>

          {/* Product Listing */}
          {productsLoading ? (
            <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-4">
              <Loader2 className="animate-spin" size={48} />
              <p className="font-black uppercase tracking-widest text-xs">Indexing Inventory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-6 bg-slate-50 rounded-[.5rem] border-2 border-dashed border-slate-200">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                <Package size={40} className="opacity-20" />
              </div>
              <p className="font-black uppercase tracking-widest text-xs">No products found matching</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {filteredProducts.map(product => {
                const cartQty = cart.find(i => i.id === product.id)?.quantity || 0;
                const availableStock = product.stockLevel - cartQty;
                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group relative bg-white rounded-[.5rem] md:rounded-[.5rem] cursor-pointer transition-all hover:shadow-2xl hover:shadow-emerald-900/20 overflow-hidden border border-slate-100 h-[240px] md:h-[380px]"
                  >
                    {/* Image Region */}
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <Package size={80} />
                      </div>
                    )}

                    {/* Stock/Service Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      {product.type === 'SERVICE' ? (
                        <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Service
                        </span>
                      ) : (
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${availableStock <= 0 ? 'bg-red-600 text-white animate-pulse' : availableStock < 10 ? 'bg-amber-500 text-white' : 'bg-white/90 backdrop-blur-md text-slate-900'}`}>
                          {availableStock <= 0 ? 'Out of Stock' : `${availableStock} in stock`}
                        </span>
                      )}
                    </div>

                    {/* Faded Detail Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent pt-12 md:pt-20">
                      <p className="text-[8px] md:text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-0.5 md:mb-1">{product.category}</p>
                      <h4 className="text-sm md:text-xl font-black text-white mb-1 md:mb-2 line-clamp-1">{product.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm md:text-2xl font-black text-white hl-mono">KES {Number(product.price).toLocaleString()}</span>
                        <div className="h-8 w-8 md:h-12 md:w-12 rounded-[.5rem] md:rounded-[.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 opacity-0 md:group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                          <Plus size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden">
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
                  {filteredProducts.map(product => {
                    const cartQty = cart.find(i => i.id === product.id)?.quantity || 0;
                    const availableStock = product.stockLevel - cartQty;
                    return (
                      <tr
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="hover:bg-emerald-50/30 cursor-pointer transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="h-8 w-8 rounded-[.5rem] object-cover border border-slate-100" />
                            ) : (
                              <div className="h-8 w-8 rounded-[.5rem] bg-slate-50 flex items-center justify-center text-slate-300">
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
                          {product.type === 'SERVICE' ? (
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Service</span>
                          ) : (
                            <span className={`text-[10px] font-black hl-mono ${availableStock < 10 ? 'text-red-600' : 'text-slate-600'}`}>{availableStock}</span>
                          )}
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
                    )
                  })}
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
                className="h-12 w-12 rounded-[.5rem] bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Page</span>
                <span className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white rounded-[.5rem] text-sm font-black hl-mono">{page}</span>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">of {productsData.pages}</span>
              </div>
              <button
                disabled={page === productsData.pages}
                onClick={() => setPage(p => Math.min(productsData.pages, p + 1))}
                className="h-12 w-12 rounded-[.5rem] bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Cart & Payment (Sticky) */}
        <div className={`w-full xl:w-[450px] flex flex-col gap-6 lg:gap-8 sticky top-8 ${activeTab === 'products' ? 'hidden xl:flex' : 'flex'}`}>
          {/* Back button for mobile cart view */}
          <button
            onClick={() => setActiveTab('products')}
            className="xl:hidden flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2"
          >
            <ChevronLeft size={16} /> Back to Products
          </button>
          <div className="bg-white p-10 rounded-[.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 flex-1 flex flex-col min-h-[500px] max-h-[calc(100vh-200px)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Cart Summary</h3>
              <span className="bg-[#0D4A3E] text-white px-4 py-1.5 rounded-[.5rem] text-[11px] font-black uppercase tracking-widest hl-mono shadow-lg shadow-emerald-900/20">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} ITEMS
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
                    placeholder="Search customers..."
                    value={customerSearchInput}
                    onChange={(e) => setCustomerSearchInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-[.5rem] py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  {customerSearchInput.length > 1 && customersData?.items && customersData.items.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[.5rem] shadow-2xl border border-slate-100 z-50 overflow-hidden divide-y divide-slate-50">
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
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-[.5rem]">
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
                    className="h-8 w-8 rounded-[.5rem] hover:bg-white hover:text-red-500 text-slate-400 transition-all flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar relative z-10">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-200 py-20">
                  <div className="h-24 w-24 rounded-full bg-slate-20 flex items-center justify-center mb-6">
                    <ShoppingCart size={48} className="opacity-90" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-[.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 transition-all group">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-black text-slate-900 truncate">{item.name}</h5>
                      <p className="text-[10px] text-slate-400 font-bold hl-mono uppercase tracking-widest mt-0.5">KES {Number(item.price).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="h-8 w-8 rounded-[.5rem] bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-black w-5 text-center hl-mono text-slate-900">{item.quantity}</span>
                      <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="h-8 w-8 rounded-[.5rem] bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} className="h-8 w-8 rounded-[.5rem] text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center border border-transparent hover:border-red-100">
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
              <div className="flex justify-between items-center p-6 bg-[#0D4A3E] rounded-[.5rem] text-white shadow-2xl shadow-emerald-900/20">
                <span className="text-xs font-black uppercase tracking-widest opacity-80">Payable</span>
                <span className="text-3xl font-black hl-mono tracking-tighter">KES {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="absolute top-0 right-0 h-64 w-64 bg-slate-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
          </div>

          {/* Payment & Action */}
          <div className="bg-white p-1 rounded-[.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 space-y-5">
            <div className="grid grid-cols-2 gap-1">
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote, feature: null },
                { id: 'MPESA', label: 'Express', icon: MpesaBankIcon, feature: 'mpesa_stk'  },
                { id: 'KCB', label: 'Mobile', icon: KcbBankIcon, feature: 'kcb_settlement' },
                { id: 'MPESA_MANUAL', label: 'M-Pesa [Pochi/Till]', icon: Wallet, feature: null },
              ].map(method => (
                <FeatureGate
                  key={method.id}
                  feature={method.feature as any}
                  fallback={
                    method.feature ? (
                      <button
                        onClick={() => toast.info(`${method.label} requires the Growth Plan. Please upgrade to unlock.`)}
                        className="relative group flex flex-col items-center justify-center gap-2 py-5 rounded-[.5rem] border-2 border-slate-50 bg-slate-50/50 text-slate-300 cursor-not-allowed overflow-hidden"
                      >
                        <div className="flex items-center gap-3">
                          <method.icon size={['MPESA', 'KCB'].includes(method.id) ? 64 : 20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                        </div>
                        <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          Requires {(FEATURE_PLANS as any)[method.feature as string][0]}
                        </span>
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                          <Lock size={12} />
                        </div>
                      </button>
                    ) : null
                  }
                >
                  <button
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center justify-center gap-3 py-1 rounded-[.5rem] border-2 transition-all ${paymentMethod === method.id
                      ? 'border-[#0D4A3E] bg-emerald-50/50 text-[#0D4A3E] shadow-lg shadow-emerald-900/5'
                      : 'border-slate-50 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      }`}
                  >
                    <method.icon size={['MPESA', 'KCB'].includes(method.id) ? 64 : 20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                  </button>
                </FeatureGate>
              ))}
            </div>


            {paymentMethod === 'MPESA_MANUAL' && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-emerald-50 border border-emerald-100 rounded-[.5rem] p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-900 uppercase tracking-tight">Manual M-Pesa Mode</p>
                      <p className="text-[10px] text-emerald-700 font-medium leading-tight">Accept payment via Pochi, Personal # or Till, then record here.</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-emerald-200/50">
                    <div className="bg-white/50 p-3 rounded-lg border border-emerald-200">
                      <p className="text-[10px] font-medium text-emerald-800 text-center italic">
                        {profile?.data?.operationalSettings?.manualMpesa?.instructions || `"Ask the client to pay to your Till or Pochi number, then confirm you have received the SMS before completing."`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-[.5rem] p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Recording as</p>
                  <p className="text-sm font-black text-slate-900">M-Pesa Transaction</p>
                </div>
              </div>
            )}

            {paymentMethod === 'MPESA' && (
              isOnline ? (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-[.5rem] p-4 flex items-center gap-4">
                    <MpesaBankIcon size={20} className="text-[#0D4A3E]" />
                    <p className="text-[10px] font-medium text-emerald-800 leading-tight">
                      STK Push will be sent to the customer's phone for instant verification.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Customer M-Pesa Number</label>
                    <input
                      type="text"
                      placeholder="07..."
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[.5rem] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all hl-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-amber-50 border border-amber-100 rounded-[.5rem] p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Wifi size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Manual M-Pesa Mode</p>
                        <p className="text-[10px] text-amber-700 font-medium leading-tight">Accept payment via Pochi la Biashara or Paybill, then record here.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {paymentMethod === 'KCB' && isOnline && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-indigo-50 border border-indigo-100 rounded-[.5rem] p-4 flex items-center gap-4">
                  <KcbBankIcon size={20} />
                  <p className="text-[10px] font-medium text-indigo-800 leading-tight">
                    KCB Mobile STK Push will be sent to the customer for direct settlement.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Customer Phone Number</label>
                  <input
                    type="text"
                    placeholder="254..."
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="w-full bg-indigo-50/20 border border-indigo-100 rounded-[.5rem] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all hl-mono"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="bg-amber-50 border border-amber-100 rounded-[.5rem] p-4 flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                <Banknote size={20} className="text-amber-700" />
                <p className="text-[10px] font-medium text-amber-800 leading-tight">
                  Recording as Cash. Ensure you have received the funds physically before completing.
                </p>
              </div>
            )}

            {isProcessingMpesa && (
              <div className="bg-slate-900 rounded-[.5rem] p-8 text-white space-y-6 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                {/* <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <Loader2 className="animate-spin text-emerald-400" size={24} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Waiting for PIN...</p>
                      <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Reference: {waitingMpesaSaleId?.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setWaitingMpesaSaleId(null);
                      setIsProcessingMpesa(false);
                      toast.info("Payment Aborted", { description: "The system stopped watching for the payment. You can check it later in Sales History." });
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Stop Polling"
                  >
                    <X size={16} />
                  </button>
                </div> */}

                {/* <div className="space-y-4 relative z-10">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A prompt has been sent to <span className="text-white font-black">{mpesaPhone}</span>. 
                    Please ensure the customer enters their PIN.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['sale-details', waitingMpesaSaleId] })}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCcw size={12} /> Sync Status Manually
                    </button>
                  </div>
                </div> */}

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 animate-progress origin-left w-full" />
                <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-[50px] -mr-16 -mt-16" />
              </div>
            )}

            <button
              disabled={cart.length === 0 || handleCompleteSale.isPending || isProcessingMpesa}
              onClick={() => {
                if (paymentMethod === 'MPESA' && isOnline) {
                  initiateMpesaPayment()
                } else if (paymentMethod === 'KCB' && isOnline) {
                  initiateKcbPayment()
                } else if (!isOnline) {
                  handleOfflineSale()
                } else {
                  handleCompleteSale.mutate(undefined)
                }
              }}
              className={`w-full py-6 rounded-[.5rem] font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-4 ${cart.length === 0 || handleCompleteSale.isPending || isProcessingMpesa
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                : isOnline
                  ? 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20 active:scale-[0.98]'
                  : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-900/20 active:scale-[0.98]'
                }`}
            >
              {handleCompleteSale.isPending || isProcessingMpesa ? (
                <div className="flex items-center gap-3">
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  {!isOnline ? (
                    <>Record Offline <RefreshCcw size={20} /></>
                  ) : paymentMethod === 'MPESA' || paymentMethod === 'KCB' ? (
                    <>Send STK Prompt <ArrowRight size={20} /></>
                  ) : (
                    <span className="flex items-center gap-2">Complete Sale <ArrowRight size={20} /></span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Cart Floating Bar ── */}
      {cart.length > 0 && activeTab === 'products' && (
        <div className="fixed bottom-6 left-6 right-6 z-[100] xl:hidden animate-in slide-in-from-bottom-8 duration-500">
          <button
            onClick={() => setActiveTab('cart')}
            className="w-full bg-[#0D4A3E] text-white p-5 rounded-[.5rem] shadow-2xl shadow-emerald-900/40 flex items-center justify-between border-4 border-white/10 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white/20 rounded-[.5rem] flex items-center justify-center relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0D4A3E]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Ready to Checkout</p>
                <p className="text-lg font-black hl-mono leading-none">KES {total.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-10 w-10 bg-white text-[#0D4A3E] rounded-[.5rem] flex items-center justify-center">
              <ArrowRight size={20} />
            </div>
          </button>
        </div>
      )}
    </div>
  )
}