import { useState, useEffect } from 'react'
import { Code, Sparkles, Loader2, Save, Terminal } from 'lucide-react'
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
            className="bg-[#0D4A3E] text-white h-12 px-8 rounded-xl font-black text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2 disabled:opacity-50 shadow-xl shadow-emerald-900/10"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Apply Changes
          </button>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-10">
          <div className="space-y-12">
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Vendor M-Pesa Gateway
              </h4>
              <p className="text-[11px] text-gray-500 mb-8 font-medium max-w-lg leading-relaxed">
                Enter your Daraja API credentials to receive payments directly to your Till or Paybill number via STK Push. 
                Ensure your callback URL is correctly configured in the Daraja portal.
              </p>
              
              <div className="space-y-6 max-w-2xl bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, env: 'sandbox' } } })}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.operationalSettings?.mpesa?.env !== 'production' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white border border-slate-200 text-slate-400'}`}
                  >Sandbox</button>
                  <button
                    onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, env: 'production' } } })}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.operationalSettings?.mpesa?.env === 'production' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/20' : 'bg-white border border-slate-200 text-slate-400'}`}
                  >Production</button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                   <InputGroup
                    label="Consumer Key"
                    value={formData.operationalSettings?.mpesa?.consumerKey || ''}
                    onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, consumerKey: v } } })}
                  />
                  <InputGroup
                    label="Consumer Secret"
                    type="password"
                    value={formData.operationalSettings?.mpesa?.consumerSecret || ''}
                    onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, consumerSecret: v } } })}
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <InputGroup
                      label="Shortcode"
                      value={formData.operationalSettings?.mpesa?.shortcode || ''}
                      onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, shortcode: v } } })}
                    />
                    <InputGroup
                      label="Passkey"
                      type="password"
                      value={formData.operationalSettings?.mpesa?.passkey || ''}
                      onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, passkey: v } } })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* <FeatureGate feature="ai_analyst">
              <div className="pt-12 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  AI Intelligence Engine
                </h4>
                <p className="text-[11px] text-gray-500 mb-8 font-medium max-w-lg leading-relaxed">
                  Configure your preferred AI model to power the business analyst workspace. 
                  We support OpenAI, Anthropic, and Google Gemini models.
                </p>
                
                <div className="space-y-6 max-w-2xl bg-emerald-50/20 p-10 rounded-[40px] border border-emerald-100/50">
                  <div className="flex flex-wrap gap-3 mb-8">
                    {['none', 'openai', 'anthropic', 'gemini'].map(p => (
                      <button
                        key={p}
                        onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, ai: { ...formData.operationalSettings?.ai, provider: p } } })}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                          (formData.operationalSettings?.ai?.provider || 'none') === p 
                          ? 'bg-[#0D4A3E] text-white shadow-xl shadow-emerald-900/20' 
                          : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {(formData.operationalSettings?.ai?.provider && formData.operationalSettings?.ai?.provider !== 'none') && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-700">
                      <InputGroup
                        label={`${formData.operationalSettings.ai.provider.toUpperCase()} API Key`}
                        type="password"
                        placeholder="sk-..."
                        value={formData.operationalSettings?.ai?.apiKey || ''}
                        onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, ai: { ...formData.operationalSettings?.ai, apiKey: v } } })}
                      />
                      <div className="flex items-center gap-3 p-4 bg-white/50 rounded-2xl border border-white">
                         <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Sparkles size={14} />
                         </div>
                         <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">
                            Enterprise-grade encryption active. Your keys are never visible to system admins.
                         </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FeatureGate> */}
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
