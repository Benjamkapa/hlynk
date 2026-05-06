import { TrendingUp, TrendingDown, Download, BarChart3, PieChart, Loader2, RefreshCcw, Filter, ChevronLeft, ChevronRight, FileText, Sparkles, Copy, BrainCircuit } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { providersApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { exportToCSV } from '../../lib/utils/export'
import { useState, useEffect } from 'react'
import { ProviderStats } from '../../lib/types/api'

export default function ReportsPage() {
  const [logPage, setLogPage] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile
  })

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<ProviderStats & { aiReportData?: any }>({
    queryKey: ['provider-reports'],
    queryFn: providersApi.getStats
  })

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['activity-logs', logPage],
    queryFn: () => providersApi.getActivityLogs({ page: logPage, limit: 10 })
  })

  useEffect(() => {
    if (statsError) toast.error(getErrorMessage(statsError))
  }, [statsError])

  if (statsLoading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 size={40} className="animate-spin text-emerald-600" />
    </div>
  )

  const chartData = stats?.salesChart || []

  const handleExport = () => {
    if (!stats) return
    exportToCSV(chartData, 'weekly_performance')
    toast.success('Report exported to CSV')
  }

  const handleLogExport = () => {
    if (!logsData?.items) return
    exportToCSV(logsData.items, 'activity_logs')
    toast.success('Logs exported to CSV')
  }

  const aiConfig = profile?.data?.operationalSettings?.ai

  const generatePrompt = () => {
    if (!stats || !stats.aiReportData) return ''
    const { totalSales26Days, totalExpenses26Days, transactionCount26Days } = stats.aiReportData
    
    return `Act as an expert business consultant for my retail shop. Please analyze my performance over the last 26 days and give me actionable insights.

PERFORMANCE DATA (Last 26 Days):
- Gross Revenue: KES ${totalSales26Days.toLocaleString()}
- Total Expenses: KES ${totalExpenses26Days.toLocaleString()}
- Net Profit: KES ${(totalSales26Days - totalExpenses26Days).toLocaleString()}
- Total Transactions: ${transactionCount26Days}
- Out of Stock Items Currently: ${stats.outOfStockCount}

Please provide a brief, actionable report detailing:
1. Overall trend analysis (is my business healthy?)
2. Critical warnings (inventory management, expense ratio)
3. Three highly specific, actionable tips to increase my profit margin next month. Format the response beautifully using Markdown.`
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatePrompt())
    toast.success('Prompt copied! Paste it into ChatGPT or Claude.')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Reports</h1>
          <p className="text-gray-500 font-medium">Deep dive into your sales velocity and profit margins</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white text-gray-600 h-12 px-6 rounded-xl border border-gray-100 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Download size={18} />
          Export All Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[14px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-gray-900">Weekly Performance</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Sales</span>
               </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 600, fontFamily: 'JetBrains Mono'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 600, fontFamily: 'JetBrains Mono'}} />
                <Tooltip 
                  cursor={{stroke: '#10B981', strokeWidth: 2}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }}
                  itemStyle={{ fontFamily: 'JetBrains Mono', fontWeight: 800 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0D4A3E] p-8 rounded-[14px] text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Estimated Profit (MTD)</p>
              <h2 className="text-3xl font-black mb-6 hl-mono">KES {Number(stats?.profit || 0).toLocaleString()}</h2>
              <div className="flex items-center gap-2 text-xs font-black bg-white/10 w-fit px-4 py-2 rounded-lg uppercase tracking-widest hl-mono">
                <TrendingUp size={16} />
                +15.4%
              </div>
            </div>
            <BarChart3 size={120} className="absolute -right-6 -bottom-6 text-white opacity-5 rotate-12" />
          </div>

          <div className="bg-white p-8 rounded-[14px] border border-gray-100 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Out of Stock Alerts</p>
            <h2 className="text-3xl font-black text-gray-900 mb-6 hl-mono">{stats?.outOfStockCount || 0} ITEMS</h2>
            <div className="flex items-center gap-2 text-xs font-black text-red-500 bg-red-50 w-fit px-4 py-2 rounded-lg uppercase tracking-widest hl-mono">
              <TrendingDown size={16} />
              Requires Action
            </div>
            <PieChart size={120} className="absolute -right-6 -bottom-6 text-gray-50 opacity-50 rotate-12" />
          </div>
        </div>
      </div>

      {/* <div className="mt-8">
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 p-8 rounded-[14px] text-white shadow-2xl relative overflow-hidden">
          <BrainCircuit size={150} className="absolute -right-10 -bottom-10 text-white opacity-5 rotate-12" />
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
              <Sparkles className="text-emerald-400" />
              Pro Feature: AI Business Analyst
            </h3>
            <p className="text-emerald-100/70 mb-8 max-w-2xl text-sm font-medium leading-relaxed">
              Generate a comprehensive 26-day performance report and get actionable business advice.
              {aiConfig?.provider && aiConfig.provider !== 'none' 
                ? ' Your AI API Key is linked. Click below to generate the report instantly.'
                : ' You haven\'t linked an AI API Key. You can still copy your data as a prompt and paste it manually into ChatGPT.'}
            </p>

            <div className="flex flex-wrap gap-4">
              {aiConfig?.provider && aiConfig.provider !== 'none' ? (
                <button 
                  onClick={() => toast.info('Direct API calling will be activated in the next phase.')}
                  disabled={isGenerating}
                  className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-emerald-400 transition-all shadow-lg flex items-center gap-2"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                  Generate AI Report Now!
                </button>
              ) : (
                <button 
                  onClick={handleCopyPrompt}
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Copy size={18} />
                  Copy AI Prompt
                </button>
              )}
            </div>
            
            {(!aiConfig?.provider || aiConfig.provider === 'none') && (
              <div className="mt-8 bg-black/30 rounded-xl p-6 border border-white/10 max-w-3xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">Preview of Prompt Payload</p>
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed h-32 overflow-y-auto custom-scrollbar pr-4">
                  {generatePrompt()}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div> */}

    </div>
  )
}
