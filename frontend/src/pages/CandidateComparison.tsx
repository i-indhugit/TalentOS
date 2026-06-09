import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Eye,
  Plus,
  Trash2,
  TrendingUp,
  Cpu,
  Speech,
  ShieldCheck,
  Scale
} from 'lucide-react'

export default function CandidateComparison({ 
  token, 
  activeJobId 
}: { 
  token: string | null, 
  activeJobId: number | null 
}) {
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRankingCandidates = async () => {
      if (!token || !activeJobId) return
      try {
        const res = await fetch(`/api/v1/rankings?job_id=${activeJobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const list = await res.json()
          setCandidates(list)
          // Pre-select top 2 candidates if available
          if (list.length >= 2) {
            setSelectedIds([list[0].candidate.id, list[1].candidate.id])
          } else if (list.length === 1) {
            setSelectedIds([list[0].candidate.id])
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchRankingCandidates()
  }, [token, activeJobId])

  const toggleCandidateSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id))
    } else {
      if (selectedIds.length >= 3) {
        alert("You can compare up to 3 candidates at a time.")
        return
      }
      setSelectedIds([...selectedIds, id])
    }
  }

  const selectedCandidates = candidates.filter(r => selectedIds.includes(r.candidate.id))

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4" />
        <div className="h-80 bg-slate-800 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Talent Comparison Workspace <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20"><Scale className="w-3.5 h-3.5" /> Side-by-side Analysis</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Select and compare alignment scores, DNA vectors, and capabilities of up to 3 candidates.</p>
        </div>
      </div>

      {/* CANDIDATES SELECTOR BAR */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Select Candidates to Compare</h3>
        <div className="flex flex-wrap gap-2.5">
          {candidates.map(r => {
            const selected = selectedIds.includes(r.candidate.id)
            return (
              <button
                key={r.id}
                onClick={() => toggleCandidateSelection(r.candidate.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${selected ? 'bg-indigo-650/25 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-350'}`}
              >
                <span>{r.candidate.name} ({Math.round(r.overall_score)}%)</span>
                {selected ? <Trash2 className="w-3.5 h-3.5 text-indigo-400" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            )
          })}
          {candidates.length === 0 && (
            <span className="text-xs text-slate-500">No candidates available. Please upload resumes first.</span>
          )}
        </div>
      </div>

      {/* COMPARISON SLIDES GRID */}
      {selectedCandidates.length === 0 ? (
        <div className="glass-panel p-20 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
          <Scale className="w-12 h-12 text-slate-700 animate-pulse" />
          <span>Please select one or more candidates from the selector above to trigger comparison telemetry.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {selectedCandidates.map((r, i) => {
            const cand = r.candidate
            return (
              <div 
                key={r.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Visual Accent glow */}
                <div className={`absolute top-0 left-0 w-full h-[3px] ${i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-purple-500' : 'bg-cyan-500'}`} />
                
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-indigo-400 text-sm">
                        {cand.name[0]}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{cand.name}</h4>
                        <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{cand.current_title || 'Software Developer'}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-2xl font-black text-indigo-455 block leading-none">{Math.round(r.overall_score)}%</span>
                      <span className="text-[8px] text-slate-550 block font-bold uppercase tracking-wider mt-1">ALIGNMENT</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl text-[11px] text-slate-400 leading-relaxed min-h-[90px] text-left">
                    <b>AI Summary:</b> {cand.summary.substring(0, 160)}...
                  </div>

                  {/* Core scoring breakdown */}
                  <div className="space-y-2 border-t border-slate-850 pt-4 text-xs text-left">
                    <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block mb-2">Metrics Scoring</span>
                    {[
                      { label: "Skills Alignment", val: r.skill_score, color: "bg-indigo-500" },
                      { label: "Experience Match", val: r.experience_score, color: "bg-purple-500" },
                      { label: "Education Credentials", val: r.education_score, color: "bg-cyan-500" },
                      { label: "Projects Scope", val: r.projects_score, color: "bg-emerald-500" }
                    ].map((metric, mIdx) => (
                      <div key={mIdx} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>{metric.label}</span>
                          <span>{Math.round(metric.val)}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DNA vector meters */}
                  <div className="space-y-2.5 border-t border-slate-850 pt-4 text-xs text-left">
                    <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block mb-2">DNA Vector Vectors</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-950/30 p-2 rounded-lg border border-slate-855 flex justify-between">
                        <span className="text-slate-500 flex items-center gap-1"><Cpu className="w-3 h-3" /> Tech</span>
                        <span className="font-bold text-white">{cand.dna_technical}%</span>
                      </div>
                      <div className="bg-slate-950/30 p-2 rounded-lg border border-slate-855 flex justify-between">
                        <span className="text-slate-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Lead</span>
                        <span className="font-bold text-white">{cand.dna_leadership}%</span>
                      </div>
                      <div className="bg-slate-950/30 p-2 rounded-lg border border-slate-855 flex justify-between">
                        <span className="text-slate-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Learn</span>
                        <span className="font-bold text-white">{cand.dna_learning}%</span>
                      </div>
                      <div className="bg-slate-950/30 p-2 rounded-lg border border-slate-855 flex justify-between">
                        <span className="text-slate-500 flex items-center gap-1"><Speech className="w-3 h-3" /> Comm</span>
                        <span className="font-bold text-white">{cand.dna_communication}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Risks & Explanations */}
                  <div className="space-y-2 border-t border-slate-850 pt-4 text-xs text-left">
                    <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block mb-1">Risk Summary</span>
                    <div className={`p-3 rounded-xl border flex gap-2.5 items-start ${cand.risk_level === 'High' ? 'bg-rose-500/5 border-rose-500/15 text-rose-400' : cand.risk_level === 'Medium' ? 'bg-amber-500/5 border-amber-500/15 text-amber-400' : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400'}`}>
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-[10px] uppercase block">{cand.risk_level} Risk Level</span>
                        <p className="text-[10px] leading-relaxed text-slate-400">{cand.risk_explanations || 'No notable risk factors.'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer profile link */}
                <div className="mt-6 border-t border-slate-850 pt-4.5 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-semibold">EXP: <b>{cand.experience_years} Years</b></span>
                  <Link 
                    to={`/candidate/${cand.id}`}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-650 border border-slate-800 hover:border-indigo-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    View Full Profile <Eye className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
