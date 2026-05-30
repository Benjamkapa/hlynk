import { useState } from 'react'
import { 
  Zap, ShoppingCart, Users, Package, 
  TrendingUp, ArrowUpRight, ArrowDownRight, 
  Clock, DollarSign, Star
} from 'lucide-react'
import StarRating from '../../components/shared/StarRating'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { providersApi, salesApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../lib/utils/error'
import FeatureGate from '../../components/shared/FeatureGate'


import { useEffect } from 'react'
import { ProviderStats, PaginatedResponse } from '../../lib/types/api'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<ProviderStats>({
    queryKey: ['provider-stats'],
    queryFn: providersApi.getStats
  })

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile
  })

  const threshold = profile?.data?.operationalSettings?.lowStockThreshold || 5;

  const { data: salesResponse, isLoading: salesLoading, error: salesError } = useQuery<PaginatedResponse<any>>({
    queryKey: ['recent-sales'],
    queryFn: () => salesApi.list({ limit: 5 })
  })

  const recentSales = salesResponse?.items || []

  useEffect(() => {
    if (statsError) toast.error(getErrorMessage(statsError))
    if (salesError) toast.error(getErrorMessage(salesError))
  }, [statsError, salesError])

  const salesData = stats?.salesChart && stats.salesChart.length > 0 
    ? stats.salesChart 
    : Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: 0,
          profit: 0
        };
      });

  if (statsLoading || salesLoading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="mx-auto space-y-5 lg:space-y-12 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 lg:gap-6">
        <div className="space-y-0.5 lg:space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] lg:hidden">Today</p>
          <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Business Pulse</h1>
          <p className="text-slate-500 font-medium text-sm lg:text-xl">Store performance overview</p>
        </div>
      </div>

      {/* KPI Grid — 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8">
        <StoreKpi title="Daily Sales" value={`KES ${stats?.dailySales?.toLocaleString() || '0'}`} sub={`${stats?.dailyTransactions || 0} transactions`} icon={Zap} color="dark" trend="" />
        <StoreKpi title="New Customers" value={stats?.newCustomers || '0'} sub="Total registered" icon={Users} color="blue" trend="" />
        <FeatureGate feature="low_stock_alerts" variant="tease">
          <StoreKpi title="Out of Stock" value={stats?.outOfStockCount || '0'} sub={`Items below ${threshold} qty`} icon={Package} color="red" trend="" />
        </FeatureGate>
        <StoreKpi title="Daily Profit" value={`KES ${stats?.profit?.toLocaleString() || '0'}`} sub="Sales minus expenses" icon={TrendingUp} color="purple" trend="" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-10">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-white p-5 lg:p-10 rounded-[.5rem] border border-slate-100 shadow-xl shadow-slate-900/5">
          <div className="flex justify-between items-center mb-5 lg:mb-10">
            <div>
              <h3 className="text-base lg:text-2xl font-black text-slate-900">Revenue Trajectory</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 hidden lg:block">Movement of money in your shop (Last 7 Days)</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 lg:hidden">Last 7 Days</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sales</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Profit</span>
               </div>
            </div>
          </div>
          
          <div className="h-[200px] lg:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e293b" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94A3B8', fontWeight: 700, fontFamily: 'JetBrains Mono'}} dy={10} />
                <YAxis hide={true} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 800, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#1e293b" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  dot={{ r: 3, fill: '#1e293b', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#F59E0B" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  dot={{ r: 3, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-5 lg:p-8 rounded-[.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 flex flex-col">
          <h3 className="text-base lg:text-xl font-black text-slate-900 mb-4 lg:mb-8 flex items-center justify-between">
             Recent Sales
             <Link to="/dashboard/sales" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors flex items-center gap-1">
               All <ArrowUpRight size={12} />
             </Link>
          </h3>
          <div className="space-y-3 lg:space-y-6 flex-1">
             {recentSales?.length > 0 ? recentSales.map((sale: any, i: number) => (
               <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-[.5rem] transition-all">
                  <div className="flex items-center gap-3">
                     <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-[.5rem] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0D4A3E] group-hover:text-white transition-all flex-shrink-0">
                        <DollarSign size={16} />
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900">{sale.customerName || 'Walk-in'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hl-mono">#{sale.id.slice(-8).toUpperCase()}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-black text-[#0D4A3E] hl-mono">KES {Number(sale.totalAmount).toLocaleString()}</p>
                     <p className="text-[10px] text-slate-400 font-bold hl-mono">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
               </div>
             )) : (
               <p className="text-xs text-slate-400 font-bold text-center py-4">No recent sales</p>
             )}
          </div>
          <Link to="/dashboard/sales" className="hidden lg:block mt-8 w-full py-4 bg-slate-900 text-white rounded-[.5rem] text-center text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
             View Full History
          </Link>
        </div>
      </div>
    </div>
  )
}

function StoreKpi({ title, value, sub, icon: Icon, color, trend }: any) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    red: 'text-red-600 bg-red-50 border-red-100',
    dark: 'text-white bg-slate-900 border-slate-900',
  }

  const isDark = color === 'dark';

  return (
    <div className={`p-4 lg:p-8 rounded-[.5rem] border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden ${
      isDark
        ? 'bg-slate-900 border-slate-900 text-white'
        : 'bg-white border-slate-100 text-slate-900'
    }`}>
      <div className={`h-10 w-10 lg:h-14 lg:w-14 rounded-[.5rem] flex items-center justify-center mb-3 lg:mb-6 transition-transform group-hover:scale-110 ${
        isDark ? 'bg-white/10' : colorMap[color as keyof typeof colorMap]
      }`}>
        <Icon size={22} className={isDark ? 'text-white' : ''} />
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
          isDark ? 'text-slate-400' : 'text-slate-400'
        }`}>{title}</p>
        <div className="flex items-baseline gap-2">
           <h2 className={`text-xl lg:text-3xl font-black hl-mono tracking-tighter ${
             isDark ? 'text-white' : 'text-slate-900'
           }`}>{value}</h2>
           <span className={`text-[10px] font-black hl-mono ${color === 'red' ? 'text-red-500' : isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{trend}</span>
        </div>
        <p className={`text-[10px] font-bold mt-1.5 ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>{sub}</p>
      </div>
    </div>
  )
}
