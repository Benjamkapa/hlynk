import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Building2, User, Phone, Mail, MapPin, Tag,
  ArrowLeft, Loader2, ChevronRight
} from 'lucide-react'
import { adminApi } from '../../lib/api/providers'
import { ADMIN_CSS } from './hl-design-system'

const COUNTIES = [
  "Nairobi","Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita/Taveta","Garissa",
  "Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka-Nithi","Embu","Kitui",
  "Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu",
  "Turkana","West Pokot","Samburu","Trans Nzoia","Uasin Gishu","Elgeyo/Marakwet",
  "Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet",
  "Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira",
]

const CATEGORIES = [
  "Barber & Salon","Cleaning Services","Plumbing","Electrical","Mechanic",
  "Moving","Construction","Consultancy","Photography","Catering","Other",
]

const PLANS = [
  { value: 'trial-14', label: '14-Day Free Trial' },
  { value: 'trial-30', label: '30-Day Extended Trial' },
  { value: 'starter',  label: 'Starter — KES 1,000/mo' },
  { value: 'growth',   label: 'Growth — KES 2,500/mo' },
  { value: 'enterprise', label: 'Enterprise — KES 5,000/mo' },
]

/* ─── Reusable field components ─── */
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <label className="hl-form-label">{label}</label>
      {children}
    </div>
  )
}

function IconInput({ icon: Icon, ...props }: any) {
  return (
    <div className="hl-input-wrap">
      <span className="hl-input-icon"><Icon size={15} /></span>
      <input className="hl-form-input icon-left" {...props} />
    </div>
  )
}

function IconSelect({ icon: Icon, children, ...props }: any) {
  return (
    <div className="hl-input-wrap">
      <span className="hl-input-icon"><Icon size={15} /></span>
      <select className="hl-form-input icon-left select-input" {...props}>
        {children}
      </select>
    </div>
  )
}

export default function AdminAddProviderPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    businessName: '', category: '', county: '', location: '',
    name: '', phone: '', email: '', plan: 'trial-14',
  })

  const { mutate, isPending: loading } = useMutation({
    mutationFn: adminApi.createTenant,
    onSuccess: () => {
      toast.success('Business registered successfully!')
      navigate('/admin/businesses')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(form)
  }

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>

        {/* Header */}
        <div className="hl-page-header" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="hl-btn-outline" style={{ padding: '9px 12px' }}
              onClick={() => navigate(-1)}>
              <ArrowLeft size={15} />
            </button>
            <div>
              <h1 className="hl-page-title">Register New Business</h1>
              <p className="hl-page-subtitle">Manually add a service provider to the platform</p>
            </div>
          </div>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)' }}>
            <span>Admin</span><ChevronRight size={10} /><span>Businesses</span><ChevronRight size={10} />
            <span style={{ color: 'var(--ink2)', fontWeight: 600 }}>Register</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ maxWidth: 780 }}>

          {/* Business Details */}
          <div className="hl-card" style={{ marginBottom: 16, animation: 'hl-up .4s ease both' }}>
            <div className="hl-card-header">
              <h3>Business Details</h3>
              <span className="hl-badge hl-badge-trial">Step 1 of 2</span>
            </div>
            <div className="hl-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <FormField label="Business Name">
                  <IconInput icon={Building2} type="text" required placeholder="e.g. Westlands Auto Care"
                    value={form.businessName} onChange={set('businessName')} />
                </FormField>

                <FormField label="Category">
                  <IconSelect icon={Tag} required value={form.category} onChange={set('category')}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </IconSelect>
                </FormField>

                <FormField label="County">
                  <IconSelect icon={MapPin} required value={form.county} onChange={set('county')}>
                    <option value="">Select county</option>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </IconSelect>
                </FormField>

                <FormField label="Location / Estate">
                  <IconInput icon={MapPin} type="text" required placeholder="e.g. Rhapta Road, Westlands"
                    value={form.location} onChange={set('location')} />
                </FormField>

                <FormField label="Subscription Plan">
                  <select className="hl-form-input select-input" value={form.plan} onChange={set('plan')}>
                    <option value="">Select a plan</option>
                    {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </FormField>
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="hl-card" style={{ marginBottom: 20, animation: 'hl-up .4s ease .1s both' }}>
            <div className="hl-card-header">
              <h3>Contact Person</h3>
              <span className="hl-badge hl-badge-trial">Step 2 of 2</span>
            </div>
            <div className="hl-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <FormField label="Full Name">
                  <IconInput icon={User} type="text" required placeholder="John Doe"
                    value={form.name} onChange={set('name')} />
                </FormField>

                <FormField label="Phone Number">
                  <IconInput icon={Phone} type="tel" required placeholder="07..."
                    value={form.phone} onChange={set('phone')} />
                </FormField>

                <FormField label="Email Address">
                  <IconInput icon={Mail} type="email" placeholder="owner@business.co.ke"
                    value={form.email} onChange={set('email')} />
                </FormField>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, animation: 'hl-up .4s ease .18s both' }}>
            <button type="button" className="hl-btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="hl-btn-primary" style={{ minWidth: 170, justifyContent: 'center' }}>
              {loading ? <Loader2 size={16} style={{ animation: 'hl-spin .7s linear infinite' }} /> : 'Register Business'}
            </button>
          </div>

        </form>
      </div>
    </>
  )
}