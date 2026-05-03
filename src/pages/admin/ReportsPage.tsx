import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { FileText, Download, Calendar, Play } from 'lucide-react'

export default function ReportsPage() {
  const [table, setTable] = useState('User')
  const [columns, setColumns] = useState('id,name,email')
  const [queryResult, setQueryResult] = useState<any[]>([])

  const { data: schedules } = useQuery<any[]>({
    queryKey: ['admin-schedules'],
    queryFn: () => adminApi.getSchedules().then(res => res.data)
  })

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
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reports & Exports</h1>
          <p className="text-slate-500 font-medium">Generate, schedule and export platform-wide analytical data</p>
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
