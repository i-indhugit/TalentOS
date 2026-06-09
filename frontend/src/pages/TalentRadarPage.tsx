import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { 
  Sparkles, 
  Compass, 
  ShieldAlert, 
  Cpu, 
  Lightbulb, 
  GraduationCap, 
  Speech, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react'

export default function TalentRadarPage({ 
  token, 
  activeJobId 
}: { 
  token: string | null, 
  activeJobId: number | null 
}) {
  const [dna, setDna] = useState<any>(null)
  const [rankings, setRankings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dna' | 'matrix'>('dna')

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      setLoading(true)
      try {
        // Fetch DNA Average
        const insightsUrl = activeJobId ? `/api/v1/analytics/insights?job_id=${activeJobId}` : '/api/v1/analytics/insights'
        const insightsRes = await fetch(insightsUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json()
          setDna(insightsData.average_candidate_dna)
        }

        // Fetch Rankings
        const rankingsUrl = activeJobId ? `/api/v1/rankings?job_id=${activeJobId}` : '/api/v1/rankings'
        const rankingsRes = await fetch(rankingsUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (rankingsRes.ok) {
          const rankingsData = await rankingsRes.json()
          setRankings(rankingsData)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token, activeJobId])

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4" />
        <div className="h-96 bg-slate-800 rounded-2xl" />
      </div>
    )
  }

  // Map data to Recharts format
  const chartData = [
    { subject: 'Technical', A: dna?.Technical ?? 75, fullMark: 100 },
    { subject: 'Leadership', A: dna?.Leadership ?? 70, fullMark: 100 },
    { subject: 'Learning', A: dna?.Learning ?? 85, fullMark: 100 },
    { subject: 'Communication', A: dna?.Communication ?? 80, fullMark: 100 },
    { subject: 'Innovation', A: dna?.Innovation ?? 78, fullMark: 100 }
  ]

  const metricsInfo = [
    { name: "Technical Proficiency", value: `${dna?.Technical ?? 75}%`, desc: "Algorithmic thinking, design patterns, coding execution, and technical architecture familiarity.", icon: <Cpu className="w-5 h-5 text-indigo-400" /> },
    { name: "Leadership Dynamics", value: `${dna?.Leadership ?? 70}%`, desc: "Mentorship capabilities, project leading, ownership, and structural organization direction.", icon: <ShieldAlert className="w-5 h-5 text-purple-400" /> },
    { name: "Continuous Learning", value: `${dna?.Learning ?? 85}%`, desc: "Rapid adoption of new frameworks, technology curiosity, and self-directed skill training.", icon: <GraduationCap className="w-5 h-5 text-cyan-400" /> },
    { name: "Communication Clarity", value: `${dna?.Communication ?? 80}%`, desc: "Explaining complex architectural ideas, technical document drafting, and collaborative team synergy.", icon: <Speech className="w-5 h-5 text-emerald-400" /> },
    { name: "System Innovation", value: `${dna?.Innovation ?? 78}%`, desc: "Out-of-the-box system suggestions, product contribution, and optimization discovery focus.", icon: <Lightbulb className="w-5 h-5 text-amber-400" /> }
  ]

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          Talent Radar <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">DNA & Skill intelligence</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Explore average candidate vector profiles and cross-candidate skill intelligence overlap matrices.</p>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-900 gap-6 select-none">
        <button
          onClick={() => setActiveTab('dna')}
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${activeTab === 'dna' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
        >
          <Compass className="w-4 h-4" />
          <span>DNA Distribution</span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${activeTab === 'matrix' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Skill Intelligence Matrix</span>
        </button>
      </div>

      {activeTab === 'dna' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Radar Chart Panel */}
          <div className="lg:col-span-3 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[440px] relative">
            <div className="absolute top-4 left-4 text-xs font-bold text-slate-500 flex items-center gap-1.5"><Compass className="w-4 h-4" /> DNA Vector Grid</div>
            
            <div className="w-full h-80 max-w-sm mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#334155" opacity={0.5} />
                  <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={11} fontWeight="bold" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                  <Radar name="Candidate Pool Avg" dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-slate-500 text-center max-w-xs mt-2 leading-relaxed">
              The vector represents the standard profile index of candidates parsed into the talent pool. Adjust job criteria to alter focus.
            </div>
          </div>

          {/* Detailed Breakdown Panel */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 max-h-[440px] overflow-y-auto no-scrollbar">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-400" /> Vector Parameter Specs</h3>
            
            <div className="space-y-3.5">
              {metricsInfo.map((metric, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {metric.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-white">{metric.name}</h4>
                      <span className="text-xs font-extrabold text-indigo-405">{metric.value}</span>
                    </div>
                    <p className="text-[10px] text-slate-505 leading-relaxed">{metric.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Skill Intelligence Matrix</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Cross-candidate matching vectors for skills, gaps, and structural alignment.</p>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs text-slate-300 min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Matched Skills</th>
                  <th className="py-3 px-4">Missing Gaps</th>
                  <th className="py-3 px-4">Additional Skills</th>
                  <th className="py-3 px-4 text-center">Overlap / Alignment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {rankings.map((r: any) => {
                  const matched = r.matched_skills || []
                  const missing = r.missing_skills || []
                  const additional = r.additional_skills || []
                  
                  const totalRequired = matched.length + missing.length
                  const overlapPercent = totalRequired > 0 
                    ? Math.round((matched.length / totalRequired) * 100) 
                    : 0
                  const coveragePercent = Math.round(r.overall_score)

                  return (
                    <tr key={r.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        <div>{r.candidate.name}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{r.candidate.current_title || 'Engineer'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {matched.map((s: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold">
                              {s}
                            </span>
                          ))}
                          {matched.length === 0 && <span className="text-slate-600 text-[10px]">None</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {missing.map((s: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-semibold">
                              {s}
                            </span>
                          ))}
                          {missing.length === 0 && <span className="text-slate-600 text-[10px]">None</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {additional.map((s: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-semibold">
                              {s}
                            </span>
                          ))}
                          {additional.length === 0 && <span className="text-slate-600 text-[10px]">None</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-white text-xs">{overlapPercent}% Overlap</span>
                          <span className="text-[9px] text-indigo-400 font-semibold">{coveragePercent}% Alignment</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/candidate/${r.candidate.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-white transition-colors"
                        >
                          Profile <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {rankings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-550 italic">
                      No candidate rankings found for the active job context. Upload resumes in Talent Intake to match candidates to this job.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
