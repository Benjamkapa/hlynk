import { useState } from 'react'
import { 
  Zap, ShoppingCart, Users, Package, 
  TrendingUp, ArrowUpRight, ArrowDownRight, 
  Clock, DollarSign, Receipt, Star
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

  const { data: salesResponse, isLoading: salesLoading, error: salesError } = useQuery<PaginatedResponse<any>>({
    queryKey: ['recent-sales'],
    queryFn: () => salesApi.list({ limit: 5 })
  })

  const recentSales = salesResponse?.items || []

  useEffect(() => {
    if (statsError) toast.error(getErrorMessage(statsError))
    if (salesError) toast.error(getErrorMessage(salesError))
  }, [statsError, salesError])

  const salesData = stats?.salesChart || []

  if (statsLoading || salesLoading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </div>
  )

  return (
    <div className=" mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Business Pulse</h1>
          <p className="text-slate-500 font-medium text-xl">Overview of your store performance today</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
           <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center">
              <Star size={20} className="fill-emerald-600" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Store Rating</p>
              <StarRating 
                rating={Number(stats?.rating || 0)} 
                count={stats?.reviewCount || 0} 
                showText 
                size={14} 
              />
           </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StoreKpi title="Daily Sales" value={`KES ${stats?.dailySales?.toLocaleString() || '0'}`} sub={`${stats?.dailyTransactions || 0} transactions`} icon={Zap} color="emerald" trend="" />
        <StoreKpi title="New Customers" value={stats?.newCustomers || '0'} sub="Total registered" icon={Users} color="blue" trend="" />
        <FeatureGate feature="low_stock_alerts" variant="inline">
          <StoreKpi title="Out of Stock" value={stats?.outOfStockCount || '0'} sub="Items below 5 qty" icon={Package} color="red" trend="" />
        </FeatureGate>
        <StoreKpi title="Daily Profit" value={`KES ${stats?.profit?.toLocaleString() || '0'}`} sub="Sales minus expenses" icon={TrendingUp} color="purple" trend="" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-white p-10 rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/5">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Revenue Trajectory</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Daily transaction volume (Last 7 Days)</p>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={salesData}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 700, fontFamily: 'JetBrains Mono'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 700, fontFamily: 'JetBrains Mono'}} tickFormatter={(v) => `KES ${v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }}
                  itemStyle={{ fontWeight: 800, fontFamily: 'JetBrains Mono' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10B981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3B82F6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/5 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center justify-between">
             Recent Sales
             <Receipt size={20} className="text-slate-300" />
          </h3>
          <div className="space-y-6 flex-1">
             {recentSales?.length > 0 ? recentSales.map((sale: any, i: number) => (
               <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0D4A3E] group-hover:text-white transition-all">
                        <DollarSign size={18} />
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
          <Link to="/dashboard/sales" className="mt-8 w-full py-4 bg-slate-900 text-white rounded-xl text-center text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
             View Full History
          </Link>
        </div>
      </div>
    </div>
  )
}

function StoreKpi({ title, value, sub, icon: Icon, color, trend }: any) {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    red: 'text-red-600 bg-red-50 border-red-100',
  }

  return (
    <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden">
      <div className={`h-14 w-14 rounded-md flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colorMap[color as keyof typeof colorMap]}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
        <div className="flex items-baseline gap-3">
           <h2 className="text-3xl font-black text-slate-900 hl-mono tracking-tighter">{value}</h2>
           <span className={`text-[10px] font-black hl-mono ${color === 'red' ? 'text-red-500' : 'text-emerald-600'}`}>{trend}</span>
        </div>
        <p className="text-xs text-slate-400 font-bold mt-2">{sub}</p>
      </div>
    </div>
  )
}
