import { useState, useEffect, useRef } from 'react'
import { ButtonLoader } from '../../components/shared/InlineLoader'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { api } from '../../lib/api/client'
import { subscribeToPushNotifications, unsubscribeFromPush, getPushSubscriptionState } from '../../lib/notifications/pushService'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'

const inputCls =
  'w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D4A3E]'

const outlineBtn =
  'inline-flex h-9 items-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50'

const TABS = [
  { name: 'Profile', desc: 'Your details and photo' },
  { name: 'General', desc: 'Platform-wide options' },
  { name: 'Security', desc: 'Sign-in and access' },
  { name: 'Notifications', desc: 'Push alerts' },
  { name: 'Regional', desc: 'Currency and timezone' },
  { name: 'Infrastructure', desc: 'Payments diagnostics' },
]

// Tabs where there is nothing to save
const NO_SAVE_TABS = ['Notifications', 'Infrastructure']

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')
  const [formState, setFormState] = useState<Record<string, string>>({})
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' })
  const [uploading, setUploading] = useState(false)
  const [b2cPhone, setB2cPhone] = useState('')
  const [b2cAmount, setB2cAmount] = useState('')
  const [b2cPending, setB2cPending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
    }
  }, [user])

  const { data: res, error } = useQuery<any>({
    queryKey: ['admin-settings'],
    queryFn: adminApi.getSettings,
  })

  useEffect(() => {
    if (res?.data) {
      setFormState(res.data)
    }
    if (error) toast.error('Failed to load system settings')
  }, [res, error])

  const setField = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateSettings(formState),
    onSuccess: () => {
      toast.success('Settings saved')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const profileMutation = useMutation({
    mutationFn: () => adminApi.updateProfile(profileForm),
    onSuccess: () => {
      toast.success('Profile saved')
      refreshUser()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
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

  const runB2cTest = async () => {
    if (!b2cPhone || !b2cAmount) return toast.error('Phone and amount are required')
    setB2cPending(true)
    const t = toast.loading('Sending test disbursement...')
    try {
      const r = await adminApi.testB2C({ phone: b2cPhone, amount: Number(b2cAmount) })
      toast.success(r.message, { id: t })
    } catch (err) {
      toast.error(getErrorMessage(err), { id: t })
    } finally {
      setB2cPending(false)
    }
  }

  const saving = updateMutation.isPending || profileMutation.isPending
  const current = TABS.find((t) => t.name === activeTab)

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">Platform and administrator controls</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">Settings</h1>
        </div>
        {!NO_SAVE_TABS.includes(activeTab) && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded bg-[#0D4A3E] px-4 text-sm font-medium text-white transition-colors hover:bg-[#0A3D33] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        )}
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Section navigation */}
        <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto lg:w-60 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {TABS.map((tab) => {
            const active = activeTab === tab.name
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 border-b-2 px-3 py-2.5 text-left transition-colors lg:border-b-0 lg:border-l-2 ${
                  active
                    ? 'border-[#0D4A3E] text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={`block text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{tab.name}</span>
                <span className="mt-0.5 hidden text-xs text-slate-400 lg:block">{tab.desc}</span>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <section className="min-w-0 flex-1 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">{activeTab}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{current?.desc}</p>
          </div>

          <div className="space-y-10 p-6">
            {activeTab === 'Profile' && (
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100 text-2xl font-semibold text-slate-400">
                    {user?.photoUrl || user?.avatar ? (
                      <img src={user.photoUrl || user.avatar} className="h-full w-full object-cover" alt="" />
                    ) : (
                      (profileForm.name || user?.name || '?').charAt(0).toUpperCase()
                    )}
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <ButtonLoader size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={outlineBtn}
                    >
                      Change photo
                    </button>
                    <p className="mt-2 text-xs text-slate-500">PNG, JPG or GIF, up to 5 MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <InputGroup label="Full name" value={profileForm.name} onChange={(v: string) => setProfileForm({ ...profileForm, name: v })} />
                  <InputGroup label="Email" value={profileForm.email} onChange={(v: string) => setProfileForm({ ...profileForm, email: v })} />
                  <InputGroup label="Phone number" value={profileForm.phone} onChange={(v: string) => setProfileForm({ ...profileForm, phone: v })} />
                </div>
              </div>
            )}

            {activeTab === 'General' && (
              <>
                <Group title="Primary details">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <InputGroup
                      label="Support email"
                      value={formState['supportEmail'] || ''}
                      onChange={(v: string) => setField('supportEmail', v)}
                      placeholder="support@hlynk.com"
                    />
                    <InputGroup
                      label="Platform fee (%)"
                      value={formState['platformFeePercentage'] || '5.00'}
                      onChange={(v: string) => setField('platformFeePercentage', v)}
                      placeholder="5.00"
                    />
                  </div>
                </Group>

                <Group title="Access">
                  <div className="divide-y divide-slate-100 border-y border-slate-200">
                    <ToggleRow
                      title="Maintenance mode"
                      desc="Block all business access while you carry out maintenance."
                      active={!!formState['maintenanceMode']}
                      onChange={(v: boolean) => setField('maintenanceMode', v)}
                    />
                    <ToggleRow
                      title="Allow registration"
                      desc="Let new businesses sign up."
                      active={!!formState['allowNewProviders']}
                      onChange={(v: boolean) => setField('allowNewProviders', v)}
                    />
                  </div>
                </Group>
              </>
            )}

            {activeTab === 'Security' && (
              <div className="divide-y divide-slate-100 border-y border-slate-200">
                <ToggleRow
                  title="Require admin two-factor authentication"
                  desc="Every super admin must verify with an app or hardware key."
                  active={formState['ENFORCE_2FA'] === 'true'}
                  onChange={(v: boolean) => setField('ENFORCE_2FA', String(v))}
                />
                <ToggleRow
                  title="Block repeated failed sign-ins"
                  desc="Automatically block IPs with more than 5 failed attempts in a minute."
                  active={formState['INTRUSION_DETECT'] === 'true'}
                  onChange={(v: boolean) => setField('INTRUSION_DETECT', String(v))}
                />
                <ToggleRow
                  title="Keep admin sessions for 24 hours"
                  desc="Stay signed in between visits for a full day."
                  active={formState['SESSION_PERSISTENCE'] === 'true'}
                  onChange={(v: boolean) => setField('SESSION_PERSISTENCE', String(v))}
                />
              </div>
            )}

            {activeTab === 'Notifications' && <AdminNotificationsPanel />}

            {activeTab === 'Regional' && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <SelectGroup
                  label="Operating currency"
                  options={['KES - Kenya Shilling', 'USD - US Dollar', 'EUR - Euro', 'GBP - British Pound']}
                  value={formState['DEFAULT_CURRENCY'] || 'KES - Kenya Shilling'}
                  onChange={(v: string) => setField('DEFAULT_CURRENCY', v)}
                />
                <SelectGroup
                  label="System timezone"
                  options={['Africa/Nairobi (UTC+3)', 'UTC', 'Europe/London (UTC+1)', 'America/New_York (UTC-5)']}
                  value={formState['TIMEZONE'] || 'Africa/Nairobi (UTC+3)'}
                  onChange={(v: string) => setField('TIMEZONE', v)}
                />
              </div>
            )}

            {activeTab === 'Infrastructure' && (
              <Group title="M-Pesa B2C test">
                <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
                  Send a real or sandbox payment from your paybill to the number below to check that disbursements work.
                  Every test is recorded in the audit log.
                </p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <InputGroup label="Recipient phone" value={b2cPhone} onChange={setB2cPhone} placeholder="2547XXXXXXXX" mono />
                  <InputGroup label="Amount (KES)" value={b2cAmount} onChange={setB2cAmount} placeholder="10" mono />
                </div>
                <button
                  onClick={runB2cTest}
                  disabled={b2cPending}
                  className="inline-flex h-10 items-center gap-2 rounded bg-[#0D4A3E] px-4 text-sm font-medium text-white transition-colors hover:bg-[#0A3D33] disabled:opacity-60"
                >
                  {b2cPending && <ButtonLoader size={14} />}
                  Send test payment
                </button>
              </Group>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </section>
  )
}

function InputGroup({ label, value, onChange, placeholder, mono = false }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} ${mono ? 'hl-mono' : ''}`}
      />
    </label>
  )
}

function SelectGroup({ label, options, value, onChange }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((opt: any) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

function Switch({ active, onChange, label }: { active: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      onClick={() => onChange(!active)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D4A3E] ${
        active ? 'bg-[#0D4A3E]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function ToggleRow({ title, desc, active, onChange }: { title: string; desc: string; active: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
      </div>
      <Switch active={active} onChange={onChange} label={title} />
    </div>
  )
}

const ALERT_STREAMS = [
  { title: 'Signups and onboarding', desc: 'A new business signs up or finishes onboarding.' },
  { title: 'M-Pesa and payments', desc: 'Subscription payments, B2C disbursements and payment problems.' },
  { title: 'Security', desc: 'IP lockouts, brute-force attempts and role changes.' },
  { title: 'Subscriptions and expiries', desc: 'Plans about to expire, grace periods and renewals.' },
]

function AdminNotificationsPanel() {
  const [pushState, setPushState] = useState<'subscribed' | 'denied' | 'prompt' | 'unsupported' | 'ios_browser'>('prompt')
  const [loading, setLoading] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    getPushSubscriptionState()
      .then((state) => setPushState(state as any))
      .catch(() => setPushState('prompt'))
  }, [])

  const handlePushToggle = async (active: boolean) => {
    setLoading(true)
    try {
      if (active) {
        await subscribeToPushNotifications()
        toast.success('Push alerts enabled')
      } else {
        await unsubscribeFromPush()
        toast.success('Push alerts disabled')
      }
      const newState = await getPushSubscriptionState()
      setPushState(newState as any)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update push settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    setSendingTest(true)
    try {
      await api.post('/notifications/test')
      toast.success('Test alert sent to this device')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send test alert')
    } finally {
      setSendingTest(false)
    }
  }

  const status =
    pushState === 'subscribed'
      ? { label: 'On', dot: 'bg-emerald-500', text: 'text-emerald-700', body: 'This device is registered and receives live alerts.' }
      : pushState === 'denied'
        ? { label: 'Blocked', dot: 'bg-amber-500', text: 'text-amber-700', body: 'Notifications are blocked in this browser. Allow them from the site settings in your address bar, then reload.' }
        : pushState === 'unsupported'
          ? { label: 'Not supported', dot: 'bg-slate-400', text: 'text-slate-600', body: 'This browser cannot receive push notifications.' }
          : pushState === 'ios_browser'
            ? { label: 'Needs setup', dot: 'bg-amber-500', text: 'text-amber-700', body: 'On iPhone, tap Share, then Add to Home Screen, to turn on push alerts.' }
            : { label: 'Off', dot: 'bg-slate-400', text: 'text-slate-600', body: 'Turn on to get critical alerts on this browser, even when the portal is closed.' }

  return (
    <div className="space-y-10">
      <Group title="Push alerts">
        <div className="flex flex-col gap-4 border-y border-slate-200 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
              Web push notifications
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-500">{status.body}</p>
          </div>

          <div className="flex items-center gap-3 sm:self-center">
            {loading ? (
              <ButtonLoader size={20} className="text-[#0D4A3E]" />
            ) : pushState === 'unsupported' ? null : pushState === 'ios_browser' || pushState === 'denied' ? (
              <button
                onClick={() =>
                  toast.info(
                    pushState === 'ios_browser'
                      ? 'On iPhone, tap Share, then Add to Home Screen. Push only works from the Home Screen app.'
                      : 'Allow notifications from the site settings in your address bar, then reload this page.'
                  )
                }
                className={outlineBtn}
              >
                How to fix this
              </button>
            ) : (
              <>
                {pushState === 'subscribed' && (
                  <button onClick={handleSendTest} disabled={sendingTest} className={outlineBtn}>
                    {sendingTest && <ButtonLoader size={12} />}
                    Send test alert
                  </button>
                )}
                <Switch active={pushState === 'subscribed'} onChange={(v) => handlePushToggle(v)} label="Web push notifications" />
              </>
            )}
          </div>
        </div>
      </Group>

      <Group title="What you are alerted about">
        <ul className="divide-y divide-slate-100 border-y border-slate-200">
          {ALERT_STREAMS.map((s) => (
            <li key={s.title} className="py-3.5">
              <p className="text-sm font-medium text-slate-900">{s.title}</p>
              <p className="mt-0.5 text-sm text-slate-500">{s.desc}</p>
            </li>
          ))}
        </ul>
      </Group>
    </div>
  )
}