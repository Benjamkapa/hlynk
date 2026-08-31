import { useEffect, useMemo } from 'react'
import {
  Zap, Users, Package,
  TrendingUp, ArrowUpRight,
  DollarSign, PieChart, Wallet
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { providersApi, salesApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Link, Navigate } from 'react-router-dom'
import { getErrorMessage } from '../../lib/utils/error'
import FeatureGate from '../../components/shared/FeatureGate'
import { useAuth } from '../../lib/auth/AuthContext'
import { ProviderStats, PaginatedResponse } from '../../lib/types/api'

export default function DashboardPage() {
  const { user } = useAuth()

  const userModules = useMemo(() => {
    let mods: string[] = [];
    if (Array.isArray(user?.activeModules)) mods = user.activeModules;
    else if (typeof user?.activeModules === 'string') {
      try { mods = JSON.parse(user.activeModules); } catch (_) {}
    }
    if (!mods.length) mods = ['POS'];
    return mods;
  }, [user]);

  if (userModules.includes('HOSPITALITY') && !userModules.includes('POS')) {
    return <Navigate to="/dashboard/hospitality" replace />;
  }

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<ProviderStats>({
    queryKey: ['provider-stats'],
    queryFn: providersApi.getStats,
    refetchInterval: 15_000
  })

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile,
    staleTime: Infinity
  })

  const threshold = profile?.data?.operationalSettings?.lowStockThreshold || 5;

  const { data: salesResponse, isLoading: salesLoading, error: salesError } = useQuery<PaginatedResponse<any>>({
    queryKey: ['recent-sales'],
    queryFn: () => salesApi.list({ limit: 5 }),
    refetchInterval: 15_000
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
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D4A3E] border-t-transparent" />
    </div>
  )

  const net = stats?.mtdNetProfit ?? 0;
  const netIsPositive = net >= 0;

  return (
    <div className="space-y-8 pt-4">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Business pulse</h1>
        <p className="text-gray-400 text-sm mt-0.5">Store performance overview</p>
      </div>

      {/* KPI overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
        <SummaryCell
          icon={Zap}
          label="Daily sales"
          value={`KES ${stats?.dailySales?.toLocaleString() || '0'}`}
          sub={`Profit: KES ${stats?.profit?.toLocaleString() || '0'}`}
        />
        <SummaryCell
          icon={Users}
          label="New customers"
          value={String(stats?.newCustomers || '0')}
          sub="Total registered"
        />
        <FeatureGate feature="low_stock_alerts" variant="tease">
          <SummaryCell
            icon={Package}
            label="Out of stock"
            value={String(stats?.outOfStockCount || '0')}
            sub={`Items below ${threshold} qty`}
            tone="warn"
          />
        </FeatureGate>
        <SummaryCell
          icon={TrendingUp}
          label="MTD gross profit"
          value={`KES ${stats?.mtdProfit?.toLocaleString() || '0'}`}
          sub="This month (cost margin)"
        />
        <SummaryCell
          icon={Wallet}
          label="Net profit (MTD)"
          value={`${netIsPositive ? '' : '−'}KES ${Math.abs(net).toLocaleString()}`}
          sub={`After KES ${(stats?.mtdExpenses || 0).toLocaleString()} expenses`}
          tone={netIsPositive ? 'good' : 'warn'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-[.5rem] border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Revenue trajectory</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-900" />
                <span className="text-xs text-gray-400">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#0D4A3E]" />
                <span className="text-xs text-gray-400">Profit</span>
              </div>
            </div>
          </div>

          <div className="h-[220px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.06}/>
                    <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D4A3E" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#0D4A3E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F9FAFB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                <YAxis hide={true} />
                <Tooltip
                  cursor={{ stroke: '#F3F4F6', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '.5rem', border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', padding: '10px 14px', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#111827"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#111827', strokeWidth: 2, stroke: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#0D4A3E"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#0D4A3E', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent sales */}
        <div className="bg-white rounded-[.5rem] border border-gray-100 p-6 flex flex-col">
          <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center justify-between">
            Recent sales
            <Link to="/dashboard/sales" className="text-xs text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1">
              All <ArrowUpRight size={12} />
            </Link>
          </h3>
          <div className="divide-y divide-gray-50 flex-1">
            {recentSales?.length > 0 ? recentSales.map((sale: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-3 hover:bg-gray-50/60 transition-colors -mx-2 px-2 rounded-[.5rem]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-[.5rem] bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <DollarSign size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sale.customerName || 'Walk-in'}</p>
                    <p className="text-xs text-gray-400 hl-mono">#{sale.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 hl-mono">KES {Number(sale.totalAmount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 hl-mono">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-10">No recent sales</p>
            )}
          </div>
          <Link to="/dashboard/sales" className="mt-4 w-full py-3 bg-[#0D4A3E] text-white rounded-[.5rem] text-center text-sm font-medium hover:bg-[#0A3D33] transition-colors">
            View full history
          </Link>
        </div>
      </div>

      {/* Sales channels */}
      {stats?.profitBySource && stats.profitBySource.length > 0 && (
        <div className="bg-white rounded-[.5rem] border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <PieChart size={15} className="text-gray-400" />
                Sales channels
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Filter by channel — click to drill in</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
            {stats.profitBySource.map((source: any, i: number) => {
              const margin = source.sales > 0 ? Math.round((source.profit / source.sales) * 100) : 0;
              return (
                <Link
                  to={`/dashboard/sales?source=${encodeURIComponent(source.name)}`}
                  key={i}
                  className="bg-white p-5 hover:bg-gray-50/60 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400">{source.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${margin > 20 ? 'bg-emerald-50 text-[#0D4A3E]' : 'bg-gray-50 text-gray-500'}`}>
                      {margin}%
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-1">Gross revenue</p>
                  <p className="text-xl font-semibold text-gray-900 hl-mono tracking-tight">KES {Number(source.sales || 0).toLocaleString()}</p>

                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Profit</p>
                      <p className="text-sm font-medium text-[#0D4A3E] hl-mono">KES {Number(source.profit || 0).toLocaleString()}</p>
                    </div>
                    <ArrowUpRight size={14} className="text-gray-300 group-hover:text-[#0D4A3E] transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Overview cell ──────────────────────────────────────────────────────────

function SummaryCell({ icon: Icon, label, value, sub, tone = 'default' }: {
  icon: any
  label: string
  value: string
  sub: string
  tone?: 'default' | 'good' | 'warn'
}) {
  const toneColor = tone === 'warn' ? 'text-red-600' : tone === 'good' ? 'text-[#0D4A3E]' : 'text-gray-900'

  return (
    <div className="bg-white p-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-gray-300" />
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <p className={`text-2xl font-semibold hl-mono tracking-tight ${toneColor}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}