import AuthCommunityCard from './AuthCommunityCard'

interface AuthShowcaseProps {
  className?: string
}

export default function AuthShowcase({ className = '' }: AuthShowcaseProps) {
  return (
    <aside className={className}>
      <div className="mx-auto w-full max-w-[360px] space-y-5">
        <div className="space-y-2 text-center lg:text-left">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Provider Voices</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">See what businesses say about the portal</h2>
          <p className="text-sm leading-6 text-slate-500">
            Real feedback from providers already using hlynk to run day-to-day operations.
          </p>
        </div>
        <AuthCommunityCard />
      </div>
    </aside>
  )
}
