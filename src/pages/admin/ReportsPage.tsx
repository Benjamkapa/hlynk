import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { FileText, Download, Filter, Search, Calendar, ChevronRight } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'

import { useEffect } from 'react'
import { AdminStats } from '../../lib/types/api'

export default function ReportsPage() {
  const { data: stats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats
  })

  useEffect(() => {
    if (error) toast.error('Failed to load reports data')
  }, [error])

  const reports = stats?.availableReports || []
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reports & Exports</h1>
          <p className="text-gray-500 font-medium">Generate, schedule and export platform-wide analytical data</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-gray-600 h-12 px-6 rounded-md border border-gray-100 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2">
            Automations
          </button>
          <button className="bg-[#0D4A3E] text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2">
            <Calendar size={18} /> Schedule Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900">Available Reports</h3>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search reports..." 
                className="pl-12 pr-4 py-3 bg-gray-50 border-none rounded-md text-sm focus:ring-2 focus:ring-emerald-500/10 outline-none w-64 font-medium" 
              />
            </div>
            <button className="bg-gray-50 text-gray-500 h-11 px-4 rounded-md flex items-center gap-2 font-bold text-xs hover:bg-gray-100 transition-all border border-gray-100">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Report Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Generated</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">File Size</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : reports.length > 0 ? reports.map((report: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-all group cursor-pointer">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <FileText size={18} />
                      </div>
                      <span className="font-black text-gray-900 text-sm">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest">{report.type}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-400 hl-mono">{new Date(report.lastGenerated).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-400 hl-mono">{report.size}</td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-emerald-600 hover:text-emerald-700 font-black text-xs flex items-center gap-2 ml-auto uppercase tracking-widest">
                      <Download size={14} />
                      Download
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No reports available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="bg-emerald-900 rounded-lg p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-3">Custom Data Export</h3>
            <p className="text-emerald-200 font-medium text-sm leading-relaxed mb-8 max-w-sm">Need a specific data slice? Use our advanced query builder to export custom CSV or JSON files.</p>
            <button className="bg-emerald-400 text-emerald-900 px-6 py-3 rounded-md font-black text-xs hover:bg-emerald-300 transition-all uppercase tracking-widest">
              Open Query Builder
            </button>
          </div>
          <FileText size={160} className="absolute -right-10 -bottom-10 text-emerald-800 opacity-20 rotate-12" />
        </div>

        <div className="bg-white rounded-lg p-10 border border-gray-100 shadow-sm flex flex-col justify-between">
           <div>
             <h3 className="text-2xl font-black text-gray-900 mb-3">Scheduled Tasks</h3>
             <p className="text-gray-500 font-medium text-sm leading-relaxed">You have {stats?.scheduledReportsCount || 0} active report schedules running daily.</p>
           </div>
           <button className="mt-8 flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
             Manage Schedules <ChevronRight size={14} />
           </button>
        </div>
      </div>
    </div>
  )
}
