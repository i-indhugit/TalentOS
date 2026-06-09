import React, { useState, useEffect } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell
} from 'recharts'
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Cpu, 
  GraduationCap, 
  Sparkles,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react'

export default function HiringAnalytics({ token, activeJobId }: { token: string | null, activeJobId: number | null }) {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsightsData = async () => {
      if (!token) return
      try {
        const url = activeJobId ? `/api/v1/analytics/insights?job_id=${activeJobId}` : '/api/v1/analytics/insights'
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setInsights(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchInsightsData()
  }, [token, activeJobId])

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  // Map experience distribution
  const expData = Object.entries(insights?.experience_distribution || {}).map(([key, val]) => ({
    name: key,
    count: val
  }))

  // Map education breakdown
  const eduData = Object.entries(insights?.education_distribution || {}).map(([key, val]) => ({
    name: key,
    count: val
  }))

  // Map skill heatmap
  const skillData = (insights?.skill_heatmap || []).slice(0, 10).map((s: any) => ({
    name: s.skill,
    count: s.count,
    growth: s.demand_growth
  }))

  const colors = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          Hiring Analytics <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20"><BarChart3 className="w-4 h-4" /> Telemetry Dashboard</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Platform-wide statistics on candidate experience brackets, skill clusters, and university hubs.</p>
      </div>

      {/* TOP CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience brackets */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Candidate Experience Distribution</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Evaluation pools segmented by total professional tenure years.</p>
            </div>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          
          <div className="h-64 w-full mt-2">
            {expData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No candidates processed.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    {expData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Education Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">University & Degree Hubs</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Top alma maters represented across parsed applicants.</p>
            </div>
            <GraduationCap className="w-4.5 h-4.5 text-purple-400" />
          </div>
          
          <div className="h-64 w-full mt-2">
            {eduData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No candidates processed.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eduData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} maxBarSize={40}>
                    {eduData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[(index + 2) % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* LOWER CHART ROW: SKILL FREQUENCY HEATMAP */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><Cpu className="w-4 h-4 text-cyan-405" /> Core Technology Popularity & Growth</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Talent density and annual growth indicators for top tech skills in the workspace database.</p>
          </div>
          <span className="text-[10px] text-indigo-400 font-bold px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">Database Heatmap</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Skill list chart */}
          <div className="lg:col-span-2 h-72 w-full">
            {skillData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No skills data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} layout="vertical" margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.2} />
                  <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#06B6D4" radius={[0, 6, 6, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Growth analytics summary */}
          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 no-scrollbar text-xs">
            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block border-b border-slate-850 pb-2">Skill Availability Status</span>
            
            {skillData.slice(0, 5).map((sk: any, idx: number) => (
              <div key={idx} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-205">{sk.name}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold">{sk.count} profiles registered</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-450 font-extrabold text-[10px] flex items-center gap-0.5 justify-end"><TrendingUp className="w-3.5 h-3.5" /> +{sk.growth}%</span>
                  <span className="text-[9px] text-slate-550 font-bold block uppercase tracking-wider">Growth Trend</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
