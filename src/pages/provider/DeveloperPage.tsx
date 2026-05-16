import { useState, useEffect } from 'react'
import { Code, Sparkles, Loader2, Save, Terminal, Wallet, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { providersApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FeatureGate from '../../components/shared/FeatureGate'

export default function DeveloperPage() {
  const { user, refreshUser } = useAuth()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile
  })

  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (profile?.data) {
      setFormData({
        operationalSettings: profile.data.operationalSettings || { taxInclusive: true, autoPrint: false }
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: providersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      refreshUser()
      toast.success('Developer settings saved')
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  if (isLoading) return <div className="p-12 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Developer Console...</div>

  return (
    <FeatureGate feature="mpesa_stk">
      <div className="space-y-8 animate-in fade-in duration-500 pt-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Terminal className="text-emerald-600" size={32} />
              Developer Console
            </h1>
            <p className="text-gray-500 font-medium">Configure API integrations and advanced business logic</p>
          </div>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="group bg-[#0D4A3E] text-white h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50 shadow-2xl shadow-emerald-900/20 active:scale-95"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
            Save Integration
          </button>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-900/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Sidebar info */}
            <div className="lg:col-span-4 bg-slate-50/50 p-12 border-r border-slate-100">
              <div className="sticky top-12 space-y-10">
                <div>
                  <div className="h-14 w-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-emerald-600 mb-6">
                    <Wallet size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4">Direct M-Pesa Gateway</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Bypass our system's default payment collection and receive funds directly into your own Paybill or Till number.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Instant Settlement</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Custom Branding on STK</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Automated Reconciliation</p>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Protocol</p>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-normal">
                    Your Consumer Secret and Passkey are encrypted using AES-256 before storage. Not even our developers can view your raw keys.
                  </p>
                </div>
              </div>
            </div>

            {/* Form area */}
            <div className="lg:col-span-8 p-12">
              <div className="max-w-2xl space-y-12">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 block">Environment Selection</label>
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1.5">
                    <button
                      onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, env: 'sandbox' } } })}
                      className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.operationalSettings?.mpesa?.env !== 'production' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Testing (Sandbox)
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, env: 'production' } } })}
                      className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.operationalSettings?.mpesa?.env === 'production' ? 'bg-[#0D4A3E] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Live (Production)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <InputGroup
                      label="Consumer Key"
                      placeholder="Enter Daraja Consumer Key"
                      value={formData.operationalSettings?.mpesa?.consumerKey || ''}
                      onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, consumerKey: v } } })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <InputGroup
                      label="Consumer Secret"
                      type="password"
                      placeholder="Enter Daraja Consumer Secret"
                      value={formData.operationalSettings?.mpesa?.consumerSecret || ''}
                      onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, consumerSecret: v } } })}
                    />
                  </div>
                  <InputGroup
                    label="Business Shortcode"
                    placeholder="Paybill or Till Number"
                    value={formData.operationalSettings?.mpesa?.shortcode || ''}
                    onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, shortcode: v } } })}
                  />
                  <InputGroup
                    label="Passkey / Online Password"
                    type="password"
                    placeholder="LNM Online Passkey"
                    value={formData.operationalSettings?.mpesa?.passkey || ''}
                    onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, passkey: v } } })}
                  />
                </div>

                <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
                  <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                  <div>
                    <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Important Configuration</h5>
                    <p className="text-[11px] text-amber-800/80 font-medium leading-relaxed">
                      Ensure your Daraja App has the <strong>Lipa Na M-Pesa Online</strong> API enabled.
                      Transactions will use the Callback URL provided by HudumaLynk automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  )
}

function InputGroup({ label, value, onChange, placeholder, type = "text", mono = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold ${mono ? 'hl-mono' : ''}`}
      />
    </div>
  )
}

import { toast } from 'sonner'
