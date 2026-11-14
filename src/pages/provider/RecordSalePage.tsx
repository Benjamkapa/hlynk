
import { useState, useEffect } from 'react'
import {
  Search, Plus, Minus, Trash2, Banknote, Wallet, CheckCircle2,
  Package, ArrowRight, ShoppingCart, LayoutGrid, List,
  ChevronLeft, ChevronRight, Lock, Smartphone, AlertTriangle,
  RefreshCcw, Wifi, X, Share2, ShoppingBag, UserRound,
  Receipt, CreditCard, Store, Clock3
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import InlineLoader, { ButtonLoader } from '../../components/shared/InlineLoader'
import FeatureGate from '../../components/shared/FeatureGate'
import { inventoryApi, salesApi, customersApi, providersApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { requireOnline } from '../../lib/utils/onlineGuard'
import { PaginatedResponse } from '../../lib/types/api'
import { useOfflineStatus } from '../../lib/offline/useOfflineStatus'
import {
  enqueueSale, cacheInventory, getCachedInventory,
  cacheCustomers, getCachedCustomers
} from '../../lib/offline/db'
import { SlideOver } from '../../components/shared/SlideOver'
import ThermalReceipt from '../../components/shared/ThermalReceipt'

const money = (value: number | string) =>
  Number(value || 0).toLocaleString('en-KE')

const KcbBankIcon = ({ size = 22 }: { size?: number }) => (
  <img
    src="https://buni.kcbgroup.com/_nuxt/logo.71b8fc4b.svg"
    alt="KCB"
    style={{ width: size, height: size }}
    className="object-contain shrink-0"
  />
)

const MpesaBankIcon = ({ size = 22 }: { size?: number }) => (
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/960px-M-PESA_LOGO-01.svg.png?_=20251215193002"
    alt="M-Pesa"
    style={{ width: size, height: size }}
    className="object-contain shrink-0"
  />
)

export default function RecordSalePage() {
  const queryClient = useQueryClient()
  const { isOnline, pendingCount } = useOfflineStatus()

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile
  })

  const configuredSources =
    profile?.data?.operationalSettings?.saleSources || ['In-Store', 'Walk-in']

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products')

  const [cart, setCart] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hlynk_pos_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [saleSource, setSaleSource] = useState(configuredSources[0] || 'In-Store')

  const [customerSearch, setCustomerSearch] = useState('')
  const [customerSearchInput, setCustomerSearchInput] = useState('')
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  const [mpesaPhone, setMpesaPhone] = useState('')
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false)
  const [waitingMpesaSaleId, setWaitingMpesaSaleId] = useState<string | null>(null)
  const [completedSale, setCompletedSale] = useState<any>(null)

  const slug = profile?.data?.slug
  const publicStoreUrl = slug
    ? `${window.location.origin}/store/${slug}`
    : null

  const handleShareStore = () => {
    if (!publicStoreUrl) {
      toast.error('Your store link is not ready yet')
      return
    }

    navigator.clipboard.writeText(publicStoreUrl)
      .then(() => toast.success('Store link copied!', {
        description: publicStoreUrl
      }))
      .catch(() => toast.info(`Your store URL is: ${publicStoreUrl}`))
  }

  useEffect(() => {
    if (configuredSources.length > 0 && !configuredSources.includes(saleSource)) {
      setSaleSource(configuredSources[0])
    }
  }, [profile])

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const timer = setTimeout(() => setCustomerSearch(customerSearchInput), 300)
    return () => clearTimeout(timer)
  }, [customerSearchInput])

  useEffect(() => {
    localStorage.setItem('hlynk_pos_cart', JSON.stringify(cart))
  }, [cart])

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError
  } = useQuery<PaginatedResponse<any>>({
    queryKey: ['inventory-pos', search, page],
    queryFn: async () => {
      if (!isOnline) {
        const cached = await getCachedInventory()
        const filtered = search
          ? cached.filter((p: any) =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.category?.toLowerCase().includes(search.toLowerCase())
            )
          : cached

        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pages: 1
        } as any
      }

      const res = await inventoryApi.list({ search, page, limit: 100 })

      if (res.items && page === 1 && !search) {
        cacheInventory(res.items).catch(console.error)
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
          ? cached.filter((c: any) =>
              c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
              c.phone?.includes(customerSearch)
            )
          : cached

        return { items: filtered.slice(0, 10), total: filtered.length }
      }

      const res = await customersApi.list({ search: customerSearch, limit: 10 })

      if (res.items && !customerSearch) {
        cacheCustomers(res.items).catch(console.error)
      }

      return res
    },
    enabled: isOnline ? customerSearch.length > 1 : true
  })

  const selectedCustomer = customersData?.items?.find(
    (c: any) => c.id === selectedCustomerId
  )

  const filteredProducts = productsData?.items || []

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id)
    const currentQty = existing ? existing.quantity : 0
    const isTracked = product.type !== 'SERVICE' && Boolean(product.trackStock)

    if (isTracked && currentQty >= product.stockLevel) {
      toast.error(
        product.stockLevel <= 0
          ? `${product.name} is out of stock`
          : `Only ${product.stockLevel} units available`
      )
      return
    }

    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }

    toast.success(`${product.name} added`, { duration: 900 })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id !== id) return item

      const newQty = item.quantity + delta
      const isTracked = item.type !== 'SERVICE' && Boolean(item.trackStock)

      if (delta > 0 && isTracked && newQty > item.stockLevel) {
        toast.error(
          item.stockLevel <= 0
            ? `${item.name} is out of stock`
            : `Only ${item.stockLevel} units available`
        )
        return item
      }

      if (newQty < 1) return item
      return { ...item, quantity: newQty }
    }))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const updatePrice = (id: string, newPrice: number | string) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, price: newPrice } : item
    ))
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )
  const discount = 0
  const total = subtotal - discount
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const clearSale = () => {
    setCart([])
    localStorage.removeItem('hlynk_pos_cart')
    setMpesaPhone('')
    setPaymentMethod('CASH')
    setSelectedCustomerId(null)
    setCustomerSearch('')
    setCustomerSearchInput('')
  }

  const handleCompleteSale = useMutation({
    mutationFn: (args?: { status?: string | number; mpesaRequestId?: string }) =>
      salesApi.create({
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
      const saleId =
        data.data?.saleId ||
        data.data?.sale?.id ||
        data.data?.id ||
        data.id

      if (variables?.status === 2) {
        if (saleId) {
          setWaitingMpesaSaleId(saleId)
        } else {
          console.error('No saleId found in response:', data)
        }

        setTimeout(() => {
          setWaitingMpesaSaleId(prev => {
            if (prev === saleId) {
              setIsProcessingMpesa(false)
              toast.error('Transaction timed out', {
                description: 'Please check whether the customer received the prompt.'
              })
              return null
            }
            return prev
          })
        }, 130000)
      } else {
        toast.success('Sale completed', {
          description: `Receipt #${saleId?.slice(-6)?.toUpperCase() || 'issued'} successfully.`
        })

        setCompletedSale({
          id: saleId,
          createdAt: Date.now(),
          items: cart,
          totalAmount: total,
          paymentMethod,
          customerName: selectedCustomer?.name || 'Walk-in',
          status: 0
        })

        clearSale()

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
      if (navigator.onLine) toast.error(errorMsg)
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

    await enqueueSale({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      payload: salePayload,
      retries: 0
    })

    toast.success('Sale saved offline', {
      description: 'It will sync automatically when you are back online.'
    })

    clearSale()
  }

  useEffect(() => {
    let timeout: any

    if (waitingMpesaSaleId && isProcessingMpesa) {
      timeout = setTimeout(() => {
        setWaitingMpesaSaleId(null)
        setIsProcessingMpesa(false)
        toast.error('Payment polling timed out. Check Sales History for the status.')
      }, 60000)
    }

    return () => clearTimeout(timeout)
  }, [waitingMpesaSaleId, isProcessingMpesa])

  const { data: pendingSaleData } = useQuery({
    queryKey: ['sale-details', waitingMpesaSaleId],
    queryFn: () => salesApi.getDetails(waitingMpesaSaleId!),
    enabled: !!waitingMpesaSaleId,
    refetchInterval: query => {
      const sale = query.state.data?.data
      if (sale && [0, 1, 3, 4].includes(sale.status)) return false
      return 2000
    },
    refetchIntervalInBackground: true,
    staleTime: 0,
    retry: 3
  })

  useEffect(() => {
    if (!waitingMpesaSaleId || !pendingSaleData?.data) return

    const sale = pendingSaleData.data

    if ([0, 1, 3, 4].includes(sale.status)) {
      const status = sale.status
      setWaitingMpesaSaleId(null)
      setIsProcessingMpesa(false)

      if (status === 0) {
        toast.success('M-Pesa payment received', {
          description: `Receipt #${sale.id?.slice(-6).toUpperCase()} issued.`
        })

        setCompletedSale(sale)
        clearSale()

        queryClient.invalidateQueries({ queryKey: ['inventory-pos'] })
        queryClient.invalidateQueries({ queryKey: ['inventory'] })
        queryClient.invalidateQueries({ queryKey: ['recent-sales'] })
        queryClient.invalidateQueries({ queryKey: ['provider-stats'] })
        queryClient.invalidateQueries({ queryKey: ['pos-customers'] })
      } else {
        const isCancelled = status === 3
        toast.error(isCancelled ? 'Payment cancelled' : 'Payment failed', {
          description: isCancelled
            ? 'The customer cancelled the request on their phone.'
            : sale.message || 'M-Pesa could not process the payment.'
        })
      }
    }
  }, [waitingMpesaSaleId, pendingSaleData])

  const initiateMpesaPayment = async () => {
    if (!requireOnline('M-Pesa STK Push')) return

    if (!mpesaPhone || mpesaPhone.length < 10) {
      toast.error('Please enter a valid M-Pesa phone number')
      return
    }

    setIsProcessingMpesa(true)

    try {
      toast.info('M-Pesa prompt sent', {
        description: 'Waiting for the customer to enter their PIN...'
      })

      const res = await salesApi.vendorMpesaPush({
        phone: mpesaPhone,
        amount: total,
        reference: `SALE-${Date.now().toString().slice(-6)}`
      })

      handleCompleteSale.mutate({
        status: 2,
        mpesaRequestId: res?.data?.CheckoutRequestID || res?.CheckoutRequestID
      })
    } catch (err: any) {
      toast.error(getErrorMessage(err))
      setIsProcessingMpesa(false)
    }
  }

  const initiateKcbPayment = async () => {
    if (!requireOnline('KCB STK Push')) return

    if (!mpesaPhone || mpesaPhone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }

    setIsProcessingMpesa(true)

    try {
      toast.info('KCB STK prompt sent', {
        description: 'Waiting for the customer to enter their PIN...'
      })

      const res = await salesApi.vendorKcbPush({
        phone: mpesaPhone,
        amount: total,
        reference: `KCB-${Date.now().toString().slice(-6)}`
      })

      const checkoutId =
        res?.data?.response?.CheckoutRequestID ||
        res?.data?.CheckoutRequestID ||
        res?.CheckoutRequestID

      handleCompleteSale.mutate({
        status: 2,
        mpesaRequestId: checkoutId
      })
    } catch (err: any) {
      toast.error(getErrorMessage(err))
      setIsProcessingMpesa(false)
    }
  }

  const paymentMethods = [
    { id: 'CASH', label: 'Cash', icon: Banknote, feature: null, configured: true },
    {
      id: 'MPESA',
      label: 'M-Pesa',
      icon: MpesaBankIcon,
      feature: 'mpesa_stk',
      configured: Boolean(
        profile?.data?.operationalSettings?.mpesa?.shortcode ||
        profile?.data?.operationalSettings?.mpesa?.[
          profile?.data?.operationalSettings?.mpesa?.env || 'production'
        ]?.shortcode ||
        profile?.data?.operationalSettings?.mpesa?.[
          profile?.data?.operationalSettings?.mpesa?.env || 'production'
        ]?.consumerKey
      )
    },
    {
      id: 'KCB',
      label: 'KCB STK',
      icon: KcbBankIcon,
      feature: 'kcb_settlement',
      configured: Boolean(
        profile?.data?.operationalSettings?.kcb?.shortcode ||
        profile?.data?.operationalSettings?.kcb?.[
          profile?.data?.operationalSettings?.kcb?.env || 'production'
        ]?.shortcode ||
        profile?.data?.operationalSettings?.kcb?.[
          profile?.data?.operationalSettings?.kcb?.env || 'production'
        ]?.clientId
      )
    },
    {
      id: 'MPESA_MANUAL',
      label: 'Till / Pochi',
      icon: Wallet,
      feature: null,
      configured: Boolean(
        profile?.data?.operationalSettings?.manualMpesa?.instructions ||
        profile?.data?.operationalSettings?.manualMpesa?.enabled !== false
      )
    }
  ]

  const completeSale = () => {
    if (!cart.length || handleCompleteSale.isPending || isProcessingMpesa) return

    if (paymentMethod === 'MPESA' && isOnline) {
      initiateMpesaPayment()
    } else if (paymentMethod === 'KCB' && isOnline) {
      initiateKcbPayment()
    } else if (!isOnline) {
      handleOfflineSale()
    } else {
      handleCompleteSale.mutate(undefined)
    }
  }

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#F7F8F4] text-slate-800 pb-28 xl:pb-8">

      {/* Page heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-8 w-8 rounded-xl bg-[#E5F1E9] flex items-center justify-center text-[#176B4D]">
              <ShoppingBag size={17} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#438267]">
              Sales counter
            </span>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#193B30]">
            Let's make a sale
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              <RefreshCcw size={13} />
              {pendingCount} pending sync
            </div>
          )}

          <button
            onClick={handleShareStore}
            className="inline-flex items-center gap-2 rounded-full border border-[#DCE8DF] bg-white px-4 py-2.5 text-xs font-semibold text-[#27694D] hover:bg-[#F0F7F1] transition"
          >
            <Share2 size={14} />
            Share store
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="xl:hidden mb-5 grid grid-cols-2 rounded-2xl bg-[#E9EEE8] p-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
            activeTab === 'products'
              ? 'bg-white text-[#1C6045] shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <Package size={16} />
          Products
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
            activeTab === 'cart'
              ? 'bg-white text-[#1C6045] shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <ShoppingCart size={16} />
          Order
          {itemCount > 0 && (
            <span className="rounded-full bg-[#176B4D] px-2 py-0.5 text-[10px] text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1fr)_420px] gap-5 xl:gap-6 items-start">

        {/* Product catalogue */}
        <section className={`min-w-0 ${activeTab === 'cart' ? 'hidden xl:block' : ''}`}>

          {/* Search and view controls */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search products or services..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && filteredProducts.length === 1) {
                    addToCart(filteredProducts[0])
                    setSearchInput('')
                    setSearch('')
                  }
                }}
                className="w-full rounded-2xl border border-[#E4E9E1] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#7EB395] focus:ring-4 focus:ring-[#DCEFE2] placeholder:text-slate-400"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('')
                    setSearch('')
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {productsData?.total ?? filteredProducts.length} items
              </span>

              <div className="flex items-center gap-1 rounded-xl border border-[#E4E9E1] bg-white p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  className={`rounded-lg p-2 transition ${
                    viewMode === 'grid'
                      ? 'bg-[#E7F1E9] text-[#176B4D]'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="List view"
                  className={`rounded-lg p-2 transition ${
                    viewMode === 'list'
                      ? 'bg-[#E7F1E9] text-[#176B4D]'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Catalogue heading */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#244638]">Your catalogue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an item to add it to the order.
              </p>
            </div>
            {search && (
              <span className="rounded-full bg-[#E9F2EA] px-3 py-1.5 text-xs font-medium text-[#28694C]">
                Results for "{search}"
              </span>
            )}
          </div>

          {productsLoading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-[#E7EBE5] bg-white">
              <InlineLoader size="lg" message="Getting your products ready..." />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9E3D9] bg-white px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EDF3ED] text-[#7B9C84]">
                <Package size={28} />
              </div>
              <h3 className="font-semibold text-[#244638]">
                Nothing to show just yet
              </h3>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                {search
                  ? 'Try another search term. Your item may be listed under a different name.'
                  : 'Your products and services will appear here once they are added to your catalogue.'}
              </p>
              {search && (
                <button
                  onClick={() => {
                    setSearchInput('')
                    setSearch('')
                  }}
                  className="mt-4 rounded-full bg-[#E8F2EA] px-4 py-2 text-xs font-semibold text-[#236747]"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map(product => {
                const cartQty =
                  cart.find(i => i.id === product.id)?.quantity || 0
                const availableStock = product.stockLevel - cartQty
                const isService = product.type === 'SERVICE'
                const isTracked = !isService && Boolean(product.trackStock)
                const isOut = isTracked && availableStock <= 0

                return (
                  <article
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      cartQty > 0
                        ? 'border-[#85B99A] shadow-[0_0_0_2px_rgba(55,132,88,0.08)]'
                        : 'border-[#E7EBE5] hover:border-[#B8D4BF]'
                    } ${isOut ? 'opacity-60' : ''}`}
                  >
                    <div className="relative aspect-[1.25/1] overflow-hidden bg-[#F0F1EA]">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                          }}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EEF2E9] to-[#E4EBE0] text-[#9AAE9B]">
                          <Package size={34} strokeWidth={1.4} />
                        </div>
                      )}

                      {product.category && (
                        <span className="absolute left-3 top-3 max-w-[65%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#526B5B] shadow-sm backdrop-blur">
                          {product.category}
                        </span>
                      )}

                      <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm ${
                        isService
                          ? 'bg-[#E2F2E8] text-[#276A48]'
                          : !product.trackStock
                            ? 'bg-white/95 text-slate-600'
                            : availableStock <= 0
                              ? 'bg-red-100 text-red-700'
                              : availableStock < 10
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-white/95 text-slate-600'
                      }`}>
                        {isService
                          ? 'Service'
                          : !product.trackStock
                            ? 'Available'
                            : availableStock <= 0
                              ? 'Out of stock'
                              : `${availableStock} left`}
                      </span>

                      {cartQty > 0 && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-[#175D40] px-3 py-1.5 text-xs font-bold text-white shadow-md">
                          <CheckCircle2 size={13} />
                          {cartQty} in order
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                      <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-snug text-[#263F32]">
                        {product.name}
                      </h3>

                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Selling price
                          </p>
                          <p className="mt-1 text-base font-bold tracking-tight text-[#174C36]">
                            KES {money(product.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isOut}
                          onClick={e => {
                            e.stopPropagation()
                            addToCart(product)
                          }}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#176B4D] text-white shadow-sm transition hover:bg-[#10563C] active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200"
                          title="Add to order"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-[#E7EBE5] bg-white">
              <div className="hidden grid-cols-[minmax(0,1fr)_120px_110px_130px_44px] gap-3 border-b border-[#EDF0EB] bg-[#F8FAF7] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
                <span>Item</span>
                <span>Category</span>
                <span>Availability</span>
                <span className="text-right">Price</span>
                <span />
              </div>

              <div className="divide-y divide-[#EDF0EB]">
                {filteredProducts.map(product => {
                  const cartQty =
                    cart.find(i => i.id === product.id)?.quantity || 0
                  const availableStock = product.stockLevel - cartQty
                  const isService = product.type === 'SERVICE'
                  const isOut =
                    !isService && product.trackStock && availableStock <= 0

                  return (
                    <button
                      type="button"
                      key={product.id}
                      disabled={isOut}
                      onClick={() => addToCart(product)}
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#F8FAF7] disabled:opacity-50 sm:grid-cols-[minmax(0,1fr)_120px_110px_130px_44px] sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-11 w-11 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF2EB] text-[#78947E]">
                            <Package size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#294638]">
                            {product.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-400 sm:hidden">
                            {product.category || (isService ? 'Service' : 'Product')}
                          </p>
                        </div>
                      </div>

                      <span className="hidden truncate text-xs text-slate-500 sm:block">
                        {product.category || '—'}
                      </span>

                      <span className={`hidden text-xs font-medium sm:block ${
                        isOut ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {isService
                          ? 'Service'
                          : !product.trackStock
                            ? 'Available'
                            : isOut
                              ? 'Out of stock'
                              : `${availableStock} left`}
                      </span>

                      <span className="text-right text-sm font-bold text-[#174C36]">
                        KES {money(product.price)}
                      </span>

                      <span className="hidden h-8 w-8 items-center justify-center rounded-xl bg-[#E8F2EA] text-[#176B4D] sm:flex">
                        <Plus size={16} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {productsData && productsData.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E1E8DF] bg-white text-slate-500 transition hover:text-[#176B4D] disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-xs font-medium text-slate-500">
                Page <strong className="text-[#244638]">{page}</strong> of {productsData.pages}
              </span>

              <button
                disabled={page === productsData.pages}
                onClick={() => setPage(p => Math.min(productsData.pages, p + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E1E8DF] bg-white text-slate-500 transition hover:text-[#176B4D] disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>

        {/* Order and payment panel */}
        <aside className={`min-w-0 xl:sticky xl:top-5 ${
          activeTab === 'products' ? 'hidden xl:block' : 'block'
        }`}>
          <div className="overflow-hidden rounded-3xl border border-[#E2E9E0] bg-white shadow-[0_8px_30px_rgba(35,70,48,0.045)]">

            {/* Order heading */}
            <div className="bg-[#194C38] px-5 py-5 text-white sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#B9D8C3]">
                    Your checkout
                  </p>
                  <h2 className="mt-1 text-xl font-bold">Current order</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <ShoppingCart size={21} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-4">
                <span className="text-xs text-[#C7DDCE]">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} added
                </span>
                <span className="text-sm font-semibold text-white">
                  KES {money(total)}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5">

              {/* Customer */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold text-[#345342]">
                    Customer
                  </label>
                  <span className="text-[10px] font-medium text-slate-400">
                    Optional
                  </span>
                </div>

                {!selectedCustomerId ? (
                  <div className="relative">
                    <div className="relative">
                      <UserRound
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        onFocus={() => setIsSearchingCustomer(true)}
                        onBlur={() => setTimeout(() => setIsSearchingCustomer(false), 200)}
                        placeholder="Search by name or phone..."
                        value={customerSearchInput}
                        onChange={e => setCustomerSearchInput(e.target.value)}
                        className="w-full rounded-xl border border-[#E4EAE2] bg-[#FAFBF9] py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[#84B798] focus:ring-4 focus:ring-[#E4F1E7]"
                      />
                      {customerSearchInput && (
                        <button
                          onClick={() => {
                            setCustomerSearchInput('')
                            setCustomerSearch('')
                            setIsSearchingCustomer(false)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>

                    {isSearchingCustomer && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-[#E5EAE3] bg-white shadow-xl">
                        {customersData?.items?.length ? (
                          customersData.items.map((customer: any) => (
                            <button
                              type="button"
                              key={customer.id}
                              onClick={() => {
                                setSelectedCustomerId(customer.id)
                                setCustomerSearchInput('')
                                setCustomerSearch('')
                                setIsSearchingCustomer(false)
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F1F7F1]"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F2EA] text-sm font-bold text-[#286747]">
                                {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#294638]">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {customer.phone || 'No phone number'}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="px-4 py-5 text-center text-xs text-slate-400">
                            No matching customers found.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-[#D7E9DA] bg-[#F0F7F0] p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9EBDD] text-sm font-bold text-[#276747]">
                        {selectedCustomer?.name?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#294638]">
                          {selectedCustomer?.name || 'Loading customer...'}
                        </p>
                        <p className="text-[10px] text-[#47815D]">Customer selected</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomerId(null)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
                      title="Remove customer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Sales source */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-bold text-[#345342]">
                  Sales channel
                </label>
                <div className="relative">
                  <Store
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={saleSource}
                    onChange={e => setSaleSource(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#E4EAE2] bg-[#FAFBF9] py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#84B798]"
                  >
                    {configuredSources.map((s: string) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cart items */}
              <div className="mb-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#345342]">
                    Items in this order
                  </h3>
                  {cart.length > 0 && (
                    <button
                      onClick={() => {
                        setCart([])
                        localStorage.removeItem('hlynk_pos_cart')
                      }}
                      className="text-[10px] font-semibold text-slate-400 transition hover:text-red-500"
                    >
                      Clear order
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DFE7DD] bg-[#FAFBF9] px-4 py-9 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#73947A]">
                      <ShoppingBag size={21} />
                    </div>
                    <p className="text-sm font-semibold text-[#365343]">
                      Your order is empty
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Choose products or services to get started.
                    </p>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="mt-4 rounded-full bg-[#E6F1E8] px-4 py-2 text-xs font-semibold text-[#236747] xl:hidden"
                    >
                      Browse products
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                    {cart.map(item => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#E9EDE7] bg-[#FCFDFB] p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold text-[#294638]">
                              {item.name}
                            </h4>
                            <p className="mt-0.5 text-xs text-slate-400">
                              KES {money(Number(item.price) * item.quantity)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-400">
                              Price
                            </span>
                            <div className="flex items-center rounded-lg border border-[#E2E9E0] bg-white px-2">
                              <span className="text-[10px] text-slate-400">KES</span>
                              <input
                                type="number"
                                value={item.price}
                                onChange={e =>
                                  updatePrice(
                                    item.id,
                                    e.target.value === '' ? '' : parseFloat(e.target.value)
                                  )
                                }
                                onBlur={e => {
                                  if (e.target.value === '') updatePrice(item.id, 0)
                                }}
                                className="w-16 bg-transparent py-1.5 pl-1 text-xs font-semibold text-slate-700 outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E9E0] bg-white text-slate-500 transition hover:bg-[#EDF4ED] hover:text-[#176B4D]"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-[#294638]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E9DA] bg-[#EDF5ED] text-[#176B4D] transition hover:bg-[#DCEEDF]"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            Unit cost
                          </span>
                          <input
                            type="number"
                            value={
                              item.buyingPrice !== undefined
                                ? item.buyingPrice
                                : (item.type === 'SERVICE' ? 0 : '')
                            }
                            placeholder="Optional"
                            onChange={e => {
                              setCart(cart.map(i =>
                                i.id === item.id
                                  ? {
                                      ...i,
                                      buyingPrice: e.target.value === ''
                                        ? undefined
                                        : parseFloat(e.target.value)
                                    }
                                  : i
                              ))
                            }}
                            className="w-20 border-b border-dashed border-[#DCE3D9] bg-transparent py-1 text-xs text-amber-700 outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order total */}
              <div className="mb-5 rounded-2xl bg-[#F4F7F2] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-700">
                    KES {money(subtotal)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#E0E8DE] pt-3">
                  <span className="text-sm font-bold text-[#294638]">
                    Total payable
                  </span>
                  <span className="text-xl font-bold tracking-tight text-[#175D40]">
                    KES {money(total)}
                  </span>
                </div>
              </div>

              {/* Payment method */}
              <div className="mb-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#345342]">
                    How will they pay?
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Payment method
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map(method => {
                    const Icon = method.icon
                    return (
                      <FeatureGate
                        key={method.id}
                        feature={method.feature as any}
                        fallback={
                          method.feature ? (
                            <button
                              type="button"
                              onClick={() => toast.info(
                                `${method.label} requires the Growth Plan. Please upgrade to unlock.`
                              )}
                              className="flex items-center gap-2 rounded-xl border border-[#E8EBE6] bg-[#F7F8F6] p-3 text-left text-slate-400"
                            >
                              <Icon size={19} />
                              <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                                {method.label}
                              </span>
                              <Lock size={12} />
                            </button>
                          ) : null
                        }
                      >
                        <button
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex min-w-0 items-center gap-2 rounded-xl border p-3 text-left transition ${
                            paymentMethod === method.id
                              ? 'border-[#6EA987] bg-[#EAF4EC] text-[#175D40] ring-2 ring-[#D9EBDD]'
                              : 'border-[#E6EAE4] bg-white text-slate-600 hover:border-[#B9D3BF] hover:bg-[#FAFCF9]'
                          }`}
                        >
                          <Icon size={19} />
                          <span className="min-w-0 truncate text-xs font-semibold">
                            {method.label}
                          </span>
                          {paymentMethod === method.id && (
                            <CheckCircle2 size={14} className="ml-auto shrink-0 text-[#268052]" />
                          )}
                        </button>
                      </FeatureGate>
                    )
                  })}
                </div>

                {/* Manual M-Pesa */}
                {paymentMethod === 'MPESA_MANUAL' && (
                  <div className="mt-3 flex items-start gap-3 rounded-2xl border border-[#D9EBDD] bg-[#EFF7F0] p-3.5">
                    <Smartphone size={17} className="mt-0.5 shrink-0 text-[#32805A]" />
                    <div>
                      <p className="text-xs font-bold text-[#285D40]">
                        Manual M-Pesa payment
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#54745C]">
                        {profile?.data?.operationalSettings?.manualMpesa?.instructions ||
                          'Ask the customer to pay to your Till or Pochi, then confirm receipt before completing the sale.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* M-Pesa STK */}
                {paymentMethod === 'MPESA' && (
                  isOnline ? (
                    <div className="mt-3 space-y-3 rounded-2xl border border-[#D9EBDD] bg-[#F3F8F3] p-3.5">
                      <div className="flex items-center gap-2">
                        <MpesaBankIcon size={24} />
                        <p className="text-xs text-[#426B4F]">
                          A payment prompt will be sent to the customer's phone.
                        </p>
                      </div>
                      <label className="block">
                        <span className="mb-1.5 block text-[11px] font-semibold text-[#426B4F]">
                          Customer M-Pesa number
                        </span>
                        <input
                          type="tel"
                          placeholder="07XX XXX XXX"
                          value={mpesaPhone}
                          onChange={e => setMpesaPhone(e.target.value)}
                          className="w-full rounded-xl border border-[#DCE7DC] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#79AE8B]"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Wifi size={16} />
                        <span className="text-xs font-bold">Offline mode</span>
                      </div>
                      <p className="mt-1 text-xs text-amber-700">
                        Accept payment through Till or Paybill, then record the sale.
                      </p>
                    </div>
                  )
                )}

                {/* KCB STK */}
                {paymentMethod === 'KCB' && isOnline && (
                  <div className="mt-3 space-y-3 rounded-2xl border border-[#E0E5F3] bg-[#F4F6FC] p-3.5">
                    <div className="flex items-center gap-2">
                      <KcbBankIcon size={24} />
                      <p className="text-xs text-[#53658E]">
                        A KCB payment prompt will be sent to the customer.
                      </p>
                    </div>
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-semibold text-[#53658E]">
                        Customer phone number
                      </span>
                      <input
                        type="tel"
                        placeholder="254..."
                        value={mpesaPhone}
                        onChange={e => setMpesaPhone(e.target.value)}
                        className="w-full rounded-xl border border-[#DDE3F1] bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-400"
                      />
                    </label>
                  </div>
                )}

                {paymentMethod === 'CASH' && (
                  <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-[#FBF5E9] px-3.5 py-3 text-[#916C2E]">
                    <Banknote size={17} />
                    <p className="text-xs">
                      Confirm that you have received the cash before completing.
                    </p>
                  </div>
                )}
              </div>

              {/* Complete sale */}
              <button
                disabled={
                  cart.length === 0 ||
                  handleCompleteSale.isPending ||
                  isProcessingMpesa
                }
                onClick={completeSale}
                className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-bold transition active:scale-[0.99] ${
                  cart.length === 0 ||
                  handleCompleteSale.isPending ||
                  isProcessingMpesa
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : !isOnline
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/10 hover:bg-amber-700'
                      : 'bg-[#176B4D] text-white shadow-lg shadow-[#176B4D]/15 hover:bg-[#10563C]'
                }`}
              >
                {handleCompleteSale.isPending || isProcessingMpesa ? (
                  <>
                    <ButtonLoader size={17} />
                    Processing...
                  </>
                ) : !isOnline ? (
                  <>
                    Record sale offline
                    <RefreshCcw size={16} />
                  </>
                ) : paymentMethod === 'MPESA' || paymentMethod === 'KCB' ? (
                  <>
                    Send payment prompt
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Complete sale
                    <CheckCircle2 size={17} />
                  </>
                )}
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <Lock size={11} />
                Your sales are securely recorded
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile floating order button */}
      {cart.length > 0 && activeTab === 'products' && (
        <div className="fixed bottom-24 left-4 right-4 z-[100] xl:hidden">
          <button
            onClick={() => setActiveTab('cart')}
            className="flex w-full items-center justify-between rounded-2xl bg-[#194C38] px-4 py-3.5 text-white shadow-[0_12px_35px_rgba(18,65,43,0.28)] transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShoppingCart size={19} />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E8B86D] px-1 text-[10px] font-bold text-[#4B3415]">
                  {itemCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-white/65">Your current order</p>
                <p className="text-base font-bold">KES {money(total)}</p>
              </div>
            </div>
            <span className="flex items-center gap-2 text-xs font-semibold">
              Review order
              <ArrowRight size={17} />
            </span>
          </button>
        </div>
      )}

      {/* Receipt */}
      <SlideOver
        isOpen={!!completedSale}
        onClose={() => setCompletedSale(null)}
        title="Sale completed"
      >
        {completedSale && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#D9EBDD] bg-[#EFF7F0] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#268052] text-white">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#285D40]">
                  Payment recorded
                </p>
                <p className="mt-0.5 text-xs text-[#5B8066]">
                  Your sale has been successfully recorded.
                </p>
              </div>
            </div>

            <ThermalReceipt
              sale={completedSale}
              autoPrint={profile?.data?.operationalSettings?.autoPrint}
            />

            <button
              onClick={() => setCompletedSale(null)}
              className="w-full rounded-2xl bg-[#176B4D] py-3.5 text-sm font-bold text-white transition hover:bg-[#10563C]"
            >
              Done — ready for the next sale
            </button>
          </div>
        )}
      </SlideOver>
    </div>
  )
}
