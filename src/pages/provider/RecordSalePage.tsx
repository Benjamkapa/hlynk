import { useState, useEffect } from 'react'
import { Search, Plus, Minus, Trash2, CreditCard, Wallet, Banknote, Zap, CheckCircle2, Package, Scan, ArrowRight, ShoppingCart, Loader2, LayoutGrid, List, ChevronLeft, ChevronRight, Lock, Smartphone, AlertTriangle, RefreshCcw, Wifi, X, Share2, Eye } from 'lucide-react'

const KcbBankIcon = ({ className, size = 64 }: { className?: string, size?: number }) => (
  <img src="https://buni.kcbgroup.com/_nuxt/logo.71b8fc4b.svg" alt="KCB" style={{ width: size, height: size }} className={`${className || ''} object-contain shrink-0`} />
);

const MpesaBankIcon = ({ className, size = 64 }: { className?: string, size?: number }) => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/960px-M-PESA_LOGO-01.svg.png?_=20251215193002" alt="M-Pesa" style={{ width: size, height: size }} className={`${className || ''} object-contain shrink-0 pt-2`} />
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

import { SlideOver } from '../../components/shared/SlideOver'
import ThermalReceipt from '../../components/shared/ThermalReceipt'

export default function RecordSalePage() {
  const { user } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile
  })

  const slug = profile?.data?.slug;
  const publicStoreUrl = slug ? `${window.location.origin}/store/${slug}` : null;

  const handleShareStore = () => {
    if (!publicStoreUrl) return toast.error('Your store link is not ready yet');
    navigator.clipboard.writeText(publicStoreUrl).then(() => {
      toast.success('Store link copied to clipboard!', { description: publicStoreUrl });
    }).catch(() => {
      toast.info(`Your store URL is: ${publicStoreUrl}`);
    });
  };
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem('hlynk_pos_cart')
    return saved ? JSON.parse(saved) : []
  })
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerSearchInput, setCustomerSearchInput] = useState('')
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  const [mpesaPhone, setMpesaPhone] = useState('')
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false)
  const [waitingMpesaSaleId, setWaitingMpesaSaleId] = useState<string | null>(null)
  const [completedSale, setCompletedSale] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products')
  const { isOnline, pendingCount } = useOfflineStatus()
  const queryClient = useQueryClient()

  const configuredSources = profile?.data?.operationalSettings?.saleSources || ['In-Store', 'Walk-in']
  const [saleSource, setSaleSource] = useState(configuredSources[0] || 'In-Store')

  useEffect(() => {
    if (configuredSources.length > 0 && !configuredSources.includes(saleSource)) {
      setSaleSource(configuredSources[0])
    }
  }, [profile])

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

  const updatePrice = (id: string, newPrice: number | string) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        return { ...item, price: newPrice }
      }
      return item
    }))
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
        price: i.price,
        buyingPrice: i.buyingPrice
      })),
      paymentMethod,
      totalAmount: total,
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || null,
      customerPhone: mpesaPhone || undefined,
      status: args?.status !== undefined ? args.status : 0,
      mpesaRequestId: args?.mpesaRequestId,
      source: saleSource
    }),
    onSuccess: (data: any, variables: any) => {
      const saleId = data.data?.saleId || data.data?.sale?.id || data.data?.id || data.id;

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

        setCompletedSale({
          id: saleId,
          createdAt: Date.now(),
          items: cart,
          totalAmount: total,
          paymentMethod,
          customerName: selectedCustomer?.name || 'Walk-in',
          status: 0
        });

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
      if (!navigator.onLine) {
        // silently consume
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
        price: i.price,
        buyingPrice: i.buyingPrice
      })),
      paymentMethod,
      totalAmount: total,
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || null,
      customerPhone: mpesaPhone || undefined,
      status: 0,
      source: saleSource
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
      }, 60000);
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

      if ([0, 1, 3, 4].includes(sale.status)) {
        const status = sale.status;
        setWaitingMpesaSaleId(null)
        setIsProcessingMpesa(false)

        if (status === 0) {
          toast.success('Transaction Finalized', {
            description: `M-Pesa payment received. Receipt #${sale.id?.slice(-6).toUpperCase()} issued.`,
            icon: <CheckCircle2 className="text-emerald-500" />
          })

          setCompletedSale(sale);

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
      <div className="flex flex-col xl:flex-row gap-5 lg:gap-8 mx-auto items-start animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Left: Product catalogue ── */}
        <div className={`flex-1 space-y-4 min-w-0 w-full ${activeTab === 'cart' ? 'hidden xl:block' : 'block'}`}>

          {/* Search + actions bar */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 -mx-1 px-1 py-3 rounded-b-2xl">
            <div className="flex items-center justify-between gap-3">
              {/* Search */}
              <div className="relative group flex-1 max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={15} />
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareStore}
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-full hover:bg-emerald-100 transition-colors"
                  title="Share your online store link"
                >
                  <Share2 size={13} />
                  <span className="hidden sm:inline">Share Store</span>
                </button>
                <div className="flex bg-slate-100 p-1 rounded-lg gap-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product listing */}
          {productsLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-300 gap-3">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-xs font-medium text-slate-400">Loading inventory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border border-slate-100">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Package size={28} className="text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">No products found</p>
                {search && <p className="text-xs text-slate-400 mt-1">Try a different search term</p>}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* ── Grid view — StayPage-style cards ── */
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filteredProducts.map(product => {
                const cartQty = cart.find(i => i.id === product.id)?.quantity || 0;
                const availableStock = product.stockLevel - cartQty;
                const inCart = cartQty > 0;
                return (
                  <article
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)]"
                  >
                    {/* Image region */}
                    <div className="relative aspect-[1.1/1] w-full bg-slate-50 overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-200">
                          <Package size={40} />
                        </div>
                      )}

                      {/* Category badge */}
                      {product.category && (
                        <span className="absolute left-2 top-2 rounded-full bg-white/95 shadow-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-600 backdrop-blur z-10">
                          {product.category}
                        </span>
                      )}

                      {/* Stock badge */}
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold z-10 ${
                        product.type === 'SERVICE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : availableStock <= 0
                            ? 'bg-red-100 text-red-700'
                            : availableStock < 10
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                      }`}>
                        {product.type === 'SERVICE' ? 'Service' : availableStock <= 0 ? 'Out of stock' : `${availableStock} left`}
                      </span>

                      {/* Cart-in-bag indicator */}
                      {inCart && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-600 text-white rounded-full px-2 py-0.5 text-[9px] font-bold z-10">
                          <CheckCircle2 size={10} />
                          {cartQty} in cart
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h4 className="text-[13px] font-semibold text-slate-900 truncate leading-tight">{product.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-slate-900">KES {Number(product.price).toLocaleString()}</span>
                        <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 shadow">
                          <Plus size={14} />
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            /* ── List view ── */
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/60">
                    <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Product</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Category</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Stock</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-right">Price</th>
                    <th className="px-5 py-3.5" />
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
                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="h-9 w-9 rounded-xl object-cover border border-slate-100" />
                            ) : (
                              <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                                <Package size={14} />
                              </div>
                            )}
                            <span className="text-sm font-semibold text-slate-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium text-slate-400">{product.category}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {product.type === 'SERVICE' ? (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Service</span>
                          ) : (
                            <span className={`text-xs font-semibold ${availableStock < 10 ? 'text-red-500' : 'text-slate-600'}`}>{availableStock}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-900">KES {Number(product.price).toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex h-8 w-8 rounded-full bg-slate-100 text-slate-400 items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Plus size={14} />
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
            <div className="flex justify-center items-center gap-4 py-8">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium text-slate-500">
                Page <span className="text-slate-900 font-bold">{page}</span> of {productsData.pages}
              </span>
              <button
                disabled={page === productsData.pages}
                onClick={() => setPage(p => Math.min(productsData.pages, p + 1))}
                className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Cart & Payment (Sticky) ── */}
        <div className={`w-full xl:w-[420px] flex flex-col gap-4 sticky top-4 ${activeTab === 'products' ? 'hidden xl:flex' : 'flex'}`}>

          {/* Mobile back */}
          <button
            onClick={() => setActiveTab('products')}
            className="xl:hidden flex items-center gap-1.5 text-slate-500 font-medium text-sm mb-1"
          >
            <ChevronLeft size={16} /> Back to Products
          </button>

          {/* Cart panel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[460px] max-h-[calc(100vh-180px)] overflow-hidden">

            {/* Cart header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <h3 className="text-base font-semibold text-slate-900">Cart</h3>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>

            {/* Customer association */}
            <div className={`px-5 py-3 border-b border-slate-50 relative z-30 transition-all ${isSearchingCustomer ? 'scale-[1.01]' : ''}`}>
              {!selectedCustomerId ? (
                <div className="relative">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Customer</label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                      type="text"
                      onFocus={() => setIsSearchingCustomer(true)}
                      onBlur={() => setTimeout(() => setIsSearchingCustomer(false), 200)}
                      placeholder="Find or create customer..."
                      value={customerSearchInput}
                      onChange={(e) => setCustomerSearchInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-300"
                    />
                    {isSearchingCustomer && (
                      <button
                        onClick={() => { setCustomerSearchInput(''); setIsSearchingCustomer(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {(customerSearch.length > 0 || isSearchingCustomer) && (
                    <div className={`absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden transition-all ${isSearchingCustomer ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                        {customersData?.items?.map((customer: any) => (
                          <button
                            key={customer.id}
                            onClick={() => {
                              setSelectedCustomerId(customer.id);
                              setCustomerSearch('');
                              setIsSearchingCustomer(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left group"
                          >
                            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold group-hover:bg-emerald-500 group-hover:text-white transition-all">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                              <p className="text-[10px] text-slate-400">{customer.phone || 'No phone'}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button className="w-full py-3 bg-slate-50 hover:bg-emerald-600 hover:text-white text-xs font-semibold text-slate-500 border-t border-slate-100 transition-all flex items-center justify-center gap-1.5">
                        <Plus size={12} /> Create New Customer
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      {selectedCustomer?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{selectedCustomer?.name || 'Loading...'}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Linked</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomerId(null)}
                    className="h-7 w-7 rounded-lg hover:bg-white hover:text-red-500 text-slate-400 transition-all flex items-center justify-center"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Sales channel */}
            <div className="px-5 py-3 border-b border-slate-50 relative z-20">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Sales Channel</label>
              <select
                value={saleSource}
                onChange={(e) => setSaleSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all cursor-pointer"
              >
                {configuredSources.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Cart items */}
            <div className={`flex-1 overflow-y-auto px-5 py-3 space-y-2 relative z-10 transition-all duration-200 ${isSearchingCustomer ? 'opacity-[0.04] pointer-events-none' : 'opacity-100'}`}>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-16">
                  <ShoppingCart size={36} className="mb-3" />
                  <p className="text-xs font-medium text-slate-400">Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all group">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h5>
                      <div className="flex gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider w-8">Sell</span>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updatePrice(item.id, e.target.value === '' ? '' : parseFloat(e.target.value))}
                            onBlur={(e) => { if (e.target.value === '') updatePrice(item.id, 0); }}
                            className="bg-transparent border-b border-dashed border-slate-300 w-16 text-xs text-slate-700 font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider w-8">Cost</span>
                          <input
                            type="number"
                            value={item.buyingPrice !== undefined ? item.buyingPrice : (item.type === 'SERVICE' ? 0 : '')}
                            placeholder="Auto"
                            onChange={(e) => {
                              setCart(cart.map(i => i.id === item.id ? { ...i, buyingPrice: e.target.value === '' ? undefined : parseFloat(e.target.value) } : i))
                            }}
                            className="bg-transparent border-b border-dashed border-slate-300 w-16 text-xs text-amber-600 font-semibold focus:outline-none focus:border-amber-400 transition-colors"
                            title="Cost / expense for this item"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="h-7 w-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors shadow-sm">
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold text-slate-900 w-5 text-center">{item.quantity}</span>
                      <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="h-7 w-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors shadow-sm">
                        <Plus size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} className="h-7 w-7 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="px-5 py-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="font-semibold text-slate-900">KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-900 rounded-xl text-white">
                <span className="text-xs font-semibold opacity-70">Total payable</span>
                <span className="text-xl font-bold">KES {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment method panel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Payment method</p>

            {/* Payment buttons */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote, feature: null },
                { id: 'MPESA', label: 'Express', icon: MpesaBankIcon, feature: 'mpesa_stk' },
                { id: 'KCB', label: 'Mobile', icon: KcbBankIcon, feature: 'kcb_settlement' },
                { id: 'MPESA_MANUAL', label: 'M-Pesa Till/Pochi', icon: Wallet, feature: null },
              ].map(method => (
                <FeatureGate
                  key={method.id}
                  feature={method.feature as any}
                  fallback={
                    method.feature ? (
                      <button
                        onClick={() => toast.info(`${method.label} requires the Growth Plan. Please upgrade to unlock.`)}
                        className="relative flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed overflow-hidden"
                      >
                        <method.icon size={['MPESA', 'KCB'].includes(method.id) ? 48 : 18} />
                        <span className="text-[10px] font-semibold">{method.label}</span>
                        <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                          Requires {(FEATURE_PLANS as any)[method.feature as string][0]}
                        </span>
                        <div className="absolute top-1.5 right-1.5 opacity-20">
                          <Lock size={11} />
                        </div>
                      </button>
                    ) : null
                  }
                >
                  <button
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border-2 transition-all ${paymentMethod === method.id
                      ? 'border-slate-900 bg-slate-50 text-slate-900'
                      : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      }`}
                  >
                    <method.icon size={['MPESA', 'KCB'].includes(method.id) ? 48 : 18} />
                    <span className="text-[10px] font-semibold">{method.label}</span>
                  </button>
                </FeatureGate>
              ))}
            </div>

            {/* Payment sub-details */}
            {paymentMethod === 'MPESA_MANUAL' && (
              <div className="space-y-3 animate-in slide-in-from-top-1 duration-200">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                  <Smartphone size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">Manual M-Pesa</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5 leading-relaxed">
                      {profile?.data?.operationalSettings?.manualMpesa?.instructions || 'Ask the client to pay to your Till or Pochi, then confirm receipt before completing.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'MPESA' && (
              isOnline ? (
                <div className="space-y-3 animate-in slide-in-from-top-1 duration-200">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                    <MpesaBankIcon size={16} />
                    <p className="text-[10px] font-medium text-emerald-800 leading-tight">
                      STK Push sent to customer's phone for instant verification.
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Customer M-Pesa Number</label>
                    <input
                      type="number"
                      placeholder="07..."
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-1 duration-200">
                  <Wifi size={16} className="text-amber-600 animate-pulse mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Offline mode</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">Accept payment via Pochi la Biashara or Paybill, then record here.</p>
                  </div>
                </div>
              )
            )}

            {paymentMethod === 'KCB' && isOnline && (
              <div className="space-y-3 animate-in slide-in-from-top-1 duration-200">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
                  <KcbBankIcon size={16} />
                  <p className="text-[10px] font-medium text-indigo-800 leading-tight">
                    KCB Mobile STK Push sent to customer for direct settlement.
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Customer Phone Number</label>
                  <input
                    type="text"
                    placeholder="254..."
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-indigo-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3 animate-in slide-in-from-top-1 duration-200">
                <Banknote size={16} className="text-amber-600 shrink-0" />
                <p className="text-[10px] font-medium text-amber-800 leading-tight">
                  Cash payment. Ensure funds received before completing.
                </p>
              </div>
            )}

            {/* Complete button */}
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
              className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 ${cart.length === 0 || handleCompleteSale.isPending || isProcessingMpesa
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : isOnline
                  ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] shadow-sm'
                  : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98] shadow-sm'
                }`}
            >
              {handleCompleteSale.isPending || isProcessingMpesa ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  {!isOnline ? (
                    <>Record Offline <RefreshCcw size={16} /></>
                  ) : paymentMethod === 'MPESA' || paymentMethod === 'KCB' ? (
                    <>Send STK Prompt <ArrowRight size={16} /></>
                  ) : (
                    <>Complete Sale <ArrowRight size={16} /></>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile floating cart bar ── */}
      {cart.length > 0 && activeTab === 'products' && (
        <div className="fixed bottom-28 left-4 right-4 z-[100] xl:hidden animate-in slide-in-from-bottom-6 duration-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cart')}
              className="flex-1 bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl shadow-slate-900/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-white/15 rounded-xl flex items-center justify-center relative">
                  <ShoppingCart size={18} />
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-semibold opacity-60 uppercase tracking-wider">Ready to checkout</p>
                  <p className="text-base font-bold leading-tight">KES {total.toLocaleString()}</p>
                </div>
              </div>
              <div className="h-9 w-9 bg-white/15 rounded-xl flex items-center justify-center">
                <ArrowRight size={18} />
              </div>
            </button>
            <button
              onClick={() => { setCart([]); localStorage.removeItem('hlynk_pos_cart'); }}
              className="bg-red-500 text-white p-3.5 rounded-2xl shadow-xl shadow-red-900/20 hover:bg-red-600 transition-colors"
              title="Clear Cart"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ── Transaction Receipt Modal ── */}
      <SlideOver
        isOpen={!!completedSale}
        onClose={() => setCompletedSale(null)}
        title="Transaction Finalized"
      >
        {completedSale && (
          <div className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-400">
              <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Sale recorded</p>
                <p className="text-xs text-emerald-700 mt-0.5">Tax calculated and inventory updated.</p>
              </div>
            </div>

            <ThermalReceipt
              sale={completedSale}
              autoPrint={profile?.data?.operationalSettings?.autoPrint}
            />

            <div className="pt-2 no-print">
              <button
                onClick={() => setCompletedSale(null)}
                className="w-full py-3.5 bg-slate-900 text-white rounded-full font-semibold text-sm shadow-sm hover:bg-slate-800 transition-colors"
              >
                Acknowledge & Continue
              </button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  )
}