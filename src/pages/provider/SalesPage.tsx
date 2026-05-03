import { useState } from 'react'
import { Plus, Search, ShoppingCart, Trash2, Printer } from 'lucide-react'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { toast } from 'sonner'

export default function SalesPage() {
  const [cart, setCart] = useState([
    { name: 'Bread', qty: 2, price: 60 },
    { name: 'Milk', qty: 1, price: 70 },
  ])

  const total = cart.reduce((acc, item) => acc + (item.qty * item.price), 0)

  return (
    <>
      <div className="hl-dash" style={{ padding: '32px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem' }}>Point of Sale (POS)</h1>
          <div style={{ display: 'flex', gap: 12 }}>
             <button className="hl-btn-outline"><Printer size={18} /> Last Receipt</button>
             <button className="hl-btn-primary"><Plus size={18} /> New Session</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          {/* Left Side - Product List */}
          <div className="hl-card" style={{ padding: '24px' }}>
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search product name or SKU..." className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-12 outline-none" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {['Bread', 'Milk', 'Sugar', 'Cooking Oil', 'Eggs', 'Tea Leaves'].map(item => (
                <div key={item} onClick={() => toast.success(`Added ${item}`)} className="p-4 border border-gray-100 rounded-lg text-center hover:border-emerald-500 cursor-pointer transition-all">
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>{item}</p>
                  <p className="hl-mono" style={{ fontSize: '.875rem', color: 'var(--ink3)' }}>KES {Math.floor(Math.random() * 200) + 50}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Cart */}
          <div className="hl-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: 20 }}>Current Cart</h3>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {cart.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '.875rem' }}>{item.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--ink3)' }}>{item.qty} x KES {item.price}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="hl-mono" style={{ fontWeight: 600 }}>KES {item.qty * item.price}</span>
                    <Trash2 size={14} className="text-gray-300 hover:text-red-500 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px dashed var(--border)', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--ink3)', fontSize: '.875rem' }}>Subtotal</span>
                <span className="hl-mono" style={{ fontWeight: 600 }}>KES {total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Total</span>
                <span className="hl-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--forest)' }}>KES {total}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => toast.success('Sale Completed')} className="hl-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>Complete Sale (KES {total})</button>
                <button onClick={() => setCart([])} className="hl-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Clear Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
