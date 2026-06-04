import { useState, useEffect } from 'react'
import { Code, Sparkles, Loader2, Save, Terminal, Wallet, CheckCircle2, AlertTriangle, Info, X, HelpCircle, ExternalLink, Smartphone } from 'lucide-react'
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
        operationalSettings: profile.data.operationalSettings || { taxInclusive: true, autoPrint: false, manualMpesa: { enabled: true, instructions: '' } }
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

  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  if (isLoading) return <div className="p-12 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Developer Console...</div>

  return (
    <FeatureGate feature="mpesa_stk">
      <div className="space-y-8 animate-in fade-in duration-500 pt-6">
        <div className="flex justify-between items-end">
          <div>
              <img src="https://monisnapcontent.kinsta.cloud/wp-content/uploads/2021/09/M-PESA_LOGO-640x467.png?v=1632335437" alt="M-Pesa" className="w-14 h-14 object-contain" />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              M-Pesa Setup
            </h1>
            <p className="text-gray-500 font-medium">Configure API integrations and advanced business logic</p>
          </div>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="group bg-[#0D4A3E] text-white h-14 px-10 rounded-[.5em] font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50 shadow-2xl shadow-emerald-900/20 active:scale-95"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
            Save Integration
          </button>
        </div>

        <div className="bg-white rounded-[.5em] border border-slate-100 shadow-2xl shadow-slate-900/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Sidebar info */}
            <div className="lg:col-span-4 bg-slate-50/50 p-12 border-r border-slate-100">
              <div className="sticky top-12 space-y-10">
                <div>
                  <div className="h-14 w-14 bg-white rounded-[.5em] shadow-lg flex items-center justify-center text-emerald-600 mb-6">
                    <Wallet size={28} />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-black text-slate-900">Direct M-Pesa Gateway</h3>
                    <button onClick={() => setShowHelpModal(true)} className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-emerald-100 hover:text-emerald-600 transition-all cursor-pointer">
                      <Info size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Bypass our system's default payment collection and receive funds directly into your own Paybill number.
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

                <div className="p-6 bg-white rounded-[.5em] border border-slate-100 shadow-sm">
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
                  <div className="flex bg-slate-100 p-1.5 rounded-[.5em] gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, env: 'sandbox' } } })}
                      className={`flex-1 py-4 rounded-[.5em] font-black text-[10px] uppercase tracking-widest transition-all ${formData.operationalSettings?.mpesa?.env === 'sandbox' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Testing (Sandbox)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, env: 'production' } } })}
                      className={`flex-1 py-4 rounded-[.5em] font-black text-[10px] uppercase tracking-widest transition-all ${formData.operationalSettings?.mpesa?.env !== 'sandbox' ? 'bg-[#0D4A3E] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Live (Production)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(() => {
                    const env = formData.operationalSettings?.mpesa?.env === 'sandbox' ? 'sandbox' : 'production';
                    const current = formData.operationalSettings?.mpesa?.[env] || {};
                    
                    const updateField = (field: string, val: string) => {
                      setFormData({
                        ...formData,
                        operationalSettings: {
                          ...formData.operationalSettings,
                          mpesa: {
                            ...formData.operationalSettings?.mpesa,
                            env,
                            [env]: { ...current, [field]: val }
                          }
                        }
                      });
                    };

                    return (
                      <>
                        <div className="md:col-span-2">
                          <InputGroup
                            label={`${env === 'production' ? 'PROD' : 'SANDBOX'} Consumer Key`}
                            placeholder="Enter Daraja Consumer Key"
                            value={current.consumerKey || ''}
                            onChange={(v: string) => updateField('consumerKey', v)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <InputGroup
                            label={`${env === 'production' ? 'PROD' : 'SANDBOX'} Consumer Secret`}
                            type="password"
                            placeholder="Enter Daraja Consumer Secret"
                            value={current.consumerSecret || ''}
                            onChange={(v: string) => updateField('consumerSecret', v)}
                          />
                        </div>
                        <InputGroup
                          label="Business Shortcode"
                          placeholder="Paybill Number"
                          value={current.shortcode || ''}
                          onChange={(v: string) => updateField('shortcode', v)}
                        />
                        <InputGroup
                          label="Passkey / Online Password"
                          type="password"
                          placeholder="LNM Online Passkey"
                          value={current.passkey || ''}
                          onChange={(v: string) => updateField('passkey', v)}
                        />
                      </>
                    );
                  })()}
                </div>

                <div className="bg-amber-50 border border-amber-100 p-6 rounded-[.5em] flex items-start gap-4">
                  <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                  <div>
                    <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Important Configuration</h5>
                    <p className="text-[11px] text-amber-800/80 font-medium leading-relaxed">
                      Ensure your Daraja App has the <strong>Lipa Na M-Pesa Online</strong> API enabled.
                      Transactions will use the Callback URL provided by hlynk automatically.
                    </p>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100" />

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-emerald-600" size={24} />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Manual / Pochi la Biashara</h4>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">If you don't have a Paybill with API access, you can still use M-Pesa recording via Manual mode. Set your instructions below for customers to see during checkout.</p>
                  
                  <div className="space-y-4">
                    <InputGroup
                       label="Payment Instructions"
                       placeholder="e.g. Pay to Pochi 0722 000 000 (John Doe)"
                       value={formData.operationalSettings?.manualMpesa?.instructions || ''}
                       onChange={(v: string) => setFormData({
                         ...formData,
                         operationalSettings: {
                           ...formData.operationalSettings,
                           manualMpesa: { ...formData.operationalSettings?.manualMpesa, instructions: v }
                         }
                       })}
                    />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">These instructions will be displayed to your staff and customers when the "M-Pesa (Manual)" option is selected at checkout.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">How to Setup M-Pesa</h3>
                  <p className="text-sm text-slate-500 font-medium">Follow these steps to connect your Paybill</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-100 hover:text-red-600 transition-all active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-8 overflow-y-auto bg-white flex-1 space-y-8">
              {/* Step 1 */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-6 w-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                  Login to Daraja
                </h4>
                <div className="pl-8 text-sm text-slate-600 font-medium leading-relaxed space-y-3">
                  <p>Go to the official Safaricom Daraja portal and log in. If you don't have an account, create one using your active business credentials.</p>
                  <a href="https://developer.safaricom.co.ke/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-emerald-600 font-black hover:text-emerald-700 transition-colors">
                    Visit Daraja Portal <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-6 w-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                  Create a Production App
                </h4>
                <div className="pl-8 text-sm text-slate-600 font-medium leading-relaxed space-y-3">
                  <p>In the Daraja portal, click on "My Apps" and create a new App.</p>
                  <p>Ensure you select the <strong>Lipa na M-Pesa Sandbox</strong> product first (Safaricom requires starting in sandbox before going live).</p>
                  <div className="bg-slate-50 p-4 rounded-[.5em] border border-slate-100">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2">You will get:</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500">
                      <li><strong className="text-slate-700">Consumer Key</strong></li>
                      <li><strong className="text-slate-700">Consumer Secret</strong></li>
                    </ul>
                    <p className="mt-2 text-xs text-slate-400 italic">Keep these safe, you'll need them in the next step.</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-6 w-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                  Go Live (Production Keys)
                </h4>
                <div className="pl-8 text-sm text-slate-600 font-medium leading-relaxed space-y-3">
                  <p>Click the <strong>Go Live</strong> button on the Daraja portal menu.</p>
                  <p>Fill in your actual business details. When asked for the "Verification Type", select <strong>Shortcode</strong> and enter your actual Paybill number.</p>
                  <p>Once approved by Safaricom, Daraja will generate a new set of <strong>Production Consumer Key</strong> and <strong>Production Consumer Secret</strong>.</p>
                  <p>Copy and paste these new Production keys into the hlynk form.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-6 w-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">4</span>
                  Get Your Passkey
                </h4>
                <div className="pl-8 text-sm text-slate-600 font-medium leading-relaxed space-y-3">
                  <p>During the Go Live approval process, Safaricom sends an email containing a long string called the <strong>Passkey</strong> (or Lipa Na M-Pesa Online Password).</p>
                  <p>Copy this Passkey and paste it into the hlynk form. Make sure you select the "Live (Production)" tab before saving!</p>
                </div>
              </div>

              <div className="h-px w-full bg-slate-100 my-6" />

              {/* Paid Help Section */}
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[.5em] flex items-start gap-4">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-emerald-900 tracking-tight mb-2">Need it done for you?</h5>
                  <p className="text-sm text-emerald-800/80 font-medium leading-relaxed mb-4">
                    Going live on Daraja can be complicated. Our team can securely handle the entire Go Live process and integrate your active Paybill directly into your hlynk portal.
                  </p>
                  <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                    Request Setup Assistance (KES 2,500)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
        className={`w-full bg-slate-50 border border-slate-100 rounded-[.5em] py-4 px-5 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold ${mono ? 'hl-mono' : ''}`}
      />
    </div>
  )
}

import { toast } from 'sonner'
