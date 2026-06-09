import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Check, 
  AlertTriangle, 
  Eye, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Settings,
  HelpCircle
} from 'lucide-react'

export default function CandidateRankings({ 
  token, 
  activeJobId 
}: { 
  token: string | null, 
  activeJobId: number | null 
}) {
  const [rankings, setRankings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [minScore, setMinScore] = useState(60)
  const [minExp, setMinExp] = useState(0)
  const [sortBy, setSortBy] = useState('score-desc')
  const [activeStatusFilter, setActiveStatusFilter] = useState('All')
  
  // Status changing states
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const fetchRankings = async () => {
    if (!token || !activeJobId) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/v1/rankings?job_id=${activeJobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setRankings(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchRankings()
  }, [token, activeJobId])

  const handleStatusChange = async (candId: number, nextStatus: string) => {
    setUpdatingId(candId)
    try {
      const res = await fetch(`/api/v1/rankings/status?candidate_id=${candId}&status=${nextStatus}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        // Update local state
        setRankings(prev => prev.map(r => r.candidate.id === candId ? {
          ...r,
          candidate: { ...r.candidate, status: nextStatus }
        } : r))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  // Filter list
  const filteredRankings = rankings.filter(r => {
    const nameMatch = r.candidate.name.toLowerCase().includes(search.toLowerCase()) || 
                      (r.candidate.current_title && r.candidate.current_title.toLowerCase().includes(search.toLowerCase()))
    const scoreMatch = r.overall_score >= minScore
    const expMatch = r.candidate.experience_years >= minExp
    const statusMatch = activeStatusFilter === 'All' || r.candidate.status === activeStatusFilter
    return nameMatch && scoreMatch && expMatch && statusMatch
  })

  // Sort list
  const sortedRankings = [...filteredRankings].sort((a, b) => {
    if (sortBy === 'score-desc') return b.overall_score - a.overall_score
    if (sortBy === 'score-asc') return a.overall_score - b.overall_score
    if (sortBy === 'exp-desc') return b.candidate.experience_years - a.candidate.experience_years
    if (sortBy === 'name-asc') return a.candidate.name.localeCompare(b.candidate.name)
    return 0
  })

  const statuses = ["All", "Applied", "Shortlisted", "Interviewing", "Offered", "Rejected"]

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4" />
        <div className="flex gap-6">
          <div className="w-1/4 h-80 bg-slate-800 rounded-2xl" />
          <div className="flex-1 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          Candidate Rankings <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">Matching Matrix</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Weighted matching scores for engineering profiles indexed to the active job profile.</p>
      </div>

      {/* FILTER BAR TOP */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/20 border border-slate-900 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 max-w-md w-full sm:w-auto relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name or title..."
            className="w-full sm:w-64 py-2 pl-10 pr-4 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Workflow filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setActiveStatusFilter(st)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${activeStatusFilter === st ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-805 text-slate-500 hover:text-slate-350'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* SIDE BAR FILTERS PANEL */}
        <div className="w-full lg:w-64 bg-slate-950/30 border border-slate-900 p-5 rounded-2xl space-y-6 shrink-0">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><SlidersHorizontal className="w-4 h-4 text-indigo-405" /> Ranking Filters</h3>
          
          <div className="space-y-4 text-xs">
            {/* Score slide */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-350">
                <span>Min Match Score</span>
                <span className="text-indigo-400">{minScore}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Experience years slide */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-350">
                <span>Min Experience</span>
                <span className="text-indigo-400">{minExp} Years</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={minExp}
                onChange={(e) => setMinExp(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Sorting select */}
            <div className="space-y-2">
              <label className="font-bold text-slate-350 block">Sort Candidates</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none"
              >
                <option value="score-desc">Highest Score Alignment</option>
                <option value="score-asc">Lowest Score Alignment</option>
                <option value="exp-desc">Experience Years (High-Low)</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* CANDIDATES LIST */}
        <div className="flex-1 w-full space-y-4">
          {sortedRankings.length === 0 ? (
            <div className="glass-panel p-16 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
              <Users className="w-10 h-10 text-slate-600" />
              <span>No candidates match the specified filters. Try reducing match threshold or upload profiles in Intake.</span>
            </div>
          ) : (
            sortedRankings.map((r) => {
              const cand = r.candidate
              return (
                <div 
                  key={r.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-750 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative group"
                >
                  {/* Left profile parameters */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-indigo-400 text-sm shrink-0">
                      {cand.name[0]}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <Link 
                          to={`/candidate/${cand.id}`}
                          className="font-bold text-sm text-white hover:text-indigo-400 transition-colors flex items-center gap-0.5"
                        >
                          {cand.name} <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        
                        {/* Risk status */}
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5 ${cand.risk_level === 'High' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : cand.risk_level === 'Medium' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                          {cand.risk_level} Risk
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">{cand.current_title || 'Software Engineer'} • {cand.experience_years} years experience</p>
                      
                      {/* Sub alignment percentages bar */}
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-2">
                        <span>Skills: <span className="text-slate-300">{Math.round(r.skill_score)}%</span></span>
                        <span>Experience: <span className="text-slate-300">{Math.round(r.experience_score)}%</span></span>
                        <span>Education: <span className="text-slate-300">{Math.round(r.education_score)}%</span></span>
                        <span>Projects: <span className="text-slate-300">{Math.round(r.projects_score)}%</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Right score and workflow action buttons */}
                  <div className="flex flex-wrap items-center gap-6 shrink-0 border-t border-slate-850 md:border-t-0 pt-4 md:pt-0">
                    {/* Status switcher */}
                    <div className="text-left">
                      <span className="text-[9px] text-slate-550 block font-bold uppercase tracking-wider mb-1">Recruitment Status</span>
                      <select
                        value={cand.status}
                        disabled={updatingId === cand.id}
                        onChange={(e) => handleStatusChange(cand.id, e.target.value)}
                        className="py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 focus:outline-none disabled:opacity-50"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Overall Score */}
                    <div className="text-right border-l border-slate-850 pl-5 min-w-[70px]">
                      <span className="text-xl font-black text-indigo-400 leading-none">{Math.round(r.overall_score)}%</span>
                      <span className="text-[9px] text-slate-550 font-bold block uppercase tracking-widest mt-0.5">ALIGNMENT</span>
                    </div>

                    {/* Quick view button */}
                    <Link 
                      to={`/candidate/${cand.id}`}
                      className="w-9 h-9 bg-slate-900 border border-slate-800 hover:bg-indigo-650 hover:border-indigo-500 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-sm active:scale-95 shrink-0"
                      title="Inspect Candidate Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
