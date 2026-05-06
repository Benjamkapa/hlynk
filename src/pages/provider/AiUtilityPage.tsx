import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BrainCircuit, Copy, ExternalLink, KeyRound, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import FeatureGate from '../../components/shared/FeatureGate'
import { providersApi } from '../../lib/api/providers'
import { exportToCSV } from '../../lib/utils/export'

export default function AiUtilityPage() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['provider-reports'],
    queryFn: providersApi.getStats,
  })

  const aiConfig = profile?.data?.operationalSettings?.ai
  const providerName = profile?.data?.businessName || 'your business'
  const aiReportData = stats?.aiReportData

  const hasActiveKey = Boolean(aiConfig?.provider && aiConfig.provider !== 'none' && aiConfig.apiKey)

  const prompt = useMemo(() => {
    if (!stats || !aiReportData) return ''

    return `Act as an expert business consultant for ${providerName}. Review the performance data below and give practical next-step advice.

BUSINESS PERFORMANCE SNAPSHOT (LAST 26 DAYS)
- Gross Revenue: KES ${Number(aiReportData.totalSales26Days || 0).toLocaleString()}
- Total Expenses: KES ${Number(aiReportData.totalExpenses26Days || 0).toLocaleString()}
- Net Profit: KES ${Number((aiReportData.totalSales26Days || 0) - (aiReportData.totalExpenses26Days || 0)).toLocaleString()}
- Total Transactions: ${Number(aiReportData.transactionCount26Days || 0).toLocaleString()}
- Out of Stock Items: ${Number(stats.outOfStockCount || 0).toLocaleString()}
- Current Estimated Profit: KES ${Number(stats.profit || 0).toLocaleString()}

Please respond with:
1. A short health summary of the business.
2. Key risks or warning signs.
3. Three specific recommendations to improve profit and stock control over the next 30 days.
4. One quick win the owner should act on today.`
  }, [aiReportData, providerName, stats])

  const handleCopyPrompt = async () => {
    if (!prompt) {
      toast.error('There is not enough report data to build an AI prompt yet.')
      return
    }

    await navigator.clipboard.writeText(prompt)
    toast.success('AI prompt copied to clipboard.')
  }

  const handleCopySnapshot = async () => {
    if (!stats) {
      toast.error('Business data is still loading.')
      return
    }

    const snapshot = JSON.stringify(
      {
        providerName,
        outOfStockCount: stats.outOfStockCount,
        profit: stats.profit,
        aiReportData: stats.aiReportData,
      },
      null,
      2,
    )

    await navigator.clipboard.writeText(snapshot)
    toast.success('Business snapshot copied.')
  }

  const handleExportSnapshot = () => {
    if (!aiReportData) {
      toast.error('There is no AI snapshot to export yet.')
      return
    }

    exportToCSV(
      [
        {
          providerName,
          totalSales26Days: aiReportData.totalSales26Days,
          totalExpenses26Days: aiReportData.totalExpenses26Days,
          transactionCount26Days: aiReportData.transactionCount26Days,
          outOfStockCount: stats?.outOfStockCount || 0,
          profit: stats?.profit || 0,
        },
      ],
      'ai_utility_snapshot',
    )

    toast.success('AI utility snapshot exported.')
  }

  if (profileLoading || statsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <FeatureGate feature="ai_analyst">
      <div className="space-y-8 pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700">Pro Utility</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">AI Business Utility</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
              Your AI key is stored in business settings, and this workspace turns your live sales and expense data into a ready-to-use analyst brief.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Connection Status</p>
            <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-900">
              <KeyRound size={16} className={hasActiveKey ? 'text-emerald-600' : 'text-amber-500'} />
              {hasActiveKey ? `Connected to ${String(aiConfig.provider).toUpperCase()}` : 'No active AI key linked yet'}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <MetricCard label="Gross Revenue" value={`KES ${Number(aiReportData?.totalSales26Days || 0).toLocaleString()}`} />
          <MetricCard label="Total Expenses" value={`KES ${Number(aiReportData?.totalExpenses26Days || 0).toLocaleString()}`} />
          <MetricCard label="Transactions" value={Number(aiReportData?.transactionCount26Days || 0).toLocaleString()} />
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_380px]">
          <section className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Generated Analyst Prompt</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Copy this prompt into ChatGPT, Claude, Gemini, or any supported assistant to get a detailed performance review.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                <Sparkles size={14} />
                Live Business Data
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-950 p-6 text-sm leading-7 text-slate-100">
              <pre className="whitespace-pre-wrap font-mono">{prompt || 'Report data will appear here once your dashboard metrics are available.'}</pre>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D4A3E] px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#0A3D33]"
              >
                <Copy size={16} />
                Copy AI Prompt
              </button>
              <button
                type="button"
                onClick={handleCopySnapshot}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:text-emerald-600"
              >
                <BrainCircuit size={16} />
                Copy Data Snapshot
              </button>
              <button
                type="button"
                onClick={handleExportSnapshot}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:text-emerald-600"
              >
                <ExternalLink size={16} />
                Export Snapshot
              </button>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">What Happens With Your Key</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <p>
                  The key you add in settings is saved with your business profile so the portal knows AI tools are enabled for your account.
                </p>
                <p>
                  Right now this utility converts your live sales data into a structured prompt you can use immediately. Direct provider-to-model execution can be wired next if you want the full report generated inside HudumaLynk.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/60 p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Best Next Step</p>
              <p className="mt-3 text-sm leading-6 text-emerald-900">
                {hasActiveKey
                  ? 'Your AI provider is already linked. Use the prompt tools above now, or we can add full in-app report generation next.'
                  : 'Link an AI provider in Settings, then come back here to use your account’s AI workspace with live business data.'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </FeatureGate>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">{value}</p>
    </div>
  )
}
