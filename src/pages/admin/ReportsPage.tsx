import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { FileText, Download, Calendar, Play, FileSpreadsheet, CheckCircle2, TrendingUp, ShieldCheck, Database, Layers, Sparkles } from 'lucide-react'
import { ButtonLoader } from '../../components/shared/InlineLoader'

export default function ReportsPage() {
  const [table, setTable] = useState('User')
  const [columns, setColumns] = useState('id,name,email')
  const [queryResult, setQueryResult] = useState<any[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const { data: schedules } = useQuery<any[]>({
    queryKey: ['admin-schedules'],
    queryFn: () => adminApi.getSchedules().then(res => res.data)
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

  const presets = {
    'Sales Audit': { table: 'Sale', columns: 'id,totalAmount,paymentMethod,createdAt' },
    'Business Growth': { table: 'Tenant', columns: 'id,businessName,category,createdAt' },
    'User Registry': { table: 'User', columns: 'id,name,email,role,isActive' },
    'Subscription Health': { table: 'Subscription', columns: 'id,planName,status,startDate,endDate' }
  }

  const applyPreset = (p: keyof typeof presets) => {
    setTable(presets[p].table)
    setColumns(presets[p].columns)
    toast.success(`Applied ${p} template`)
  }

  const runQuery = useMutation({
    mutationFn: () => adminApi.runReportQuery({
      table,
      columns: columns.split(',').map(s => s.trim()).filter(Boolean)
    }),
    onSuccess: (res) => {
      setQueryResult(res?.data || res)
      toast.success('Query executed successfully')
    },
    onError: () => toast.error('Failed to execute query')
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-4">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports & Exports</h1>
          <p className="text-slate-500 font-medium">Generate, schedule and export platform-wide analytical intelligence</p>
        </div>
        <button
          onClick={handleExportDossier}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm shadow-sm transition-all"
        >
          {isExporting ? <ButtonLoader size="sm" /> : <Download size={16} />}
          <span>{isExporting ? 'Compiling Dossier...' : 'Export Full Intelligence Dossier (.xlsx)'}</span>
        </button>
      </div>

      {/* Featured Intelligence Dossier Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Sparkles size={14} />
                <span>Executive Business Intelligence</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Platform Intelligence Dossier</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Automatically generate an investor-grade, multi-tab Microsoft Excel (.xlsx) workbook aggregating all operational, financial, transactional, and audit data across the entire ecosystem.
              </p>
            </div>
            
            <button
              onClick={handleExportDossier}
              disabled={isExporting}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/20 shrink-0"
            >
              {isExporting ? (
                <>
                  <ButtonLoader size="sm" />
                  <span>Compiling 9 Sheets...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet size={18} />
                  <span>Download Excel Dossier (.xlsx)</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5 mt-6 pt-6 border-t border-white/10 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center text-center">
              <span className="text-base mb-1">📊</span>
              <span className="font-semibold text-white">KPI Summary</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Rev & Counts</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center text-center">
              <span className="text-base mb-1">💳</span>
              <span className="font-semibold text-white">Transactions</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Payment Ledger</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center text-center">
              <span className="text-base mb-1">🏪</span>
              <span className="font-semibold text-white">Tenants</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Vendor Directory</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center text-center">
              <span className="text-base mb-1">📋</span>
              <span className="font-semibold text-white">Subscriptions</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Plans & Expiries</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center text-center">
              <span className="text-base mb-1">📱</span>
              <span className="font-semibold text-white">M-Pesa</span>
              <span className="text-[10px] text-slate-400 mt-0.5">STK & C2B Logs</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center text-center">
              <span className="text-base mb-1">💸</span>
              <span className="font-semibold text-white">Payouts</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Settlement State</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center text-center">
              <span className="text-base mb-1">🛒</span>
              <span className="font-semibold text-white">Sales Volume</span>
              <span className="text-[10px] text-slate-400 mt-0.5">POS & Receipts</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center text-center">
              <span className="text-base mb-1">🏆</span>
              <span className="font-semibold text-white">Top 20</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Revenue Leaders</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center text-center">
              <span className="text-base mb-1">🔐</span>
              <span className="font-semibold text-white">Activity Log</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Security Audit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Quick Templates</h3>
        <div className="flex flex-wrap gap-3">
          {Object.keys(presets).map((p) => (
            <button
              key={p}
              onClick={() => applyPreset(p as keyof typeof presets)}
              className="px-5 py-3 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-lg hover:shadow-emerald-900/5 transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Custom Query Builder</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Deep data extraction tool</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Table</label>
            <select className="w-full h-11 px-4 bg-slate-50 border-none rounded-md" value={table} onChange={e => setTable(e.target.value)}>
              <option value="User">Users</option>
              <option value="Tenant">Tenants (Businesses)</option>
              <option value="Sale">Transactions</option>
              <option value="Subscription">Subscriptions</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Select Columns (comma separated)</label>
            <input type="text" className="w-full h-11 px-4 bg-slate-50 border-none rounded-md" value={columns} onChange={e => setColumns(e.target.value)} />
          </div>
        </div>
        
        <button 
          onClick={() => runQuery.mutate()} 
          disabled={runQuery.isPending}
          className="bg-emerald-600 text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-emerald-700 transition"
        >
          {runQuery.isPending ? 'Running...' : <span className="flex items-center gap-2"><Play size={16} /> Run Query</span>}
        </button>

        {queryResult.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-700">Results ({queryResult.length} rows)</h4>
              <button 
                onClick={() => {
                  const replacer = (_key: any, value: any) => value === null ? '' : value
                  const header = Object.keys(queryResult[0])
                  const csv = [
                    header.join(','),
                    ...queryResult.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                  ].join('\r\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `query-export-${Date.now()}.csv`
                  a.click()
                }}
                className="text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-md text-xs font-bold"
              >
                Export CSV
              </button>
            </div>
            <table className="w-full text-left text-sm border border-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {Object.keys(queryResult[0]).map(k => <th key={k} className="p-3 font-semibold text-slate-500">{k}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queryResult.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v: any, vi) => <td key={vi} className="p-3 text-slate-700 truncate max-w-xs">{JSON.stringify(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {queryResult.length > 10 && <p className="text-center text-xs text-slate-400 py-4">Showing top 10 results</p>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-emerald-600" /> Report Schedules
        </h3>
        {schedules && schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((s, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-lg flex justify-between items-center bg-slate-50/50">
                <div>
                  <h4 className="font-bold text-slate-900">{s.name}</h4>
                  <p className="text-xs text-slate-500">Query: {s.table} | Freq: {s.frequency} | To: {s.recipients}</p>
                </div>
                <div className="text-xs font-black px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  {s.isActive ? 'Active' : 'Paused'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 bg-slate-50 p-6 text-center rounded-lg border border-dashed border-slate-200">
            No automated report schedules configured yet.
          </p>
        )}
      </div>
    </div>
  )
}
