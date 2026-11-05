import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Download, Play } from 'lucide-react'
import { ButtonLoader } from '../../components/shared/InlineLoader'

const presets = {
  'Sales audit': { table: 'Sale', columns: 'id,totalAmount,paymentMethod,createdAt' },
  'Business growth': { table: 'Tenant', columns: 'id,businessName,category,createdAt' },
  'User registry': { table: 'User', columns: 'id,name,email,role,isActive' },
  'Subscription health': { table: 'Subscription', columns: 'id,planName,status,startDate,endDate' },
} as const

const DOSSIER_SHEETS: [string, string][] = [
  ['KPI summary', 'Revenue and platform counts'],
  ['Transactions', 'Full payment ledger'],
  ['Tenants', 'Vendor directory'],
  ['Subscriptions', 'Plans and expiries'],
  ['M-Pesa', 'STK and C2B logs'],
  ['Payouts', 'Settlement state'],
  ['Sales volume', 'POS and receipts'],
  ['Top 20', 'Revenue leaders'],
  ['Activity log', 'Security audit trail'],
]

const inputCls =
  'w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D4A3E]'

const cell = (v: any) => (v !== null && typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''))

export default function ReportsPage() {
  const [table, setTable] = useState('User')
  const [columns, setColumns] = useState('id,name,email')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [queryResult, setQueryResult] = useState<any[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const { data: schedules } = useQuery<any[]>({
    queryKey: ['admin-schedules'],
    queryFn: () => adminApi.getSchedules().then((res) => res.data),
  })

  const handleExportDossier = async () => {
    setIsExporting(true)
    const toastId = toast.loading('Compiling multi-sheet intelligence report...')
    try {
      await adminApi.downloadPlatformReport()
      toast.success('Platform intelligence report downloaded successfully (.xlsx)', { id: toastId })
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to export platform report. Please try again.', { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }

  const applyPreset = (p: keyof typeof presets) => {
    setTable(presets[p].table)
    setColumns(presets[p].columns)
    setActivePreset(p)
    toast.success(`Applied ${p} template`)
  }

  const runQuery = useMutation({
    mutationFn: () =>
      adminApi.runReportQuery({
        table,
        columns: columns
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    onSuccess: (res) => {
      setQueryResult(res?.data || res)
      toast.success('Query executed successfully')
    },
    onError: () => toast.error('Failed to execute query'),
  })

  const exportResultCsv = () => {
    const replacer = (_key: any, value: any) => (value === null ? '' : value)
    const header = Object.keys(queryResult[0])
    const csv = [
      header.join(','),
      ...queryResult.map((row) => header.map((f) => JSON.stringify(row[f], replacer)).join(',')),
    ].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query-export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs text-slate-500">Exports, queries and schedules</p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">Reports</h1>
      </header>

      {/* Dossier */}
      <section className="overflow-hidden rounded-md bg-[#0D4A3E] text-white">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm text-emerald-100/70">Full export</p>
            <h2 className="mt-2 font-serif text-3xl tracking-tight">Platform intelligence dossier</h2>
            <p className="mt-3 text-sm leading-relaxed text-emerald-100/70">
              One Excel workbook with operational, financial, transactional and audit data across the whole platform,
              one sheet per area.
            </p>
          </div>
          <button
            onClick={handleExportDossier}
            disabled={isExporting}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded bg-white px-5 py-2.5 text-sm font-medium text-[#0D4A3E] transition-colors hover:bg-emerald-50 disabled:opacity-60"
          >
            {isExporting ? <ButtonLoader size="sm" /> : <Download size={15} />}
            {isExporting ? 'Compiling…' : 'Download .xlsx'}
          </button>
        </div>

        <ol className="grid grid-cols-3 gap-px border-t border-white/10 bg-white/10 lg:grid-cols-3">
          {DOSSIER_SHEETS.map(([name, desc], i) => (
            <li key={name} className="flex items-baseline gap-4 bg-[#0D4A3E] px-6 py-4">
              <span className="text-xs tabular-nums text-emerald-100/40 hl-mono">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-emerald-100/60">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Query builder */}
      <section className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Custom query</h2>
          <p className="mt-0.5 text-xs text-slate-500">Pick a table and columns, run it, then export the result</p>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <p className="text-xs font-medium text-slate-500">Start from a template</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(presets) as (keyof typeof presets)[]).map((p) => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                    activePreset === p
                      ? 'border-[#0D4A3E] bg-emerald-50 text-[#0D4A3E]'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Table</label>
              <select
                className={inputCls}
                value={table}
                onChange={(e) => {
                  setTable(e.target.value)
                  setActivePreset(null)
                }}
              >
                <option value="User">Users</option>
                <option value="Tenant">Businesses</option>
                <option value="Sale">Transactions</option>
                <option value="Subscription">Subscriptions</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-slate-500">Columns, comma separated</label>
              <input
                type="text"
                className={`${inputCls} hl-mono`}
                value={columns}
                onChange={(e) => {
                  setColumns(e.target.value)
                  setActivePreset(null)
                }}
              />
            </div>
          </div>

          <button
            onClick={() => runQuery.mutate()}
            disabled={runQuery.isPending}
            className="inline-flex items-center gap-2 rounded bg-[#0D4A3E] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0A3D33] disabled:opacity-60"
          >
            {runQuery.isPending ? (
              'Running…'
            ) : (
              <>
                <Play size={14} /> Run query
              </>
            )}
          </button>
        </div>

        {queryResult.length > 0 && (
          <div className="border-t border-slate-200">
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-sm text-slate-900">
                {queryResult.length} {queryResult.length === 1 ? 'row' : 'rows'}
                {queryResult.length > 10 && (
                  <span className="ml-2 text-xs text-slate-500">showing first 10 · export includes all</span>
                )}
              </p>
              <button
                onClick={exportResultCsv}
                className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-y border-slate-200 text-xs text-slate-500">
                    {Object.keys(queryResult[0]).map((k) => (
                      <th key={k} className="whitespace-nowrap px-6 py-3 font-medium">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queryResult.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      {Object.values(row).map((v: any, vi) => (
                        <td key={vi} className="max-w-xs truncate px-6 py-3 text-sm text-slate-700">
                          {cell(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Schedules */}
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Scheduled reports</h2>
        </div>

        {schedules && schedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Frequency</th>
                  <th className="px-6 py-3 font-medium">Recipients</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{s.name}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-700">{s.table}</td>
                    <td className="px-6 py-3.5 text-sm capitalize text-slate-700">{String(s.frequency || '').toLowerCase()}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">{s.recipients}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-2 text-sm ${
                          s.isActive ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${s.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {s.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-6 py-14 text-center text-sm text-slate-400">No scheduled reports yet.</p>
        )}
      </section>
    </div>
  )
}