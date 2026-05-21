import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'

export default function TermsConditions() {
  const updated = useMemo(() => new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }), [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ChevronLeft className="w-5 h-5" /> Back to App
        </button>

        <div className="bg-white p-10 md:p-16 rounded-[.5rem] shadow-xl shadow-slate-900/5 border border-slate-100">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Last updated: {updated}</p>
          <p className="text-sm text-slate-500 mb-12">
            Please read these terms carefully before using Hlynk. By creating an account or using the platform, you confirm that you have read and agreed to these terms. If you do not agree, you should not use the Service.
          </p>

          <div className="space-y-12 text-slate-600 leading-relaxed">

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">1. About Hlynk</h2>
              <p className="mb-3">
                Hlynk is a business management platform providing point-of-sale, inventory tracking, expense management, and financial reporting tools for small and medium businesses in Kenya. The platform is accessible at <strong>www.hlynk.co.ke</strong> and is operated as a sole proprietorship in Kenya.
              </p>
              <p>
                These Terms of Service ("Terms") govern your use of the Hlynk platform ("the Service"). Where we refer to "you" or "the user", we mean any person who creates an account, uses the platform, or accesses any part of the Service — including business owners and their staff members.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">2. Eligibility and Account Registration</h2>
              <p className="mb-4">To use Hlynk, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be at least 18 years of age.</li>
                <li>Have the legal authority to enter into a binding agreement on behalf of yourself or the business you represent.</li>
                <li>Provide accurate, honest, and complete information during registration and keep it up to date.</li>
              </ul>
              <p className="mt-4 mb-3">Regarding account security:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for keeping your login credentials private. Do not share your password with anyone outside of authorised staff you add to your account.</li>
                <li>You are responsible for all activity that occurs under your account, including actions taken by staff members you have granted access.</li>
                <li>If you suspect your account has been accessed without your permission, notify us immediately at <a href="mailto:info@hlynk.co.ke" className="text-emerald-600 underline">info@hlynk.co.ke</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">3. Subscriptions and Payments</h2>
              <p className="mb-4">
                Hlynk offers tiered subscription plans — Starter, Growth, and Business Pro. The pricing and features for each plan are displayed on the platform at the time of subscription.
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Billing cycle:</strong> Subscriptions are billed on a recurring monthly basis. Your subscription renews automatically unless you cancel before the next billing date.
                </li>
                <li>
                  <strong>Payment method:</strong> Payments are processed via M-Pesa STK Push. By initiating a subscription payment, you authorise us to request the relevant amount from your M-Pesa account.
                </li>
                <li>
                  <strong>Non-refundable payments:</strong> All subscription payments are non-refundable once processed, except where required by Kenyan consumer protection law. If you believe a payment was made in error, contact us within 7 days and we will review it.
                </li>
                <li>
                  <strong>Free trials:</strong> If a free trial is offered, you will be notified of the trial duration and what plan you will be moved to if you do not cancel. We will not charge you without clear prior notice.
                </li>
                <li>
                  <strong>M-Pesa and Safaricom:</strong> M-Pesa payment processing is facilitated through Safaricom's Daraja API. Hlynk is not responsible for payment failures, delays, or errors caused by Safaricom's systems or network downtime. In such cases, please retry the transaction or contact us.
                </li>
                <li>
                  <strong>Subscription suspension:</strong> If a payment fails and is not resolved within 7 days, we may suspend access to your account until payment is received. Your data will not be deleted during this period.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">4. How You May Use the Service</h2>
              <p className="mb-4">You may use Hlynk for lawful business management purposes. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Record or process transactions that are fraudulent, illegal, or misrepresent the nature of a sale.</li>
                <li>Attempt to access another user's account or business data without authorisation.</li>
                <li>Try to reverse engineer, copy, or replicate the platform's code, features, or design.</li>
                <li>Use the platform to resell access to third parties without our written approval.</li>
                <li>Deliberately overload, disrupt, or interfere with the platform's infrastructure, including its M-Pesa callback endpoints.</li>
                <li>Upload or transmit malicious code, scripts, or content designed to harm the platform or other users.</li>
              </ul>
              <p className="mt-4">Violations of this section may result in immediate suspension or termination of your account without a refund.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">5. Your Data and Our Role</h2>
              <p className="mb-3">
                All business data, inventory records, transaction histories, and customer information that you enter into Hlynk remains yours. We do not claim ownership of it.
              </p>
              <p className="mb-3">
                By using the Service, you grant Hlynk a limited licence to host, store, and process your data for the sole purpose of delivering the platform's features to you. We do not use your business data for advertising or share it with third parties for commercial purposes.
              </p>
              <p>
                If your account is terminated or you cancel your subscription, you may request an export of your data within <strong>30 days</strong> of termination. After that period, your data may be permanently deleted from our systems, subject to any mandatory retention requirements under Kenyan law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">6. Customer Data Responsibility</h2>
              <p className="mb-3">
                If you use Hlynk to record information about your customers — such as names, phone numbers, or purchase history — you are the data controller for that information under the <strong>Kenya Data Protection Act 2019</strong>. Hlynk processes this data on your behalf as a data processor.
              </p>
              <p>
                You are responsible for ensuring that you have a lawful basis for collecting and storing your customers' personal data, and for informing them about how their information is used. Hlynk is not liable for claims arising from your handling of customer data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">7. Service Availability</h2>
              <p className="mb-3">
                We aim to keep Hlynk available at all times, but we cannot guarantee uninterrupted access. The platform may be temporarily unavailable due to scheduled maintenance, technical issues, or circumstances outside our control (including third-party service outages such as Safaricom's M-Pesa network).
              </p>
              <p>
                We will notify users of planned maintenance where possible. We are not liable for losses arising from temporary unavailability of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">8. Intellectual Property</h2>
              <p>
                The Hlynk platform — including its interface, code, branding, features, and documentation — is the intellectual property of Hlynk and its operator. You are granted a limited, non-exclusive, non-transferable licence to use the platform for the duration of your active subscription. This licence does not give you any ownership rights over the platform or its components.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">9. Limitation of Liability</h2>
              <p className="mb-3">
                Hlynk provides the platform on an "as is" basis. We do not guarantee that the platform is error-free or that all features will work perfectly in every situation.
              </p>
              <p className="mb-3">
                To the maximum extent permitted by Kenyan law, Hlynk shall not be liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Loss of profits, revenue, or business data arising from use of or inability to use the platform.</li>
                <li>Errors in financial reports generated by the platform due to data entered incorrectly by the user.</li>
                <li>Losses resulting from M-Pesa transaction failures or Safaricom network issues.</li>
                <li>Any indirect or consequential losses not directly caused by Hlynk's own negligence.</li>
              </ul>
              <p className="mt-4">
                Our total liability to you in any circumstances shall not exceed the total subscription fees you paid to Hlynk in the 3 months prior to the event giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">10. Termination</h2>
              <p className="mb-3">
                You may cancel your Hlynk subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period.
              </p>
              <p className="mb-3">
                We reserve the right to suspend or terminate your account if:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You violate these Terms in a material way.</li>
                <li>We have reasonable grounds to believe your account is being used fraudulently or for unlawful purposes.</li>
                <li>You fail to resolve a payment failure within the notice period.</li>
              </ul>
              <p className="mt-4">
                Where termination is initiated by us without cause, we will provide at least <strong>14 days' notice</strong> and a pro-rated refund for any unused subscription period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">11. Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time as the platform grows or as required by law. If we make material changes, we will notify you by email or via an in-app notice at least <strong>30 days</strong> before the new terms take effect. Continued use of the platform after that date constitutes acceptance of the updated Terms. If you do not agree to the new Terms, you may cancel your subscription before the changes take effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">12. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of Kenya. Any disputes arising from the use of the Hlynk platform shall first be attempted to be resolved through direct communication. If unresolved, disputes shall be subject to the jurisdiction of the courts of Kenya.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">13. Contact Us</h2>
              <p className="mb-3">For any questions about these Terms, or to raise a concern, please contact us:</p>
              <p>
                <strong>General enquiries:</strong> <a href="mailto:info@hlynk.co.ke" className="text-emerald-600 underline">info@hlynk.co.ke</a><br />
                <strong>Legal / formal notices:</strong> <a href="mailto:benjamin@hlynk.co.ke" className="text-emerald-600 underline">benjamin@hlynk.co.ke</a><br />
                <strong>Platform:</strong> www.hlynk.co.ke
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}