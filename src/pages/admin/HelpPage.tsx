import { useState } from 'react'
import { Search, X } from 'lucide-react'

type Section = { heading: string; body: React.ReactNode }
type Guide = { id: string; title: string; desc: string; heading: string; keywords: string; sections: Section[] }

const code = (t: string) => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.85em] text-slate-800">{t}</code>

const GUIDES: Guide[] = [
  {
    id: 'onboarding',
    title: 'User onboarding',
    desc: 'How new businesses are registered and verified.',
    heading: 'How onboarding works',
    keywords: 'tenant creation google account identity verification oauth trial subscription plan assignment register provider',
    sections: [
      {
        heading: 'Tenant creation',
        body: (
          <p>
            A new business is tied to the Google account of its main administrator. You don't enter a KRA PIN: the
            system creates the tenant from that Google sign-in.
          </p>
        ),
      },
      {
        heading: 'Identity verification',
        body: (
          <p>
            Google's sign-in flow verifies the business's email address and identity, so there are no SMS codes or
            confirmation links to manage.
          </p>
        ),
      },
      {
        heading: 'Subscription assignment',
        body: (
          <p>
            New businesses start on a 14-day <strong>Trial</strong>. For a key partner, open <strong>Subscriptions</strong>{' '}
            and use <strong>Change plan</strong> to put them on Growth or Business Pro straight away.
          </p>
        ),
      },
    ],
  },
  {
    id: 'risk',
    title: 'Risk management',
    desc: 'Risk scores and fraud detection.',
    heading: 'Risk and fraud detection',
    keywords: 'duplicate receipts mpesa forensic alert intrusion detection ip block failed login risk scoring suspend tenant business',
    sections: [
      {
        heading: 'Duplicate receipts',
        body: (
          <p>
            The payment parser matches M-Pesa receipt IDs exactly. If the same 10-character code is recorded by
            different businesses, the platform raises a {code('Forensic Alert')} and suspends that transaction entry.
          </p>
        ),
      },
      {
        heading: 'Blocking repeated failed sign-ins',
        body: (
          <p>
            More than 5 failed sign-ins from one IP address block that IP for 30 minutes. Turn this on under{' '}
            <strong>Settings &gt; Security</strong> with <strong>Block repeated failed sign-ins</strong>.
          </p>
        ),
      },
      {
        heading: 'Risk scoring',
        body: (
          <p>
            A business that records large volumes of entries without matching payment confirmations gets a higher risk
            score. If one goes past the safe limit, open it from <strong>Businesses</strong> and choose{' '}
            <strong>Suspend business</strong> to lock its access.
          </p>
        ),
      },
    ],
  },
  {
    id: 'payouts',
    title: 'Payout systems',
    desc: 'Automated and manual settlements.',
    heading: 'Settlements and payouts',
    keywords: 'b2c safaricom handshake manual paybill settlement balance mark as paid reference platform fee withholding',
    sections: [
      {
        heading: 'Automatic payouts (B2C)',
        body: (
          <p>
            Fully verified businesses with API permission are paid directly through Safaricom B2C. Funds are reserved
            and sent when the settlement window opens. To check that this works, run a test from{' '}
            <strong>Settings &gt; Infrastructure</strong>.
          </p>
        ),
      },
      {
        heading: 'Manual paybill settlement',
        body: (
          <>
            <p>Businesses using the shared paybill build up a {code('Settlement Balance')}. To clear it:</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Transfer the accumulated KES from the bank or paybill to the business's number.</li>
              <li>Copy the reference code from the business.</li>
              <li>
                Open <strong>Treasury &gt; Payouts</strong> and select the pending settlement.
              </li>
              <li>
                Choose <strong>Mark as Paid</strong> and enter the reference code to clear it from the ledger.
              </li>
            </ol>
          </>
        ),
      },
      {
        heading: 'Platform fee',
        body: (
          <p>
            The platform fee (for example 5.0%) is withheld before net profit is calculated. Changing it under{' '}
            <strong>Settings &gt; General</strong> applies to <em>future</em> transactions only. Past data stays as it was.
          </p>
        ),
      },
    ],
  },
]

export default function HelpPage() {
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(GUIDES[0].id)

  const q = query.trim().toLowerCase()
  const visible = q
    ? GUIDES.filter((g) =>
        [g.title, g.desc, g.heading, g.keywords].some((s) => s.toLowerCase().includes(q))
      )
    : GUIDES
  const active = visible.find((g) => g.id === activeId) ?? visible[0]

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">Internal documentation for administrators</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">Help</h1>
        </div>
        <label className="relative block w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides"
            aria-label="Search guides"
            className="w-full rounded border border-slate-300 bg-white py-2.5 pl-8 pr-8 text-sm outline-none placeholder:text-slate-400 focus:border-[#0D4A3E]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </label>
      </header>

      {visible.length === 0 ? (
        <section className="rounded-md border border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-slate-700">No guides match "{query}"</p>
          <button onClick={() => setQuery('')} className="mt-2 text-sm font-medium text-[#0D4A3E] hover:underline">
            Clear search
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Guide list */}
          <nav aria-label="Guides" className="flex flex-col gap-1">
            {visible.map((g) => {
              const on = g.id === active?.id
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveId(g.id)}
                  aria-current={on ? 'page' : undefined}
                  className={`border-l-2 px-3 py-2.5 text-left transition-colors ${
                    on ? 'border-[#0D4A3E] text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className={`block text-sm ${on ? 'font-semibold' : 'font-medium'}`}>{g.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-400">{g.desc}</span>
                </button>
              )
            })}
          </nav>

          {/* Article */}
          {active && (
            <article className="overflow-hidden rounded-md border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
                <p className="text-xs text-slate-500">{active.title}</p>
                <h2 className="mt-1 font-serif text-2xl tracking-tight text-slate-900">{active.heading}</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {active.sections.map((s) => (
                  <section key={s.heading} className="grid gap-2 px-6 py-6 sm:px-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
                    <h3 className="text-sm font-semibold text-slate-900">{s.heading}</h3>
                    <div className="max-w-2xl text-sm leading-relaxed text-slate-600 [&_strong]:font-semibold [&_strong]:text-slate-900">
                      {s.body}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          )}
        </div>
      )}

      {/* Contact */}
      <section className="flex flex-col gap-4 rounded-md bg-[#0D4A3E] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="max-w-xl">
          <h2 className="font-serif text-2xl tracking-tight">Something urgent?</h2>
          <p className="mt-1 text-sm leading-relaxed text-emerald-100/80">
            For platform infrastructure problems or security incidents, email the engineering team directly.
          </p>
        </div>
        <a
          href="mailto:devops@hlynk.co.ke?subject=URGENT: Platform Infrastructure Support Request"
          className="inline-flex h-10 shrink-0 items-center rounded bg-white px-4 text-sm font-medium text-[#0D4A3E] transition-colors hover:bg-emerald-50"
        >
          Email DevOps
        </a>
      </section>
    </div>
  )
}