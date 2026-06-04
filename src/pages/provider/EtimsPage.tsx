import { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, AlertCircle, CheckCircle2, ExternalLink, Loader2, FileText, RefreshCw, RotateCcw, Trash2, Clock, XCircle, ChevronRight, Wifi, WifiOff, Settings2, Info } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { toast } from 'sonner'

const API = import.meta.env.VITE_API_URL || '/api/v1'

type EtimsStatus = 'none' | 'pending' | 'active' | 'error'
interface Credentials { kra_pin: string; branch_id: string; device_serial_number: string; env: string; status: EtimsStatus }
interface EtimsInvoice { id: string; payment_id: string; invoice_number: number | null; kra_receipt_number: string | null; qr_code_url: string | null; status: 'pending' | 'success' | 'failed'; error_message: string | null; created_at: string; totalAmount: number | null; customerName: string | null; paymentMethod: string | null }

const STATUS_BADGE: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  success: { label: 'Synced',  cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={11} /> },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700',     icon: <Clock size={11} /> },
  failed:  { label: 'Failed',  cls: 'bg-red-100 text-red-600',         icon: <XCircle size={11} /> },
}

export default function EtimsPage() {
  const { user } = useAuth()
  const token = (user as any)?.token || localStorage.getItem('token') || ''
  const [creds, setCreds] = useState<Credentials | null>(null)
  const [loadingCreds, setLoadingCreds] = useState(true)
  const [form, setForm] = useState({ kra_pin: '', branch_id: '00', device_serial_number: '', cert_password: '', certificate_b64: '', env: 'sandbox' })
  const [savingCreds, setSavingCreds] = useState(false)
  const [initializingDev, setInitializingDev] = useState(false)
  const [invoices, setInvoices] = useState<EtimsInvoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pushingId, setPushingId] = useState<string | null>(null)

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const loadCredentials = useCallback(async () => {
    setLoadingCreds(true)
    try {
      const res = await fetch(`${API}/etims/credentials`, { headers: authHeaders })
      const data = await res.json()
      if (data.success && data.data) {
        setCreds(data.data)
        setForm(f => ({ ...f, kra_pin: data.data.kra_pin, branch_id: data.data.branch_id, env: data.data.env }))
      } else { setCreds(null) }
    } catch { toast.error('Failed to load eTIMS status') }
    finally { setLoadingCreds(false) }
  }, [])

  const loadInvoices = useCallback(async (p = 1) => {
    setLoadingInvoices(true)
    try {
      const res = await fetch(`${API}/etims/invoices?page=${p}&limit=20`, { headers: authHeaders })
      const data = await res.json()
      if (data.success) { setInvoices(data.data.items); setTotalPages(data.data.pagination.totalPages); setPage(p) }
    } catch { toast.error('Failed to load invoice history') }
    finally { setLoadingInvoices(false) }
  }, [])

  useEffect(() => { loadCredentials() }, [loadCredentials])
  useEffect(() => { if (creds?.status === 'active') loadInvoices(1) }, [creds?.status])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.kra_pin || !form.device_serial_number || !form.cert_password || !form.certificate_b64) { toast.error('KRA PIN, Serial Number, Password, and Certificate are required.'); return }
    setSavingCreds(true)
    try {
      const res = await fetch(`${API}/etims/credentials`, { method: 'POST', headers: authHeaders, body: JSON.stringify(form) })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success(data.message)
      await loadCredentials()
      setShowForm(false)
    } catch (err: any) { toast.error(err.message || 'Failed to save credentials') }
    finally { setSavingCreds(false) }
  }

  const handleInit = async () => {
    setInitializingDev(true)
    try {
      const res = await fetch(`${API}/etims/init`, { method: 'POST', headers: authHeaders })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success('Device activated! eTIMS is now live.')
      await loadCredentials()
      await loadInvoices(1)
    } catch (err: any) { toast.error(err.message || 'Device initialization failed') }
    finally { setInitializingDev(false) }
  }

  const handleDelete = async () => {
    if (!confirm('This will disable eTIMS and remove all credentials. Continue?')) return
    setDeleting(true)
    try {
      const res = await fetch(`${API}/etims/credentials`, { method: 'DELETE', headers: authHeaders })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success('eTIMS disabled.')
      setCreds(null); setInvoices([])
    } catch (err: any) { toast.error(err.message) }
    finally { setDeleting(false) }
  }

  const handlePush = async (saleId: string) => {
    setPushingId(saleId)
    try {
      const res = await fetch(`${API}/etims/invoices/${saleId}`, { method: 'POST', headers: authHeaders })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success('Invoice re-pushed to KRA.')
      await loadInvoices(page)
    } catch (err: any) { toast.error(err.message) }
    finally { setPushingId(null) }
  }

  if (loadingCreds) return (
    <div className="max-w-4xl mx-auto flex items-center justify-center py-32">
      <Loader2 size={28} className="animate-spin text-slate-300" />
    </div>
  )

  const isActive  = creds?.status === 'active'
  const isPending = creds?.status === 'pending'
  const isError   = creds?.status === 'error'

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-5">
          {/* etims image */}
          <div>
          <img src="https://etims.kra.go.ke/assets/images/logo.jpg" alt="eTIMS" className="w-14 h-14 object-contain mix-blend-darken" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">KRA eTIMS Integration</h1>
            <p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">Connect your KRA System-to-System credentials to automatically push compliant tax invoices to KRA on every sale.</p>
          </div>
        </div>
        {creds && (
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 text-xs font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors shrink-0">
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Disable
          </button>
        )}
      </div>

      {/* Status Banner */}
      <div className={`flex items-center gap-4 px-5 py-4 rounded-[.5rem] border ${isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : isError ? 'bg-red-50 border-red-200 text-red-800' : isPending ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
        {isActive ? <Wifi size={18} className="shrink-0 text-emerald-600" /> : isError ? <WifiOff size={18} className="shrink-0 text-red-500" /> : isPending ? <Clock size={18} className="shrink-0 text-blue-500" /> : <AlertCircle size={18} className="shrink-0 text-amber-600" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-widest">
            {isActive ? `eTIMS Active — invoices auto-sync to KRA (${creds?.env})` : isError ? 'eTIMS Error — device initialization failed. Re-initialize below.' : isPending ? `Credentials saved (${creds?.env}) — initialize your device to go live.` : 'eTIMS not configured. Enter your KRA credentials below.'}
          </p>
          {creds && <p className="text-[10px] mt-0.5 opacity-70">KRA PIN: {creds.kra_pin} | Branch: {creds.branch_id}</p>}
        </div>
      </div>

      {/* Not configured */}
      {!creds && !showForm && (
        <div className="bg-slate-50 border border-slate-100 rounded-[.5rem] p-6 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Before You Start</p>
          <ol className="space-y-2 text-sm text-slate-600 font-medium list-decimal list-inside">
            <li>Your business must be registered with KRA and have a valid KRA PIN.</li>
            <li>Apply for <span className="font-black text-slate-800">System-to-System (OSCU)</span> integration from the KRA eTIMS portal.</li>
            <li>KRA will issue you a <span className="font-black text-slate-800">Device Serial Number</span> and confirm your credentials.</li>
            <li>Use <span className="font-black text-slate-800">Sandbox</span> for testing, <span className="font-black text-slate-800">Production</span> when live.</li>
          </ol>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-[#0D4A3E] text-white rounded-[.4rem] text-xs font-black uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-md">
              <Settings2 size={14} /> Set Up eTIMS
            </button>
            <a href="https://etims.kra.go.ke" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-widest transition-colors">
              <ExternalLink size={13} /> KRA Portal
            </a>
          </div>
        </div>
      )}

      {/* Credentials Form */}
      {(!creds || showForm) && (
        <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-[.5rem] p-8 space-y-6 shadow-sm relative">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{creds ? 'Update KRA Credentials' : 'Your KRA Credentials'}</p>
              <button type="button" onClick={() => setShowGuide(!showGuide)} className="text-blue-500 hover:text-blue-700 transition-colors" title="How do I get these?">
                <Info size={16} />
              </button>
            </div>
            {showForm && <button type="button" onClick={() => setShowForm(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>}
          </div>

          {showGuide && (
            <div className="bg-blue-50 border border-blue-200 rounded-[.5rem] p-5 text-sm text-blue-800 space-y-2 mb-4">
              <h4 className="font-black flex items-center gap-2"><Info size={16}/> How to get these credentials</h4>
              <ol className="list-decimal list-inside space-y-1.5 opacity-90 pl-1">
                <li>Log into the <a href="https://etims.kra.go.ke" target="_blank" className="font-bold underline">KRA eTIMS Portal</a> using your PIN.</li>
                <li>Go to <strong>Service Request</strong> &rarr; <strong>eTIMS Registration</strong>.</li>
                <li>Select <strong>System to System (OSCU)</strong> as your eTIMS Type.</li>
                <li>Wait for KRA to approve your request (usually takes 12-24 hours).</li>
                <li>Once approved, go to <strong>Device Management</strong> to download your <span className="font-bold">.pfx Certificate</span> and view your <span className="font-bold">Serial Number</span>.</li>
              </ol>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment</label>
            <div className="flex gap-3">
              {(['sandbox', 'production'] as const).map(env => (
                <button key={env} type="button" onClick={() => setForm({ ...form, env })}
                  className={`flex-1 py-3 rounded-[.4rem] text-xs font-black uppercase tracking-widest border-2 transition-all ${form.env === env ? (env === 'production' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-blue-500 bg-blue-50 text-blue-800') : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                  {env}
                </button>
              ))}
            </div>
            {form.env === 'production' && <p className="text-[10px] text-amber-600 font-bold">⚠️ Production mode — invoices will be submitted to KRA for real.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'KRA PIN *', key: 'kra_pin', placeholder: 'e.g. P051234567X', transform: (v: string) => v.toUpperCase() },
              { label: 'Branch ID', key: 'branch_id', placeholder: 'e.g. 00' },
              { label: 'Device Serial Number *', key: 'device_serial_number', placeholder: 'Issued by KRA' },
              { label: 'Certificate Password *', key: 'cert_password', placeholder: 'Your certificate password', type: 'password' },
            ].map(({ label, key, placeholder, type, transform }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                <input type={type || 'text'} placeholder={placeholder} value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: transform ? transform(e.target.value) : e.target.value })}
                  className="w-full border border-slate-200 rounded-[.4rem] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" />
              </div>
            ))}
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KRA Certificate (.pfx / .p12) *</label>
              <input type="file" accept=".pfx,.p12"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const base64String = (ev.target?.result as string).split(',')[1];
                      setForm(f => ({ ...f, certificate_b64: base64String }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full border border-slate-200 rounded-[.4rem] px-4 py-2 text-sm text-slate-800 outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-[1px] file:border-emerald-200 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all" />
              {form.certificate_b64 && <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Certificate loaded successfully</p>}
            </div>
          </div>

          <button type="submit" disabled={savingCreds} className="flex items-center gap-2 px-8 py-3.5 bg-[#0D4A3E] text-white rounded-[.4rem] text-xs font-black uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50">
            {savingCreds ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            {savingCreds ? 'Saving...' : 'Save Credentials'}
          </button>
        </form>
      )}

      {/* Pending — Initialize */}
      {(isPending || isError) && !showForm && (
        <div className="bg-white border border-slate-100 rounded-[.5rem] p-8 space-y-4 shadow-sm">
          <p className="text-sm font-black text-slate-800">Step 2: Activate Device with KRA</p>
          <p className="text-sm text-slate-500">Your credentials are saved. Click below to send them to KRA and receive your <span className="font-bold text-slate-700">Communication Key</span>. This only needs to be done once.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleInit} disabled={initializingDev} className="flex items-center gap-2 px-8 py-3.5 bg-[#0D4A3E] text-white rounded-[.4rem] text-xs font-black uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-md disabled:opacity-50">
              {initializingDev ? <Loader2 size={15} className="animate-spin" /> : <Wifi size={15} />}
              {initializingDev ? 'Connecting to KRA...' : 'Initialize Device'}
            </button>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-[.4rem] text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
              <Settings2 size={13} /> Edit Credentials
            </button>
          </div>
        </div>
      )}

      {/* Active — Invoice History */}
      {isActive && !showForm && (
        <div className="bg-white border border-slate-100 rounded-[.5rem] shadow-sm">
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
            <div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Invoice Sync History</p>
              <p className="text-[10px] text-slate-400 mt-0.5">All sales are automatically pushed to KRA on completion.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
              </span>
              <button onClick={() => loadInvoices(page)} disabled={loadingInvoices} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <RefreshCw size={14} className={loadingInvoices ? 'animate-spin' : ''} />
              </button>
              <button onClick={() => setShowForm(true)} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors" title="Edit credentials">
                <Settings2 size={14} />
              </button>
            </div>
          </div>

          {loadingInvoices ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-300" /></div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <FileText size={40} className="text-slate-200 mb-4" />
              <p className="text-sm font-black text-slate-400">No invoices synced yet.</p>
              <p className="text-xs text-slate-400 mt-1">Your next completed sale will automatically generate a KRA-compliant invoice.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['#', 'Sale', 'Customer', 'Amount', 'KRA Receipt', 'Status', ''].map(h => (
                      <th key={h} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => {
                    const badge = STATUS_BADGE[inv.status] || STATUS_BADGE.pending
                    return (
                      <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{inv.invoice_number ?? '—'}</td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-slate-800">#{inv.payment_id.slice(-6).toUpperCase()}</p>
                          <p className="text-[10px] text-slate-400">{new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">{inv.customerName || '—'}</td>
                        <td className="px-6 py-4 text-xs font-black text-slate-800">{inv.totalAmount != null ? `KES ${Number(inv.totalAmount).toLocaleString()}` : '—'}</td>
                        <td className="px-6 py-4">
                          {inv.kra_receipt_number ? <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{inv.kra_receipt_number}</span> : <span className="text-xs text-slate-400">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${badge.cls}`}>{badge.icon} {badge.label}</span>
                          {inv.error_message && <p className="text-[9px] text-red-400 mt-0.5 max-w-[160px] truncate" title={inv.error_message}>{inv.error_message}</p>}
                        </td>
                        <td className="px-6 py-4">
                          {inv.status !== 'success' && (
                            <button onClick={() => handlePush(inv.payment_id)} disabled={pushingId === inv.payment_id} className="flex items-center gap-1 text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors disabled:opacity-40">
                              {pushingId === inv.payment_id ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />} Retry
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-slate-100">
                  <button onClick={() => loadInvoices(page - 1)} disabled={page <= 1} className="text-xs font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30">← Prev</button>
                  <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                  <button onClick={() => loadInvoices(page + 1)} disabled={page >= totalPages} className="text-xs font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30 flex items-center gap-1">Next <ChevronRight size={12} /></button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
