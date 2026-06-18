import { useState } from 'react'
import { Search, BookOpen, MessageCircle, FileText, ChevronRight, HelpCircle, X } from 'lucide-react'

export default function HelpPage() {
  const [activeGuide, setActiveGuide] = useState<string | null>(null)

  const resources = [
    { title: 'User Onboarding', desc: 'Guide on how to register and verify new providers.', icon: BookOpen },
    { title: 'Risk Management', desc: 'Understanding risk scores and fraud detection.', icon: FileText },
    { title: 'Payout Systems', desc: 'Configuration of automated vs manual settlements.', icon: MessageCircle },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6 relative">
      
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">How can we help, Admin?</h1>
        <p className="text-gray-500 font-medium max-w-xl mx-auto text-lg">Search our internal documentation for platform management, business control, and financial operations.</p>
        
        <div className="relative max-w-2xl mx-auto pt-6">
          <Search className="absolute left-6 top-[70%] -translate-y-1/2 text-gray-400" size={24} />
          <input 
            type="text" 
            placeholder="Search platform guides, API docs, or policy..." 
            className="w-full bg-white border border-gray-100 shadow-xl shadow-emerald-900/5 rounded-[14px] py-6 pl-16 pr-6 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-lg font-bold" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {resources.map((res, i) => (
          <div 
            key={i} 
            onClick={() => setActiveGuide(activeGuide === res.title ? null : res.title)}
            className={`p-8 rounded-[14px] border shadow-sm hover:shadow-md transition-all group cursor-pointer ${activeGuide === res.title ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'}`}
          >
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <res.icon size={28} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">{res.title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed text-sm">{res.desc}</p>
            <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
              {activeGuide === res.title ? 'Close Guide' : 'Read Guide'} <ChevronRight size={14} className={activeGuide === res.title ? 'rotate-90 transition-transform' : 'transition-transform'} />
            </div>
          </div>
        ))}
      </div>

      {activeGuide && (
        <div className="bg-white p-10 rounded-[14px] border border-emerald-100 shadow-xl shadow-emerald-900/5 animate-in slide-in-from-top-4 relative">
          <button onClick={() => setActiveGuide(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
            <X size={24} />
          </button>
          
          {activeGuide === 'User Onboarding' && (
            <article className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-emerald-900 mb-4">User Onboarding Process</h2>
              <div className="space-y-6 text-gray-600">
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">1. Tenant Creation</h4>
                  <p>When a new provider is established on the platform, their foundational identity is tied directly to their Google Account. There is no manual entry of KRA PINs required here; the system natively creates the tenant based on the primary administrator's secure Google login credentials.</p>
                </section>
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">2. Identity Verification</h4>
                  <p>Verification is handled seamlessly by Google Authentication. By utilizing Google's secure OAuth flow, Hlynk instantly verifies the provider's email address and identity without the need for manual SMS OTPs or confirmation links.</p>
                </section>
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">3. Subscription Assignment</h4>
                  <p>By default, newly onboarded tenants are assigned a 14-day <strong>TRIAL</strong> plan. If they represent a key enterprise partner, you may navigate to <strong>Subscriptions &gt; Upgrade Plan</strong> to manually provision a Growth or Premium plan instantly.</p>
                </section>
              </div>
            </article>
          )}

          {activeGuide === 'Risk Management' && (
            <article className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-emerald-900 mb-4">Risk Models & Fraud Detection</h2>
              <div className="space-y-6 text-gray-600">
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Duplicate Receipts</h4>
                  <p>To thwart payment fraud, the Hlynk payment parser utilizes exact M-Pesa receipt IDs payload matching. Attempting to record identical 10-character M-Pesa codes across independent tenants will trigger a <code>Forensic Alert</code> and suspend the transaction entry.</p>
                </section>
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Intrusion Detection</h4>
                  <p>Hlynk’s active security envelope tracks IP anomalies. Over 5 repeated failed login attempts from a unique origin trigger an immediate 30-minute block constraint on that IP. Ensure <strong>Intrusion Detection</strong> is activated in your <strong>Settings</strong> module.</p>
                </section>
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Risk Scoring</h4>
                  <p>Providers generating mass high volume entries without accompanying financial payload verifications receive elevated risk metrics. If a specific tenant surpasses the safe ceiling, you can immediately utilize the <strong>Suspend Tenant</strong> feature on the tenant oversight screen to lock access.</p>
                </section>
              </div>
            </article>
          )}

          {activeGuide === 'Payout Systems' && (
            <article className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-emerald-900 mb-4">Settlement Configuration</h2>
              <div className="space-y-6 text-gray-600">
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Automated (B2C) Handshake</h4>
                  <p>For fully verified providers with API integration permission, payouts route directly via Safaricom B2C. The vault reserves funds and pushes immediately upon settlement windows. You can run diagnostic Handshakes from your <strong>Settings &gt; Infrastructure</strong> tab.</p>
                </section>
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Manual Paybill Settlement</h4>
                  <p>Providers utilizing the global rented Paybill will accumulate <code>Settlement Balances</code>. To complete manual clearing: </p>
                  <ol className="list-decimal pl-5 space-y-2 mt-2 font-medium">
                    <li>Execute a physical transfer of the accumulated KES from Bank/Paybill straight to the Provider's Number.</li>
                    <li>Copy the reference code from your provider.</li>
                    <li>Navigate to <strong>Admin &gt; Financials</strong> and select the Pending Settlement record.</li>
                    <li>Click <strong>Mark as Paid</strong> and input the reference code to officially clear the ledger.</li>
                  </ol>
                </section>
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Platform Fee Withholding</h4>
                  <p>Remember that the base platform fee (e.g., 5.0%) automatically gets withheld before net profit calculation. Modifying the global platform fee on the Settings page applies to all <em>future</em> transactions; it does not change historical data.</p>
                </section>
              </div>
            </article>
          )}
        </div>
      )}

      <div className="bg-emerald-900 rounded-[14px] p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4">Direct Support Link</h2>
          <p className="text-emerald-200 font-medium max-w-md text-lg leading-relaxed">Need urgent assistance with platform infrastructure or security incidents? Contact the engineering team directly.</p>
          <button 
            onClick={() => window.location.href = 'mailto:devops@hlynk.co.ke?subject=URGENT: Platform Infrastructure Support Request'}
            className="mt-8 bg-emerald-400 text-emerald-900 px-8 py-4 rounded-xl font-black text-sm hover:bg-emerald-300 transition-all"
          >
            Contact DevOps
          </button>
        </div>
        <HelpCircle size={240} className="absolute -right-20 -bottom-20 text-emerald-800 opacity-20 rotate-12" />
      </div>
    </div>
  )
}
