import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Users, 
  Briefcase, 
  Percent, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  UserCheck, 
  Activity, 
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Dashboard({ 
  token, 
  activeJobId,
  user
}: { 
  token: string | null, 
  activeJobId: number | null,
  user: any
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (location.state?.justLoggedIn && user?.full_name) {
      setShowToast(true)
      const timer = setTimeout(() => {
        setShowToast(false)
        navigate(location.pathname, { replace: true, state: {} })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [location.state, user])

  const fetchDashboardData = async () => {
    if (!token) return
    try {
      const q = activeJobId ? `?job_id=${activeJobId}` : ''
      const dashboardRes = await fetch(`/api/v1/analytics/dashboard${q}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const insightsRes = await fetch(`/api/v1/analytics/insights${q}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (dashboardRes.ok && insightsRes.ok) {
        const dData = await dashboardRes.json()
        const iData = await insightsRes.json()
        setData(dData)
        setInsights(iData)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [token, activeJobId])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  // Fallback structures if db empty
  const totalCandidates = data?.total_candidates ?? 0
  const activeJobs = data?.active_jobs ?? 0
  const avgMatchScore = data?.average_match_score ?? 75.0
  const topCandidate = data?.top_candidate ?? "None"
  const funnel = data?.funnel ?? { Applied: 0, Shortlisted: 0, Interviewing: 0, Offered: 0, Rejected: 0 }
  const topTalentAlerts = data?.top_talent_alerts ?? []
  const velocity = data?.velocity ?? { avg_days_to_screen: 3, avg_days_to_interview: 8, avg_days_to_hire: 14 }
  const recentUploads = data?.recent_uploads ?? []
  
  const funnelTotal = Object.values(funnel).reduce((a: any, b: any) => a + b, 0) as number

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Command Center <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">Active Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time candidate pipelines, match distribution metrics, and AI recommendations.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="self-start px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 radial-glow-primary pointer-events-none opacity-30 rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Candidates</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalCandidates}</span>
            <span className="text-[10px] text-emerald-450 font-bold flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +12%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Evaluated profile records</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 radial-glow-secondary pointer-events-none opacity-30 rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Open Positions</span>
            <Briefcase className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{activeJobs}</span>
            <span className="text-slate-500 text-xs font-semibold">Active roles</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Active pipeline configurations</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 radial-glow-accent pointer-events-none opacity-30 rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Average Match Alignment</span>
            <Percent className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{avgMatchScore}%</span>
            </div>
            <div className="w-full bg-slate-950/60 h-1 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full" style={{ width: `${avgMatchScore}%` }} />
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 radial-glow-primary opacity-20 pointer-events-none rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Top Aligned Talent</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-sm font-extrabold text-white block truncate">{topCandidate}</span>
            <span className="text-[9px] text-slate-550 block truncate uppercase tracking-widest font-bold mt-1">High-match priority</span>
          </div>
          <Link to="/rankings" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 mt-2">
            Inspect matching engine <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* CORE TELEMETRY CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match score trends */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pipeline Growth & Hiring Trends</h3>
              <p className="text-[10px] text-slate-500">Evaluated candidates vs hired trends by month.</p>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-900 border border-slate-850 rounded-lg">Historical Metrics</span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={insights?.hiring_trends || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInterviewed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                  labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="interviewed" name="Screened" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorInterviewed)" />
                <Area type="monotone" dataKey="hired" name="Shortlisted" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorHired)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel progress */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hiring Pipeline Funnel</h3>
            <p className="text-[10px] text-slate-500 mb-5">Workflow status distribution of all evaluated records.</p>
          </div>
          
          <div className="space-y-3">
            {[
              { status: "Applied", color: "bg-indigo-500", rawColor: "#6366F1", count: funnel.Applied },
              { status: "Shortlisted", color: "bg-purple-500", rawColor: "#8B5CF6", count: funnel.Shortlisted },
              { status: "Interviewing", color: "bg-cyan-500", rawColor: "#06B6D4", count: funnel.Interviewing },
              { status: "Offered", color: "bg-emerald-500", rawColor: "#10B981", count: funnel.Offered },
              { status: "Rejected", color: "bg-rose-500", rawColor: "#EF4444", count: funnel.Rejected }
            ].map((item, idx) => {
              const percent = funnelTotal > 0 ? (item.count / funnelTotal) * 100 : 0
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-350">
                    <span className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${item.color}`} /> {item.status}</span>
                    <span>{item.count} <span className="text-[10px] text-slate-500 font-medium">({Math.round(percent)}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-950/60 h-1.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 border-t border-slate-850 pt-4 flex justify-between text-[10px] text-slate-500">
            <span>Overall Pool: <b>{funnelTotal}</b> candidates</span>
            <span>Hiring Health: <b className="text-indigo-400">{data?.hiring_health_score ?? 80}%</b></span>
          </div>
        </div>
      </div>

      {/* LOWER GRID: ALERTS & RECENT UPLOADS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Talent Alerts */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 text-left">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-400" /> AI Insights & Match Alerts</h3>
          <p className="text-[10px] text-slate-550 mb-4">Urgent high-alignment profiles with computed risk scores.</p>
          
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
            {topTalentAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No high-match priority candidates detected. Try uploading resumes in Intake.</div>
            ) : (
              topTalentAlerts.map((alert: any, idx: number) => (
                <div key={idx} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-bold shrink-0">
                      {alert.candidate_name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{alert.candidate_name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{alert.title} • matching position <b>{alert.job_title}</b></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold block">RISK TELEMETRY</span>
                      <span className={`text-[10px] font-extrabold uppercase mt-0.5 flex items-center gap-0.5 justify-end ${alert.risk === 'High' ? 'text-rose-400' : alert.risk === 'Medium' ? 'text-amber-405' : 'text-emerald-400'}`}>
                        {alert.risk === 'High' ? <AlertTriangle className="w-3 h-3" /> : alert.risk === 'Medium' ? <Clock className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        {alert.risk} Risk
                      </span>
                    </div>
                    <div className="text-right shrink-0 border-l border-slate-850 pl-4.5">
                      <span className="text-[13px] font-black text-indigo-400">{alert.score}%</span>
                      <span className="text-[9px] text-slate-550 block font-bold uppercase tracking-wider">Alignment</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Uploads Feed */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Recent Resume Uploads</h3>
          <p className="text-[10px] text-slate-500 mb-4">Latest profiles parsed into workspace telemetry.</p>
          
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
            {recentUploads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No resumes processed. Go to Talent Intake to upload files.</div>
            ) : (
              recentUploads.map((rec: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-full bg-slate-850 flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">{rec.name[0]}</div>
                    <div className="truncate">
                      <h4 className="font-semibold text-slate-200 truncate leading-tight">{rec.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{rec.title} • {rec.date}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-cyan-400">{rec.score} XP</span>
                    <span className="text-[9px] text-slate-550 font-bold block uppercase tracking-wider">{rec.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Welcome Toast Notification */}
      {showToast && user && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 animate-fade-in max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Welcome back, {user.full_name}!</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">You have successfully signed in to TalentOS.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setShowToast(false)
              navigate(location.pathname, { replace: true, state: {} })
            }}
            className="text-slate-500 hover:text-slate-350 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
