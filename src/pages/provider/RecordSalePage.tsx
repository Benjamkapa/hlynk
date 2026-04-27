import { useState } from 'react'
import { Search, Plus, Minus, Trash2, CreditCard, Wallet, Banknote, Zap, CheckCircle2, Package, Scan, ArrowRight, ShoppingCart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi, salesApi, paymentsApi } from '../../lib/api/providers'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { getErrorMessage } from '../../lib/utils/error'

import { useEffect } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { PaginatedResponse } from '../../lib/types/api'

export default function RecordSalePage() {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false)
  const queryClient = useQueryClient()

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery<PaginatedResponse<any>>({
    queryKey: ['inventory-pos', search],
    queryFn: () => inventoryApi.list({ search, limit: 12 }),
    placeholderData: keepPreviousData
  })

  useEffect(() => {
    if (productsError) toast.error(getErrorMessage(productsError))
  }, [productsError])

  const filteredProducts = productsData?.items || []

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta)
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
      totalAmount: total
    }),
    onSuccess: (data: any) => {
      toast.success('Transaction Finalized', {
        description: `Receipt #${data.id?.slice(-6).toUpperCase()} issued successfully.`,
        icon: <CheckCircle2 className="text-emerald-500" />
      })
      setCart([])
      setMpesaPhone('')
      queryClient.invalidateQueries({ queryKey: ['inventory-pos'] })
      queryClient.invalidateQueries({ queryKey: ['recent-sales'] })
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

      // For MVP/Demo, we proceed to complete the sale after prompt is sent
      // In production, we'd wait for a callback or poll status
      handleCompleteSale.mutate()
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsProcessingMpesa(false)
    }
  }

  return (
    <div className="flex flex-col xl:flex-row gap-12 max-w-[1800px] mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <style>{ADMIN_CSS}</style>
      
      {/* Left: Product Selection */}
      <div className="flex-1 space-y-10">
        <div className="flex justify-between items-end">
           <div className="space-y-2">
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Point of Sale</h1>
             <p className="text-slate-500 font-medium">Select items or scan barcode to add to cart</p>
           </div>
           <div className="hidden md:flex gap-4">
              <button className="h-14 px-6 bg-white border border-slate-200 rounded-lg flex items-center gap-3 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                 <Scan size={18} /> Barcode Scanner
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
                toast.success(`Added ${filteredProducts[0].name}`)
              }
            }}
            className="w-full bg-white border border-slate-100 shadow-xl shadow-slate-900/5 rounded-lg py-6 pl-16 pr-8 text-xl font-bold focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 pb-12">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => addToCart(product)}
              className="group bg-white border border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-900/10 p-8 rounded-lg cursor-pointer transition-all flex flex-col gap-6"
            >
              <div className="flex justify-between items-start">
                <div className="h-14 w-14 rounded-md bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                  <Package size={28} />
                </div>
                <div className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${product.stockLevel < 10 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                   Stock: <span className="hl-mono">{product.stockLevel}</span>
                </div>
              </div>
              <div>
                 <h4 className="text-xl font-black text-slate-900 mb-1">{product.name}</h4>
                 <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{product.category}</p>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                 <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Price</p>
                    <p className="text-2xl font-black text-[#0D4A3E] hl-mono">KES {Number(product.price).toLocaleString()}</p>
                 </div>
                 <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <Plus size={20} />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cart & Payment */}
      <div className="w-full xl:w-[500px] flex flex-col gap-8">
        <div className="bg-white p-10 rounded-lg border border-slate-100 shadow-xl shadow-slate-900/5 flex-1 flex flex-col min-h-[600px] relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-2xl font-black text-slate-900">Cart Summary</h3>
            <span className="bg-[#0D4A3E] text-white px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest hl-mono shadow-lg shadow-emerald-900/20">
              {cart.length} ITEMS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 mb-10 pr-2 custom-scrollbar relative z-10">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 py-20">
                <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                   <ShoppingCart size={48} className="opacity-10" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-5 p-5 rounded-lg bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 transition-all group">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-black text-slate-900 truncate">{item.name}</h5>
                    <p className="text-[10px] text-slate-400 font-bold hl-mono uppercase tracking-widest mt-0.5">KES {Number(item.price).toLocaleString()} / unit</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="h-9 w-9 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-black w-6 text-center hl-mono text-slate-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="h-9 w-9 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="h-9 w-9 rounded-xl text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-6 pt-10 border-t-2 border-dashed border-slate-100 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Subtotal</span>
              <span className="font-black text-slate-900 hl-mono">KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-[#0D4A3E] rounded-lg text-white shadow-xl shadow-emerald-900/20">
              <span className="text-sm font-black uppercase tracking-widest opacity-80">Final Total</span>
              <span className="text-3xl font-black hl-mono tracking-tighter">KES {total.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 h-64 w-64 bg-slate-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
        </div>

        {/* Payment & Action */}
        <div className="bg-white p-10 rounded-lg border border-slate-100 shadow-xl shadow-slate-900/5 space-y-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <CreditCard size={18} className="text-slate-400" />
                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Payment Strategy</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {[
                { id: 'CASH', label: 'Cash Flow', icon: Banknote },
                { id: 'MPESA', label: 'M-Pesa Mobile', icon: Wallet },
              ].map(method => (
                <button 
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center gap-3 py-6 rounded-lg border-2 transition-all ${
                    paymentMethod === method.id 
                    ? 'border-[#0D4A3E] bg-emerald-50/50 text-[#0D4A3E] shadow-lg shadow-emerald-900/5' 
                    : 'border-slate-50 bg-white text-slate-300 hover:bg-slate-50 hover:text-slate-500'
                  }`}
                >
                  <method.icon size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'MPESA' && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Customer M-Pesa Number</label>
                <div className="relative group">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="0712 345 678" 
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all hl-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <button 
            disabled={cart.length === 0 || handleCompleteSale.isPending || isProcessingMpesa}
            onClick={() => paymentMethod === 'MPESA' ? initiateMpesaPayment() : handleCompleteSale.mutate()}
            className={`w-full py-8 rounded-lg font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 ${
              cart.length === 0 || handleCompleteSale.isPending || isProcessingMpesa
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20 active:scale-[0.98]'
            }`}
          >
            {handleCompleteSale.isPending || isProcessingMpesa ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {isProcessingMpesa ? 'Sending Prompt...' : 'Processing...'}
              </>
            ) : (
              <>
                {paymentMethod === 'MPESA' ? 'Send Payment Prompt' : 'Confirm & Finalize'} <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
