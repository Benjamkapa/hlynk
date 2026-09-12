import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'

export default function TermsConditions() {
  const updated = useMemo(() => new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }), [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm tracking-widest"
        >
          <ChevronLeft className="w-5 h-5" /> Back to App
        </button>

        <div className="bg-white p-10 md:p-16 rounded-[.5rem] shadow-xl shadow-slate-900/5 border border-slate-100">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-sm font-bold text-emerald-600 tracking-widest mb-2">Last updated: {updated}</p>
          <p className="text-sm text-slate-500 mb-12">
            Please read these terms carefully before using hlynk. By signing in or creating an account you confirm that you have read and agreed to these terms. If you do not agree, please do not use the Service.
          </p>

          <div className="space-y-12 text-slate-600 leading-relaxed">

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">1. About hlynk</h2>
              <p className="mb-3">
                hlynk is a business management platform providing point-of-sale, inventory tracking, expense management, hospitality booking, and financial reporting tools for small and medium businesses in Kenya. The platform is accessible at <strong>www.hlynk.co.ke</strong> and is operated as a sole proprietorship in Kenya.
              </p>
              <p>
                These Terms of Service ("Terms") govern your use of the hlynk platform ("the Service"). Where we refer to "you" or "the user", we mean any person who creates an account, uses the platform, or accesses any part of the Service — including business owners and their staff members.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">2. Eligibility and Account Registration</h2>
              <p className="mb-4">To use hlynk, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be at least 18 years of age.</li>
                <li>Have the legal authority to enter into a binding agreement on behalf of yourself or the business you represent.</li>
                <li>Provide accurate, honest, and complete information during registration and keep it up to date.</li>
              </ul>
              <p className="mt-4 mb-3">
                <strong>Authentication:</strong> hlynk uses Google Sign-In as the sole login method. By signing in with Google, you authorise hlynk to receive your Google account name and email address for the purpose of creating and managing your account. You must have a valid Google account to use the Service.
              </p>
              <p className="mb-3">Regarding account security:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for all activity that occurs under your account, including actions taken by staff members you have granted access.</li>
                <li>You must not share your account access with individuals who have not been formally added as staff through the platform.</li>
                <li>If you suspect your account has been accessed without your permission, notify us immediately at <a href="mailto:info@hlynk.co.ke" className="text-emerald-600 underline">info@hlynk.co.ke</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">3. Subscription Plans and Pricing</h2>
              <p className="mb-4">
                hlynk offers two subscription plans. Pricing and features are as follows:
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-bold text-slate-700">Plan</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-700">Monthly Price</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-700">Key Features</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-800">Starter</td>
                      <td className="px-4 py-3">KES 4,450</td>
                      <td className="px-4 py-3">Up to 60 inventory items, Record Sales & Expenses, M-Pesa STK Push, Profit Analytics, Customer Tracking, 1 Staff Account, Priority Support</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-800">Business Pro</td>
                      <td className="px-4 py-3">KES 8,200</td>
                      <td className="px-4 py-3">Everything in Starter, plus Unlimited Inventory, Public Store/Shop Page, Public Stay Booking, KCB Buni Direct Settlement, Unlimited Staff Accounts, Audit Logs & Activity Tracking, Custom Roles & Permissions</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mb-3 text-sm text-slate-500">Prices displayed are per month. Multi-month billing cycles (6 months, 12 months) may be available and will be shown at checkout. Current pricing is always displayed at the time of subscription on the platform.</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Free trial:</strong> If you register via a valid referral link, you may be eligible for a free trial period (typically 14 days). During a trial you have access to all features of the plan you signed up for. At the end of the trial, you must subscribe and pay to continue using the platform — we will not charge you automatically without your action.
                </li>
                <li>
                  <strong>Billing cycle:</strong> Subscriptions are activated after successful payment. You may choose a monthly, 6-month, or 12-month billing cycle where available. Your subscription does not renew automatically — you must initiate each renewal payment.
                </li>
                <li>
                  <strong>Payment method:</strong> Payments are processed via M-Pesa STK Push or manual M-Pesa code submission. By initiating a payment, you authorise us to request the relevant amount from your M-Pesa account or to manually verify your submitted M-Pesa transaction code.
                </li>
                <li>
                  <strong>Non-refundable payments:</strong> All subscription payments are non-refundable once processed, except where required by Kenyan consumer protection law. If you believe a payment was made in error, contact us within 7 days and we will review it.
                </li>
                <li>
                  <strong>M-Pesa and Safaricom:</strong> M-Pesa payment processing is facilitated through Safaricom's Daraja API. hlynk is not responsible for payment failures, delays, or errors caused by Safaricom's systems or network downtime. In such cases, please retry the transaction or contact us.
                </li>
                <li>
                  <strong>Subscription suspension:</strong> If a payment fails and is not resolved, we may suspend access to your account. Your data will not be deleted during a suspension period.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">4. Plan Features and Access</h2>
              <p className="mb-4">Access to certain features is restricted by your subscription plan:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Business Pro-only features</strong> include: Public Store/Shop pages (<code>/store/:slug</code>, <code>/shop/:slug</code>), Public Stay Booking pages (<code>/stay/:slug</code>), KCB Buni Direct Bank Settlement, Unlimited Staff Accounts, Staff Audit Logs & Activity Tracking, and Custom Roles & Permissions.</li>
                <li>Attempting to access Business Pro features on a Starter plan will result in an upgrade prompt. No unauthorised access to gated features is permitted.</li>
                <li>Staff accounts operate within the permissions defined by the business owner. hlynk is not responsible for the scope of access granted by business owners to their staff.</li>
                <li>Staff accounts are strictly prohibited from viewing or managing business billing and subscription information.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">5. How You May Use the Service</h2>
              <p className="mb-4">You may use hlynk for lawful business management purposes. You agree not to:</p>
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
              <h2 className="text-xl font-black text-slate-900 mb-4">6. Partner Referral Programme</h2>
              <p className="mb-3">
                hlynk operates a partner referral programme that allows existing users to earn commissions by referring new businesses to the platform. Participation is subject to the following terms:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Referral commissions</strong> are calculated as a percentage of the referred business's first subscription payment. Current commission rates are displayed in your account dashboard and may vary by plan.</li>
                <li><strong>The 180-day Season Rule:</strong> Referral commissions on renewals are only payable if you have referred at least one new business in the preceding 180-day season window. If you have not onboarded a new business within the active season, renewal commissions will not be paid until a new qualifying referral is made.</li>
                <li>Commission payouts are subject to admin approval and are settled to your registered M-Pesa number. Settlement timelines are displayed in your account.</li>
                <li>Hlynk reserves the right to disqualify referrals that are fraudulent, self-referrals, or that violate the spirit of the programme.</li>
                <li>The partner programme terms, commission rates, and season rules may be updated by hlynk at any time with reasonable notice.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">7. Public Storefront Pages</h2>
              <p className="mb-3">
                Business Pro subscribers may activate public-facing pages that allow their customers to view products, book rooms, or place orders online. By activating these features, you agree that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are solely responsible for the accuracy of product listings, pricing, availability, and all information displayed on your public storefront.</li>
                <li>You must not list illegal, counterfeit, or prohibited goods or services on your public page.</li>
                <li>hlynk is not a party to any transaction between you and your customers. We are not liable for disputes arising from orders placed through your public storefront.</li>
                <li>hlynk reserves the right to deactivate any public page that violates these Terms or Kenyan law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">8. Your Data and Our Role</h2>
              <p className="mb-3">
                All business data, inventory records, transaction histories, and customer information that you enter into hlynk remains yours. We do not claim ownership of it.
              </p>
              <p className="mb-3">
                By using the Service, you grant hlynk a limited licence to host, store, and process your data for the sole purpose of delivering the platform's features to you. We do not use your business data for advertising or share it with third parties for commercial purposes.
              </p>
              <p>
                If your account is terminated or you cancel your subscription, you may request an export of your data within <strong>30 days</strong> of termination. After that period, your data may be permanently deleted from our systems, subject to any mandatory retention requirements under Kenyan law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">9. Customer Data Responsibility</h2>
              <p className="mb-3">
                If you use hlynk to record information about your customers — such as names, phone numbers, or purchase history — you are the data controller for that information under the <strong>Kenya Data Protection Act 2019</strong>. hlynk processes this data on your behalf as a data processor.
              </p>
              <p>
                You are responsible for ensuring that you have a lawful basis for collecting and storing your customers' personal data, and for informing them about how their information is used. hlynk is not liable for claims arising from your handling of customer data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">10. Service Availability</h2>
              <p className="mb-3">
                We aim to keep hlynk available at all times, but we cannot guarantee uninterrupted access. The platform may be temporarily unavailable due to scheduled maintenance, technical issues, or circumstances outside our control (including third-party service outages such as Safaricom's M-Pesa network or Google's authentication services).
              </p>
              <p>
                We will notify users of planned maintenance where possible. We are not liable for losses arising from temporary unavailability of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">11. Intellectual Property</h2>
              <p>
                The hlynk platform — including its interface, code, branding, features, and documentation — is the intellectual property of hlynk and its operator. You are granted a limited, non-exclusive, non-transferable licence to use the platform for the duration of your active subscription. This licence does not give you any ownership rights over the platform or its components.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">12. Limitation of Liability</h2>
              <p className="mb-3">
                hlynk provides the platform on an "as is" basis. We do not guarantee that the platform is error-free or that all features will work perfectly in every situation.
              </p>
              <p className="mb-3">
                To the maximum extent permitted by Kenyan law, hlynk shall not be liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Loss of profits, revenue, or business data arising from use of or inability to use the platform.</li>
                <li>Errors in financial reports generated by the platform due to data entered incorrectly by the user.</li>
                <li>Losses resulting from M-Pesa transaction failures or Safaricom network issues.</li>
                <li>Losses resulting from Google authentication service outages or account issues.</li>
                <li>Any indirect or consequential losses not directly caused by hlynk's own negligence.</li>
                <li>Disputes or losses arising from transactions conducted through a business's public storefront page.</li>
              </ul>
              <p className="mt-4">
                Our total liability to you in any circumstances shall not exceed the total subscription fees you paid to hlynk in the 3 months prior to the event giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">13. Termination</h2>
              <p className="mb-3">
                You may cancel your use of hlynk at any time by ceasing to renew your subscription. Access to the platform remains available until your current subscription period ends.
              </p>
              <p className="mb-3">
                We reserve the right to suspend or terminate your account if:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You violate these Terms in a material way.</li>
                <li>We have reasonable grounds to believe your account is being used fraudulently or for unlawful purposes.</li>
                <li>You fail to resolve a payment failure within the applicable notice period.</li>
              </ul>
              <p className="mt-4">
                Where termination is initiated by us without cause, we will provide at least <strong>14 days' notice</strong> and a pro-rated refund for any unused subscription period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">14. Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time as the platform grows or as required by law. If we make material changes, we will notify you by email or via an in-app notice at least <strong>30 days</strong> before the new terms take effect. Continued use of the platform after that date constitutes acceptance of the updated Terms. If you do not agree to the new Terms, you may stop using the platform before the changes take effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">15. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of Kenya. Any disputes arising from the use of the hlynk platform shall first be attempted to be resolved through direct communication. If unresolved, disputes shall be subject to the jurisdiction of the courts of Kenya.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">16. Contact Us</h2>
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