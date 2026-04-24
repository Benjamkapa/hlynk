import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import {
  Users, Activity, AlertCircle, ShieldCheck, Zap, Database,
  PlusCircle, DollarSign, Megaphone, BarChart3, ExternalLink,
  ChevronRight, Ban, RefreshCw, ArrowUpRight, ArrowDownRight,
  TrendingUp, Signal, Clock
} from 'lucide-react'
import { adminApi } from '../../lib/api/providers'
import {
  ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import { ADMIN_CSS } from './hl-design-system'


/* ─── HELPERS ─── */
const fmt = (v: number) =>
  new Intl.NumberFormat('en-KE', { style:'currency', currency:'KES', maximumFractionDigits:0 }).format(v)

/* ─── ANIMATED COUNTER ─── */
function Counter({ target, prefix='', suffix='' }: { target:number; prefix?:string; suffix?:string }) {
  const [v, setV] = useState(0)
  const did = useRef(false)
  useEffect(() => {
    if (did.current) return; did.current = true
    let t0:number|null=null; const dur=1200
    const run=(ts:number)=>{ if(!t0)t0=ts; const p=Math.min((ts-t0)/dur,1); setV(Math.floor((1-Math.pow(1-p,3))*target)); if(p<1)requestAnimationFrame(run) }
    requestAnimationFrame(run)
  },[target])
  return <>{prefix}{v.toLocaleString()}{suffix}</>
}

/* ─── CHART TOOLTIP ─── */
function ChartTip({ active, payload, label }:any) {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid rgba(13,36,25,.1)', borderRadius:6, padding:'10px 14px', boxShadow:'0 8px 24px rgba(13,36,25,.1)', fontFamily:"'Figtree',sans-serif" }}>
      <p style={{ fontSize:'.72rem', color:'#8FA398', marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:'.92rem', fontWeight:800, color:'#0D1B12' }}>{payload[0].value}</p>
    </div>
  )
}

/* ─── HERO KPI CARD (dark forest) ─── */
function HeroKpi({ label, value, sub, icon:Icon }:any) {
  return (
    <div className="hl-card-dark hl-kpi" style={{ padding:'28px 24px' }}>
      <div style={{ position:'absolute', top:'-20%', right:'-5%', width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle, rgba(29,186,135,.2) 0%, transparent 65%)', pointerEvents:'none' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(29,186,135,.18)', border:'1px solid rgba(29,186,135,.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#1DBA87' }}>
          <Icon size={16} />
        </div>
        <button className="hl-arrow-btn" style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.5)' }}
          onMouseEnter={e=>{ (e.currentTarget as any).style.background='rgba(255,255,255,.18)'; (e.currentTarget as any).style.color='#fff'; }}
          onMouseLeave={e=>{ (e.currentTarget as any).style.background='rgba(255,255,255,.08)'; (e.currentTarget as any).style.color='rgba(255,255,255,.5)'; }}>
          <ArrowUpRight size={15} />
        </button>
      </div>
      <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.62rem', letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.4)', marginBottom:8 }}>{label}</p>
      <p style={{ fontFamily:"'Saira',sans-serif", fontWeight:800, fontSize:'2.6rem', color:'#fff', lineHeight:1, letterSpacing:'-.03em', animation:'hl-count .5s ease both' }}>{value}</p>
      {sub && (
        <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:7 }}>
          <span className="hl-live" />
          <span style={{ fontFamily:"'Figtree',sans-serif", fontSize:'.74rem', color:'rgba(255,255,255,.4)' }}>{sub}</span>
        </div>
      )}
    </div>
  )
}

/* ─── LIGHT KPI CARD ─── */
function LightKpi({ label, value, icon:Icon, trend, accent='#1DBA87', delay=0 }:any) {
  const up = trend >= 0
  return (
    <div className="hl-card hl-kpi" style={{ padding:'22px', animation:`hl-up .5s ease ${delay}s both` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:`${accent}14`, border:`1px solid ${accent}28`, display:'flex', alignItems:'center', justifyContent:'center', color:accent }}>
          <Icon size={15} />
        </div>
        <button className="hl-arrow-btn"><ArrowUpRight size={14} /></button>
      </div>
      <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.6rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--ink3)', marginBottom:6 }}>{label}</p>
      <p style={{ fontFamily:"'Saira',sans-serif", fontWeight:800, fontSize:'1.85rem', color:'var(--ink)', lineHeight:1, letterSpacing:'-.02em' }}>{value}</p>
      {trend !== undefined && (
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:3, padding:'3px 8px', borderRadius:100, background: up ? 'rgba(29,186,135,.1)' : 'rgba(239,68,68,.08)' }}>
            {up ? <ArrowUpRight size={10} color="#1DBA87"/> : <ArrowDownRight size={10} color="#EF4444"/>}
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.56rem', color: up ? '#1DBA87' : '#EF4444', fontWeight:700 }}>{Math.abs(trend)}%</span>
          </div>
          <span style={{ fontSize:'.72rem', color:'var(--ink3)' }}>vs last month</span>
        </div>
      )}
    </div>
  )
}

/* ─── MAIN COMPONENT ─── */
export default function AdminDashboardPage() {
  const { data: statsData, refetch } = useQuery({ queryKey:['admin-stats'], queryFn: adminApi.getStats })
  const [spinning, setSpinning] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => { const id=setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(id) }, [])

  const doRefresh = async () => { setSpinning(true); await refetch(); setTimeout(()=>setSpinning(false),700) }

  const stats = statsData?.data || {
    overview: { totalProviders:0, activeToday:0, trialsRunning:0, expiredTrials:0, payingProviders:0, revenueThisMonth:0 },
    trials:   { newToday:0, expiringSoon:0, conversions:0, conversionRate:0 },
    atRisk:[], recentRegistrations:[],
    trends:   { weeklyGrowth:[], monthlyRevenue:[] }
  }

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding:'28px 28px 60px' }}>

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="hl-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:32, animation:'hl-up .4s ease both' }}>
          <div>
            <h1 style={{ fontFamily:"'Saira',sans-serif", fontWeight:800, fontSize:'clamp(1.5rem,2.5vw,2rem)', color:'var(--ink)', letterSpacing:'-.025em', lineHeight:1, marginBottom:6 }}>
              Platform Operations
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <span className="hl-live" />
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.63rem', color:'var(--ink3)', letterSpacing:'.06em' }}>
                LIVE · {time.toLocaleDateString('en-KE',{weekday:'short',day:'2-digit',month:'short'})} · {time.toLocaleTimeString('en-KE',{hour12:false})}
              </span>
            </div>
          </div>
          <div className="hl-hbtns" style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className="hl-btn-outline" onClick={doRefresh}>
              <RefreshCw size={13} style={{ animation: spinning ? 'hl-spin .7s linear infinite' : 'none' }} /> Refresh
            </button>
            <button className="hl-btn-outline"><Megaphone size={13}/> Broadcast</button>
            <button className="hl-btn-outline"><BarChart3 size={13}/> Export</button>
            <button className="hl-btn-primary"><PlusCircle size={15}/> Add Provider</button>
          </div>
        </div>

        {/* ── KPI ROW 1 — mirrors Donezo's top 4-card strip ─── */}
        <div className="hl-kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:16 }}>
          <div style={{ animation:'hl-up .45s ease .04s both' }}>
            <HeroKpi label="Total Providers" value={<Counter target={stats.overview.totalProviders}/>} sub="Increased from last month" icon={Users}/>
          </div>
          <LightKpi label="Active Today"   value={<Counter target={stats.overview.activeToday}/>}   icon={Activity}   trend={8}  accent="#1DBA87" delay={.09}/>
          <LightKpi label="Trials Running" value={<Counter target={stats.overview.trialsRunning}/>}  icon={Zap}        trend={-3} accent="#F5A623" delay={.13}/>
          <LightKpi label="Paying Clients" value={<Counter target={stats.overview.payingProviders}/>} icon={ShieldCheck} trend={18} accent="#1DBA87" delay={.17}/>
        </div>

        {/* ── KPI ROW 2 ────────────────────────────────────── */}
        <div className="hl-kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          <LightKpi label="Expired Trials"   value={<Counter target={stats.overview.expiredTrials}/>}  icon={AlertCircle} trend={-5} accent="#EF4444" delay={.21}/>
          <LightKpi label="Revenue / Month"  value={fmt(stats.overview.revenueThisMonth)}              icon={DollarSign}  trend={22}  accent="#1DBA87" delay={.25}/>
          <LightKpi label="New Trials Today" value={<Counter target={stats.trials.newToday}/>}         icon={TrendingUp}  trend={6}   accent="#1DBA87" delay={.29}/>
          <LightKpi label="Expiring Soon"    value={<Counter target={stats.trials.expiringSoon}/>}     icon={Clock}       trend={-2}  accent="#F5A623" delay={.33}/>
        </div>

        {/* ── MAIN CONTENT GRID ────────────────────────────── */}
        <div className="hl-main-grid" style={{ display:'grid', gridTemplateColumns:'1fr 336px', gap:20 }}>

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* CHARTS */}
            <div className="hl-chart-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

              {/* Bar — New Providers */}
              <div className="hl-card" style={{ padding:'24px', animation:'hl-up .5s ease .3s both' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
                  <div>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.6rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--ink3)', marginBottom:4 }}>Weekly</p>
                    <h3 style={{ fontFamily:"'Saira',sans-serif", fontWeight:800, fontSize:'1.05rem', color:'var(--ink)' }}>New Providers</h3>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:100, background:'rgba(29,186,135,.1)' }}>
                    <ArrowUpRight size={10} color="#1DBA87"/>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.58rem', color:'#1DBA87', fontWeight:700 }}>12%</span>
                  </div>
                </div>
                <div style={{ height:200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.trends.weeklyGrowth} barCategoryGap="38%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(13,36,25,.06)"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:9, fill:'#8FA398', fontFamily:"'JetBrains Mono',monospace" }} dy={8}/>
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize:9, fill:'#8FA398', fontFamily:"'JetBrains Mono',monospace" }}/>
                      <Tooltip content={<ChartTip/>} cursor={{ fill:'rgba(13,36,25,.03)', radius:8 }}/>
                      <Bar dataKey="value" fill="#0D2419" radius={[8,8,4,4]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Area — Revenue */}
              <div className="hl-card" style={{ padding:'24px', animation:'hl-up .5s ease .36s both' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
                  <div>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.6rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--ink3)', marginBottom:4 }}>Monthly</p>
                    <h3 style={{ fontFamily:"'Saira',sans-serif", fontWeight:800, fontSize:'1.05rem', color:'var(--ink)' }}>Revenue Trend</h3>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:100, background:'rgba(29,186,135,.1)' }}>
                    <ArrowUpRight size={10} color="#1DBA87"/>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.58rem', color:'#1DBA87', fontWeight:700 }}>22%</span>
                  </div>
                </div>
                <div style={{ height:200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trends.monthlyRevenue}>
                      <defs>
                        <linearGradient id="hl-rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#1DBA87" stopOpacity={0.18}/>
                          <stop offset="100%" stopColor="#1DBA87" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(13,36,25,.06)"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:9, fill:'#8FA398', fontFamily:"'JetBrains Mono',monospace" }} dy={8}/>
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize:9, fill:'#8FA398', fontFamily:"'JetBrains Mono',monospace" }}/>
                      <Tooltip content={<ChartTip/>}/>
                      <Area type="monotone" dataKey="value" stroke="#1DBA87" strokeWidth={2.5} fill="url(#hl-rev)" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* REGISTRATIONS TABLE */}
            <div className="hl-card" style={{ overflow:'hidden', animation:'hl-up .5s ease .42s both' }}>
              <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <h3 style={{ fontFamily:"'Saira',sans-serif", fontWeight:800, fontSize:'1.05rem', color:'var(--ink)' }}>Recent Registrations</h3>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.58rem', color:'var(--ink3)', letterSpacing:'.06em', marginTop:3 }}>LATEST ONBOARDED BUSINESSES</p>
                </div>
                <button style={{ display:'flex', alignItems:'center', gap:6, fontFamily:"'Figtree',sans-serif", fontWeight:700, fontSize:'.78rem', color:'var(--forest)', background:'none', border:'none', cursor:'pointer' }}
                  onMouseEnter={e=>(e.currentTarget.style.opacity='.6')}
                  onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
                  View All <ChevronRight size={14}/>
                </button>
              </div>

              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'var(--surface2)' }}>
                      {['Business','Owner / Location','Plan','Joined',''].map((h,i)=>(
                        <th key={i} style={{ padding:'12px 20px', textAlign: i===4 ? 'right' : 'left', fontFamily:"'JetBrains Mono',monospace", fontSize:'.56rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--ink3)', fontWeight:500, borderBottom:'1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentRegistrations.map((biz:any,i:number)=>(
                      <tr key={i} className="hl-tr" style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:6, flexShrink:0, background:`hsl(${(i*67+140)%360},38%,88%)`, border:`1px solid hsl(${(i*67+140)%360},38%,78%)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Saira',sans-serif", fontWeight:800, fontSize:'.72rem', color:`hsl(${(i*67+140)%360},55%,32%)` }}>
                              {(biz.name||'B')[0]}
                            </div>
                            <span style={{ fontFamily:"'Figtree',sans-serif", fontWeight:700, fontSize:'.88rem', color:'var(--ink)' }}>{biz.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          <p style={{ fontFamily:"'Figtree',sans-serif", fontWeight:600, fontSize:'.82rem', color:'var(--ink)' }}>{biz.owner}</p>
                          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.57rem', color:'var(--ink3)', marginTop:2 }}>{biz.location}</p>
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          <span style={{ padding:'4px 12px', borderRadius:100, fontFamily:"'JetBrains Mono',monospace", fontSize:'.56rem', fontWeight:700, letterSpacing:'.06em', background: biz.plan==='TRIAL' ? 'rgba(245,166,35,.12)' : 'rgba(29,186,135,.12)', color: biz.plan==='TRIAL' ? '#D97706' : '#0d8a62', border:`1px solid ${biz.plan==='TRIAL' ? 'rgba(245,166,35,.25)' : 'rgba(29,186,135,.25)'}` }}>
                            {biz.plan}
                          </span>
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.6rem', color:'var(--ink3)' }}>
                            {new Date(biz.date).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'2-digit'})}
                          </span>
                        </td>
                        <td style={{ padding:'14px 20px', textAlign:'right' }}>
                          <button className="hl-arrow-btn" style={{ width:32, height:32 }}><ExternalLink size={13}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* CONVERSIONS */}
            <div className="hl-card" style={{ padding:'24px', animation:'hl-up .5s ease .34s both' }}>
              <div style={{ marginBottom:18 }}>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.6rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--ink3)', marginBottom:4 }}>Monitor</p>
                <h3 style={{ fontFamily:"'Saira',sans-serif", fontWeight:800, fontSize:'1.05rem', color:'var(--ink)' }}>Trial Conversions</h3>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
                {[
                  { lbl:'New Trials', val:stats.trials.newToday,     c:'#1DBA87', bg:'rgba(29,186,135,.08)',  bd:'rgba(29,186,135,.2)' },
                  { lbl:'Expiring',   val:stats.trials.expiringSoon, c:'#D97706', bg:'rgba(245,166,35,.08)', bd:'rgba(245,166,35,.2)' },
                ].map(b=>(
                  <div key={b.lbl} style={{ background:b.bg, border:`1px solid ${b.bd}`, borderRadius:8, padding:'14px' }}>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.56rem', letterSpacing:'.08em', textTransform:'uppercase', color:b.c, marginBottom:8 }}>{b.lbl}</p>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.7rem', color:'var(--ink)', lineHeight:1, letterSpacing:'-.02em' }}>{b.val}</p>
                  </div>
                ))}
              </div>

              {/* Donut */}
              <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px', background:'var(--surface2)', borderRadius:14 }}>
                <div style={{ position:'relative', width:56, height:56, flexShrink:0 }}>
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(13,36,25,.08)" strokeWidth="5.5"/>
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#1DBA87" strokeWidth="5.5"
                      strokeDasharray={`${2*Math.PI*22*Math.min(stats.trials.conversionRate,100)/100} 999`}
                      strokeLinecap="round" transform="rotate(-90 28 28)"/>
                  </svg>
                  <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'.66rem', color:'var(--ink)' }}>
                    {stats.trials.conversionRate.toFixed(0)}%
                  </span>
                </div>
                <div>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.56rem', color:'var(--ink3)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5 }}>Conversion Rate</p>
                  <p style={{ fontFamily:"'Figtree',sans-serif", fontWeight:700, fontSize:'.82rem', color:'var(--ink)' }}>{stats.trials.conversions} converted this month</p>
                </div>
              </div>
            </div>

            {/* AT-RISK */}
            <div className="hl-card" style={{ padding:'24px', animation:'hl-up .5s ease .4s both', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.6rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--ink3)', marginBottom:4 }}>Attention</p>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.05rem', color:'var(--ink)' }}>At-Risk Accounts</h3>
                </div>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <AlertCircle size={13} color="#EF4444"/>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {stats.atRisk.map((biz:any,i:number)=>(
                  <div key={i} className="hl-risk" style={{ padding:'12px 14px', borderRadius:6, border:'1px solid rgba(239,68,68,.12)', background:'rgba(239,68,68,.02)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:5 }}>
                      <p style={{ fontFamily:"'Figtree',sans-serif", fontWeight:700, fontSize:'.85rem', color:'var(--ink)' }}>{biz.name}</p>
                      <span style={{ padding:'2px 8px', borderRadius:100, background:'rgba(239,68,68,.1)', fontFamily:"'JetBrains Mono',monospace", fontSize:'.5rem', color:'#EF4444', letterSpacing:'.06em', fontWeight:700 }}>AT RISK</span>
                    </div>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.56rem', color:'var(--ink3)', marginBottom:10 }}>
                      Last seen: {new Date(biz.lastLogin).toLocaleDateString('en-KE',{day:'2-digit',month:'short'})}
                    </p>
                    <div style={{ display:'flex', gap:7 }}>
                      <button style={{ flex:1, padding:'7px 0', borderRadius:100, background:'var(--forest)', color:'#fff', fontFamily:"'Figtree',sans-serif", fontSize:'.72rem', fontWeight:700, border:'none', cursor:'pointer', transition:'all .2s' }}
                        onMouseEnter={e=>(e.currentTarget.style.background='var(--forest2)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='var(--forest)')}>
                        Send Reminder
                      </button>
                      <button style={{ padding:'7px 10px', borderRadius:100, background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.18)', color:'#EF4444', cursor:'pointer', display:'flex', alignItems:'center', transition:'all .2s' }}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,.12)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='rgba(239,68,68,.06)')}>
                        <Ban size={13}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SYSTEM HEALTH — dark card like Donezo's Time Tracker */}
            <div className="hl-card-dark" style={{ padding:'22px', animation:'hl-up .5s ease .46s both' }}>
              <div style={{ position:'absolute', top:0, right:0, width:90, height:90, background:'radial-gradient(circle, rgba(29,186,135,.18) 0%, transparent 70%)', pointerEvents:'none' }}/>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                <Signal size={13} color="#1DBA87"/>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.6rem', letterSpacing:'.12em', color:'rgba(255,255,255,.35)', textTransform:'uppercase' }}>System Health</p>
              </div>
              {[
                { lbl:'API Gateway', status:'HEALTHY', icon:Zap },
                { lbl:'Database',    status:'STEADY',  icon:Database },
                { lbl:'SMS Gateway', status:'ACTIVE',  icon:Megaphone },
              ].map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom: i<2 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <s.icon size={12} color="rgba(255,255,255,.4)"/>
                    </div>
                    <span style={{ fontFamily:"'Figtree',sans-serif", fontSize:'.8rem', fontWeight:600, color:'rgba(255,255,255,.7)' }}>{s.lbl}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#1DBA87', boxShadow:'0 0 6px rgba(29,186,135,.7)', animation:'hl-blink 2s ease-in-out infinite', display:'inline-block' }}/>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.58rem', color:'#1DBA87', letterSpacing:'.06em' }}>{s.status}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:16, padding:'12px', background:'rgba(29,186,135,.07)', borderRadius:12, border:'1px solid rgba(29,186,135,.14)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.56rem', color:'rgba(255,255,255,.28)', letterSpacing:'.08em' }}>PLATFORM UPTIME</span>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.88rem', fontWeight:800, color:'#1DBA87' }}>99.98%</span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,.07)', borderRadius:100, overflow:'hidden' }}>
                  <div style={{ width:'99.98%', height:'100%', background:'linear-gradient(90deg,#1DBA87,#0d8a62)', borderRadius:100 }}/>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}