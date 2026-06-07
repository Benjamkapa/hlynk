import { Printer } from 'lucide-react'

export interface ThermalReceiptProps {
  sale: any;
}

export const thermalReceiptStyles = `
  .receipt-font { font-family: 'Share Tech Mono', 'Courier New', monospace; }
  .receipt-header { text-align: center; }
  .receipt-dashed { border-top: 1px dashed #999; margin: 8px 0; }
  @media print {
    @page { size: 80mm auto; margin: 0; }
    body * { visibility: hidden !important; }
    #thermal-receipt, #thermal-receipt * { visibility: visible !important; }
    #thermal-receipt {
      position: fixed !important;
      inset: 0 !important;
      width: 80mm !important;
      margin: 0 auto !important;
      padding: 0 !important;
      font-family: 'Share Tech Mono', 'Courier New', monospace !important;
      font-size: 11px !important;
      line-height: 1.5 !important;
      color: #000 !important;
      background: #fff !important;
    }
  }
`;

const getStatusLabel = (status: any) => {
  const s = Number(status);
  if (s === 0) return 'Success';
  if (s === 2) return 'Pending';
  if (s === 3) return 'Cancelled';
  if (s === 1) return 'Failed';
  return 'Success';
};

export default function ThermalReceipt({ sale }: ThermalReceiptProps) {
  const subtotal = sale.items?.reduce((acc: number, item: any) => acc + Number(item.price) * item.quantity, 0) ?? Number(sale.totalAmount)

  const handlePrint = () => window.print()

  return (
    <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <style>{thermalReceiptStyles}</style>

      {/* Paper receipt card */}
      <div
        id="thermal-receipt"
        className="receipt-font bg-white text-black shadow-2xl shadow-gray-400/30 relative"
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '20px 18px 28px',
          fontSize: 11,
          lineHeight: 1.65,
          borderRadius: '2px 2px 0 0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 1px 0 rgba(0,0,0,0.05)',
        }}
      >
        {/* Torn top edge */}
        <div style={{ position: 'absolute', top: -6, left: 0, right: 0, height: 6, background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'6\'%3E%3Cpath d=\'M0 6 Q5 0 10 6 Q15 0 20 6\' fill=\'%23fff\' stroke=\'%23e5e7eb\' stroke-width=\'1\'/%3E%3C/svg%3E") repeat-x bottom', }} />

        {/* Store header */}
        <div style={{ textAlign: 'center', marginBottom: 14, borderBottom: '1px dashed #999', paddingBottom: 12 }}>
          {/* <img src="/logo.png" alt="Logo" style={{ height: 36, margin: '0 auto 6px', display: 'block', filter: 'grayscale(100%)' }} /> */}
          <div style={{ fontWeight: 'black', fontSize: 18, letterSpacing: '-0.02em', marginBottom: 2 }}>hlynk</div>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: '#555', marginTop: 4 }}>— OFFICIAL RECEIPT —</div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#666', marginBottom: 10 }}>
          <div>
            <div style={{ color: '#999', fontSize: 8, letterSpacing: '0.1em' }}>RECEIPT</div>
            <div style={{ fontWeight: 'bold', color: '#000' }}>#{sale.id?.slice(-8).toUpperCase()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#999', fontSize: 8, letterSpacing: '0.1em' }}>DATE</div>
            <div>{new Date(sale.createdAt || Date.now()).toLocaleDateString()}</div>
            <div>{new Date(sale.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#666', marginBottom: 12, paddingBottom: 10, borderBottom: '1px dashed #bbb' }}>
          <div>
            <div style={{ color: '#999', fontSize: 8, letterSpacing: '0.1em' }}>CUSTOMER</div>
            <div style={{ color: '#000', fontWeight: 'bold' }}>{sale.customerName || 'Walk-in'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#999', fontSize: 8, letterSpacing: '0.1em' }}>SERVED BY</div>
            <div style={{ color: '#000' }}>{sale.user?.name || 'Operator'}</div>
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#aaa', letterSpacing: '0.1em', marginBottom: 6 }}>
          <span style={{ flex: 1 }}>ITEM</span>
          <span style={{ width: 28, textAlign: 'center' }}>QTY</span>
          <span style={{ width: 48, textAlign: 'center' }}>PRICE</span>
          <span style={{ width: 52, textAlign: 'right' }}>TOTAL</span>
        </div>

        {/* Line items */}
        <div style={{ borderBottom: '1px dashed #bbb', paddingBottom: 10, marginBottom: 10 }}>
          {sale.items?.map((item: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
              <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingRight: 4 }}>
                {item.name}
              </span>
              <span style={{ width: 28, textAlign: 'center', color: '#555' }}>{item.quantity}</span>
              <span style={{ width: 48, textAlign: 'center', color: '#555' }}>{Number(item.price).toLocaleString()}</span>
              <span style={{ width: 52, textAlign: 'right', fontWeight: 'bold' }}>
                {(Number(item.price) * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Totals block */}
        <div style={{ fontSize: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 3 }}>
            <span>NET TOTAL</span><span>KES {(subtotal / 1.16).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 3 }}>
            <span>16.0% VAT</span><span>KES {(subtotal - (subtotal / 1.16)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000', fontWeight: 'bold', borderTop: '0.5px solid #eee', paddingTop: 6, marginBottom: 6 }}>
            <span>SUBTOTAL</span><span>KES {subtotal.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 6, alignItems: 'center' }}>
            <span>STATUS</span>
            <span style={{ 
              fontSize: 8, 
              padding: '2px 8px', 
              borderRadius: 4, 
              fontWeight: 900, 
              textTransform: 'uppercase',
              color: sale.status === 0 ? '#059669' : '#DC2626',
              background: sale.status === 0 ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${sale.status === 0 ? '#10B981' : '#F87171'}`
            }}>
              {getStatusLabel(sale.status)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 6 }}>
            <span>METHOD</span>
            <span style={{ background: '#000', color: '#fff', padding: '0 6px', borderRadius: 2, fontSize: 8, letterSpacing: '0.1em' }}>
              {sale.paymentMethod}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontWeight: 'bold', 
            fontSize: 16, 
            borderTop: '2px solid #000', 
            paddingTop: 8, 
            marginTop: 4,
          }}>
            <span>TOTAL DUE</span><span>KES {Number(sale.totalAmount).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px dashed #bbb', paddingTop: 12, textAlign: 'center', fontSize: 9, color: '#888', lineHeight: 1.8 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.15em', marginBottom: 4 }}>* * * THANK YOU * * *</div>
          <div>Please keep this receipt for your records.</div>
          <div style={{ marginTop: 8, fontSize: 8, letterSpacing: '0.05em', color: '#bbb' }}>
            {new Date(sale.createdAt || Date.now()).toISOString()}
          </div>
        </div>

        {/* Tear-off bottom edge */}
        <div style={{ position: 'absolute', bottom: -6, left: 0, right: 0, height: 6, background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'6\'%3E%3Cpath d=\'M0 0 Q5 6 10 0 Q15 6 20 0\' fill=\'%23fff\' stroke=\'%23e5e7eb\' stroke-width=\'1\'/%3E%3C/svg%3E") repeat-x top', }} />
      </div>

      {/* Action buttons */}
      <div className="no-print flex gap-3 w-full" style={{ maxWidth: 320 }}>
        <button
          onClick={handlePrint}
          className="h-12 px-5 bg-gray-100 text-gray-600 rounded-[.5rem] mx-auto font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
        >
          <Printer size={15} /> Print Receipt
        </button>
      </div>
    </div>
  )
}
