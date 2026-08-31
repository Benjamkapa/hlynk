import { useState, useEffect } from 'react'
import { Loader2, Save, Wallet, CheckCircle2, AlertTriangle, Info, X, HelpCircle, Smartphone } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { providersApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FeatureGate from '../../components/shared/FeatureGate'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export default function DeveloperPage() {
  const { refreshUser } = useAuth()
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

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'mpesa' | 'kcb'>(searchParams.get('tab') === 'kcb' ? 'kcb' : 'mpesa');
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'kcb') setActiveTab('kcb');
    else setActiveTab('mpesa');
  }, [searchParams]);

  const handleTabChange = (tab: 'mpesa' | 'kcb') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D4A3E] border-t-transparent" />
    </div>
  )

  return (
    <FeatureGate feature="mpesa_stk">
      <div className="space-y-8 pt-4">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/960px-M-PESA_LOGO-01.svg.png?_=20251215193002" alt="M-Pesa" className={`w-9 h-9 object-contain transition-opacity duration-300 ${activeTab === 'mpesa' ? 'opacity-100' : 'opacity-30'}`} />
              <div className="h-6 w-px bg-gray-200" />
              <FeatureGate feature="kcb_settlement" variant="inline" badge="Coming soon" badgeColor="bg-amber-50 text-amber-600">
                <img src="https://buni.kcbgroup.com/_nuxt/logo.71b8fc4b.svg" alt="KCB" className={`w-9 h-9 object-contain transition-opacity duration-300 ${activeTab === 'kcb' ? 'opacity-100' : 'opacity-30'}`} />
              </FeatureGate>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Payment gateway</h1>
            <p className="text-gray-400 text-sm mt-0.5">Configure direct-to-merchant settlements</p>
          </div>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-[#0D4A3E] text-white h-9 px-4 rounded-[.5rem] text-sm font-medium hover:bg-[#0A3D33] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
            Save integration
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 p-1 rounded-[.5rem] w-fit border border-gray-100">
          <button
            onClick={() => handleTabChange('mpesa')}
            className={`px-5 py-2 rounded-[.5rem] text-xs font-medium transition-colors ${activeTab === 'mpesa' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Safaricom Daraja
          </button>
          <FeatureGate feature="kcb_settlement" variant="inline">
            <button
              onClick={() => handleTabChange('kcb')}
              className={`px-5 py-2 rounded-[.5rem] text-xs font-medium transition-colors ${activeTab === 'kcb' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              KCB Bank Buni
            </button>
          </FeatureGate>
        </div>

        <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Sidebar info */}
            <div className="lg:col-span-4 bg-gray-50/60 p-8 border-r border-gray-100">
              <div className="sticky top-8 space-y-8">
                <div>
                  <div className="h-10 w-10 bg-white rounded-[.5rem] border border-gray-100 flex items-center justify-center text-[#0D4A3E] mb-4">
                    <Wallet size={18} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Direct {activeTab === 'mpesa' ? 'M-Pesa' : 'KCB Mobile'} gateway</h3>
                    <button onClick={() => setShowHelpModal(true)} className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                      <Info size={11} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {activeTab === 'mpesa'
                      ? "Bypass our system's default payment collection and receive funds directly into your own Paybill number."
                      : "Connect your KCB Merchant API keys to receive payments directly to your bank account via STK push."}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3 items-center">
                    <CheckCircle2 size={14} className="text-[#0D4A3E] flex-shrink-0" />
                    <p className="text-xs text-gray-600">Instant settlement</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <CheckCircle2 size={14} className="text-[#0D4A3E] flex-shrink-0" />
                    <p className="text-xs text-gray-600">Custom branding on STK</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <CheckCircle2 size={14} className="text-[#0D4A3E] flex-shrink-0" />
                    <p className="text-xs text-gray-600">Automated reconciliation</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-[.5rem] border border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <p className="text-xs text-gray-400">Security protocol</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-normal">
                    Your {activeTab === 'mpesa' ? 'Consumer Secret and Passkey' : 'Client ID and Secret'} are encrypted using AES-256 before storage.
                  </p>
                </div>
              </div>
            </div>

            {/* Form area */}
            <div className="lg:col-span-8 p-8">
              <div className="max-w-2xl space-y-8">
                {activeTab === 'mpesa' ? (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 mb-3 block">Environment selection</label>
                      <div className="flex bg-gray-50 p-1 rounded-[.5rem] gap-1 border border-gray-100">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, env: 'sandbox' } } })}
                          className={`flex-1 py-2.5 rounded-[.5rem] text-xs font-medium transition-colors ${formData.operationalSettings?.mpesa?.env === 'sandbox' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Testing (Sandbox)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, env: 'production' } } })}
                          className={`flex-1 py-2.5 rounded-[.5rem] text-xs font-medium transition-colors ${formData.operationalSettings?.mpesa?.env !== 'sandbox' ? 'bg-[#0D4A3E] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Live (Production)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                label={`${env === 'production' ? 'Prod' : 'Sandbox'} consumer key`}
                                placeholder="Enter Daraja Consumer Key"
                                value={current.consumerKey || ''}
                                onChange={(v: string) => updateField('consumerKey', v)}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <InputGroup
                                label={`${env === 'production' ? 'Prod' : 'Sandbox'} consumer secret`}
                                type="password"
                                placeholder="Enter Daraja Consumer Secret"
                                value={current.consumerSecret || ''}
                                onChange={(v: string) => updateField('consumerSecret', v)}
                              />
                            </div>
                            <InputGroup
                              label="Business shortcode"
                              placeholder="Paybill Number"
                              value={current.shortcode || ''}
                              onChange={(v: string) => updateField('shortcode', v)}
                            />
                            <InputGroup
                              label="Passkey / online password"
                              type="password"
                              placeholder="LNM Online Passkey"
                              value={current.passkey || ''}
                              onChange={(v: string) => updateField('passkey', v)}
                            />
                          </>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 mb-3 block">KCB Buni environment</label>
                      <div className="flex bg-gray-50 p-1 rounded-[.5rem] gap-1 border border-gray-100">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, kcb: { ...formData.operationalSettings?.kcb, env: 'sandbox' } } })}
                          className={`flex-1 py-2.5 rounded-[.5rem] text-xs font-medium transition-colors ${formData.operationalSettings?.kcb?.env === 'sandbox' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Testing (Sandbox)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, kcb: { ...formData.operationalSettings?.kcb, env: 'production' } } })}
                          className={`flex-1 py-2.5 rounded-[.5rem] text-xs font-medium transition-colors ${formData.operationalSettings?.kcb?.env !== 'sandbox' ? 'bg-[#0D4A3E] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Live (Production)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {(() => {
                        const env = formData.operationalSettings?.kcb?.env === 'sandbox' ? 'sandbox' : 'production';
                        const current = formData.operationalSettings?.kcb?.[env] || {};

                        const updateField = (field: string, val: string) => {
                          setFormData({
                            ...formData,
                            operationalSettings: {
                              ...formData.operationalSettings,
                              kcb: {
                                ...formData.operationalSettings?.kcb,
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
                                label={`${env === 'production' ? 'Prod' : 'Sandbox'} consumer key`}
                                placeholder="Enter KCB Consumer Key"
                                value={current.consumerKey || ''}
                                onChange={(v: string) => updateField('consumerKey', v)}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <InputGroup
                                label={`${env === 'production' ? 'Prod' : 'Sandbox'} consumer secret`}
                                type="password"
                                placeholder="Enter KCB Consumer Secret"
                                value={current.consumerSecret || ''}
                                onChange={(v: string) => updateField('consumerSecret', v)}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </>
                )}

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-[.5rem] flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0" size={16} />
                  <div>
                    <h5 className="text-xs font-medium text-amber-900 mb-1">Important configuration</h5>
                    <p className="text-xs text-amber-800/80 leading-relaxed">
                      {activeTab === 'mpesa'
                        ? "Ensure your Daraja App has the Lipa Na M-Pesa Online API enabled."
                        : "Ensure you have subscribed to the Mobile Checkout API in the KCB Buni portal."}
                    </p>
                  </div>
                </div>

                {activeTab === 'mpesa' && (
                  <>
                    <div className="h-px w-full bg-gray-100" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="text-[#0D4A3E]" size={16} />
                        <h4 className="text-sm font-medium text-gray-900">Manual / Pochi la Biashara</h4>
                      </div>
                      <p className="text-xs text-gray-500">If you don't have a Paybill with API access, you can still use M-Pesa recording via Manual mode.</p>

                      <InputGroup
                        label="Payment instructions"
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
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[.5rem] shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-white border border-gray-100 text-[#0D4A3E] rounded-full flex items-center justify-center">
                  <HelpCircle size={17} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Setup guide</h3>
                  <p className="text-sm text-gray-400">Follow these steps to connect your account</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-white flex-1 space-y-6">
              {activeTab === 'mpesa' ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <span className="h-5 w-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                    Login to Daraja
                  </h4>
                  <p className="pl-7 text-sm text-gray-600 leading-relaxed">
                    Go to <a href="https://developer.safaricom.co.ke/" target="_blank" rel="noreferrer" className="text-[#0D4A3E] font-medium">developer.safaricom.co.ke</a> and create a production app.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <span className="h-5 w-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                      Register on KCB Buni
                    </h4>
                    <p className="pl-7 text-sm text-gray-600 leading-relaxed">
                      Visit the <a href="https://sandbox.buni.kcbgroup.com/devportal/apis" target="_blank" rel="noreferrer" className="text-[#0D4A3E] font-medium">KCB Buni Developer Portal</a> and create an account.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <span className="h-5 w-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                      Subscribe to Mobile Checkout
                    </h4>
                    <p className="pl-7 text-sm text-gray-600 leading-relaxed">
                      Find the <strong>Mobile Checkout</strong> API and subscribe to it using your business application.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </FeatureGate>
  )
}

function InputGroup({ label, value, onChange, placeholder, type = "text", mono = false }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm ${mono ? 'hl-mono' : ''}`}
      />
    </div>
  )
}