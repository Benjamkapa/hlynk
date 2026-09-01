import { useState, useEffect, useRef } from 'react'
import { Settings, Shield, Bell, Globe, Database, Cpu, Lock, Save, Key, UserCheck, ShieldAlert, ShieldCheck, User, Camera, Loader2, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')
  const [formState, setFormState] = useState<Record<string, string>>({})
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
    }
  }, [user])
  const { data: res, error } = useQuery<any>({
    queryKey: ['admin-settings'],
    queryFn: adminApi.getSettings
  })

  useEffect(() => {
    if (res?.data) {
      setFormState(res.data)
    }
    if (error) toast.error('Failed to load system settings')
  }, [res, error])

  const setField = (key: string, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }))
  }

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateSettings(formState),

    onSuccess: () => {
      toast.success('System configurations synchronized')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: () => toast.error('Failed to update settings')
  })

  const profileMutation = useMutation({
    mutationFn: () => adminApi.updateProfile(profileForm),
    onSuccess: () => {
      toast.success('Profile updated successfully')
      refreshUser()
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await adminApi.uploadPhoto(file)
      await refreshUser()
      toast.success('Profile photo updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = () => {
    if (activeTab === 'Profile') {
      profileMutation.mutate()
    } else {
      updateMutation.mutate()
    }
  }

  const tabs = [
    { name: 'Profile', icon: User, desc: 'Personal info & avatar' },
    { name: 'General', icon: Settings, desc: 'Global platform configs' },
    { name: 'Security', icon: Shield, desc: 'Auth & Access control' },
    { name: 'Notifications', icon: Bell, desc: 'Email & SMS alerts' },
    { name: 'Regional', icon: Globe, desc: 'Taxes & Currencies' },
    { name: 'Infrastructure', icon: Cpu, desc: 'API & Performance' },
  ]

  return (
    <div className="space-y-8 pt-4 animate-in fade-in duration-700">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">System-wide configuration and administrative controls</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={updateMutation.isPending || profileMutation.isPending}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white h-10 px-4 rounded-md font-bold text-xs hover:bg-emerald-700 transition-all disabled:opacity-60"
        >
          <Save size={14} /> {updateMutation.isPending || profileMutation.isPending ? 'Syncing...' : 'Deploy Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:w-[280px] space-y-6">
          <div className="bg-white p-3 rounded-[.5rem] border border-slate-100">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all group ${
                  activeTab === tab.name 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`h-9 w-9 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                  activeTab === tab.name ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-400 group-hover:bg-white'
                }`}>
                  <tab.icon size={16} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black">{tab.name}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === tab.name ? 'text-slate-400' : 'text-slate-400'}`}>{tab.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-emerald-900 rounded-[.5rem] p-6 text-white relative overflow-hidden">
             <div className="relative z-10">
               <ShieldCheck size={32} className="text-emerald-400 mb-4" />
               <h4 className="text-sm font-semibold mb-2">Audit Complete</h4>
               <p className="text-xs text-emerald-200/80 font-medium leading-relaxed">Your last security audit was 2 days ago. No vulnerabilities found.</p>
             </div>
             <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-emerald-800 rounded-full blur-2xl opacity-50" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-[.5rem] border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
               <div>
                 <h3 className="text-sm font-medium text-slate-900">{activeTab} configuration</h3>
                 <p className="text-xs text-slate-400 mt-0.5">Modified by Admin @ 10:42 AM</p>
               </div>
               <div className="flex gap-2">
                  <div className="h-9 w-9 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                     <Database size={16} />
                  </div>
               </div>
            </div>
            
            <div className="p-6 space-y-10">
              {activeTab === 'Profile' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        {user?.photoUrl || user?.avatar ? (
                          <img src={user.photoUrl || user.avatar} className="h-full w-full object-cover" alt="" />
                        ) : (
                          <User size={32} className="text-slate-300" />
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                            <Loader2 size={20} className="text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1.5 rounded-full hover:bg-emerald-700 transition-all disabled:opacity-50"
                      >
                        <Camera size={14} />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Administrator Profile</h4>
                      <p className="text-xs text-slate-500 font-medium">PNG, JPG or GIF. Max 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                      label="Full Name"
                      value={profileForm.name}
                      onChange={(v: string) => setProfileForm({ ...profileForm, name: v })}
                    />
                    <InputGroup
                      label="Email Address"
                      value={profileForm.email}
                      onChange={(v: string) => setProfileForm({ ...profileForm, email: v })}
                    />
                    <InputGroup
                      label="Phone Number"
                      value={profileForm.phone}
                      onChange={(v: string) => setProfileForm({ ...profileForm, phone: v })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'General' && (
                <>
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Settings size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Primary Details</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <InputGroup 
                        label="Support Email" 
                        value={formState['supportEmail'] || ''} 
                        onChange={(v: string) => setField('supportEmail', v)} 
                        placeholder="support@hlynk.com" 
                      />
                      <InputGroup 
                        label="Platform Fee (%)" 
                        value={formState['platformFeePercentage'] || '5.00'} 
                        onChange={(v: string) => setField('platformFeePercentage', v)} 
                        placeholder="5.00" 
                      />
                    </div>
                  </section>
                  
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Globe size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Maintenance</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SecuritySwitch 
                        title="Maintenance Mode" 
                        desc="Temporary block all provider access for maintenance" 
                        active={!!formState['maintenanceMode']} 
                        onChange={(v: boolean) => setField('maintenanceMode', v)}
                        icon={Settings}
                      />
                      <SecuritySwitch 
                        title="Allow Registration" 
                        desc="Enable new provider signups" 
                        active={!!formState['allowNewProviders']} 
                        onChange={(v: boolean) => setField('allowNewProviders', v)}
                        icon={Globe}
                      />
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'Infrastructure' && (
                <div className="space-y-10">
                   <section className="space-y-6">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Smartphone size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">M-Pesa B2C Diagnostic</span>
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-[.5rem] border border-slate-100 space-y-6">
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">
                         Perform a live B2C disbursement test. This will attempt to send real or sandbox funds from your system paybill to the specified number. 
                         <span className="block mt-2 text-amber-600 font-bold">Use with caution: This action is logged for forensic audit.</span>
                       </p>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Phone</label>
                             <input 
                               type="text" 
                               id="test-b2c-phone"
                               placeholder="2547XXXXXXXX" 
                               className="hl-input w-full rounded-md"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Amount (KES)</label>
                             <input 
                               type="number" 
                               id="test-b2c-amount"
                               placeholder="10" 
                               className="hl-input w-full rounded-md"
                             />
                          </div>
                          <div className="md:col-span-2">
                             <button 
                               onClick={async () => {
                                 const phone = (document.getElementById('test-b2c-phone') as HTMLInputElement).value;
                                 const amount = (document.getElementById('test-b2c-amount') as HTMLInputElement).value;
                                 if (!phone || !amount) return toast.error('Phone and amount required');
                                 
                                 const t = toast.loading('Initiating B2C Handshake...');
                                 try {
                                   const res = await adminApi.testB2C({ phone, amount: Number(amount) });
                                   toast.success(res.message, { id: t });
                                 } catch (err) {
                                   toast.error(getErrorMessage(err), { id: t });
                                 }
                               }}
                               className="w-full py-3 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                             >
                               <Smartphone size={13} /> Execute Disburse Handshake
                             </button>
                          </div>
                       </div>
                    </div>
                   </section>

                   <section className="space-y-6 opacity-50 pointer-events-none">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Cpu size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Node Distribution</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="h-20 bg-slate-50 border border-slate-100 rounded-[.5rem] animate-pulse" />
                       <div className="h-20 bg-slate-50 border border-slate-100 rounded-[.5rem] animate-pulse" />
                       <div className="h-20 bg-slate-50 border border-slate-100 rounded-[.5rem] animate-pulse" />
                    </div>
                   </section>
                </div>
              )}

              {activeTab === 'Security' && (
                <section className="space-y-4">
                  <SecuritySwitch 
                    title="Enforce Admin 2FA" 
                    desc="Mandatory hardware or app-based 2FA for all SuperAdmins" 
                    icon={Key} 
                    active={formState['ENFORCE_2FA'] === 'true'} 
                    onChange={(v: boolean) => setField('ENFORCE_2FA', String(v))}
                  />
                  <SecuritySwitch 
                    title="Intrusion Detection" 
                    desc="Automatically block IPs with more than 5 failed attempts in 1 min" 
                    icon={ShieldAlert} 
                    active={formState['INTRUSION_DETECT'] === 'true'} 
                    onChange={(v: boolean) => setField('INTRUSION_DETECT', String(v))}
                  />
                  <SecuritySwitch 
                    title="Session Persistence" 
                    desc="Keep administrative sessions alive for 24 hours" 
                    icon={UserCheck} 
                    active={formState['SESSION_PERSISTENCE'] === 'true'} 
                    onChange={(v: boolean) => setField('SESSION_PERSISTENCE', String(v))}
                  />
                </section>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 border border-dashed border-slate-200 p-6 rounded-[.5rem] flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                   <Lock size={16} />
                </div>
                <div>
                   <p className="text-sm font-black text-slate-900">Advanced Audit Logs</p>
                   <p className="text-xs text-slate-400 font-medium">Download the full history of configuration changes.</p>
                </div>
             </div>
             <button className="px-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-black hover:bg-slate-100 transition-all">Export JSON</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InputGroup({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="hl-input w-full rounded-md" 
      />
    </div>
  )
}

function SelectGroup({ label, options, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className="hl-input w-full appearance-none rounded-md">
          {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-black">↓</div>
      </div>
    </div>
  )
}

function SecuritySwitch({ title, desc, icon: Icon, active, onChange }: any) {
  return (
    <div onClick={() => onChange(!active)} className="flex items-center justify-between p-5 rounded-[.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-md flex items-center justify-center transition-colors ${
          active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-400'
        }`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{desc}</p>
        </div>
      </div>
      <div className={`w-12 h-7 rounded-full p-1 transition-all ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  )
}