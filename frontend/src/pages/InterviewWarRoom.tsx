import React, { useState, useEffect } from 'react'
import { 
  Target, 
  HelpCircle, 
  ChevronDown, 
  CheckCircle2, 
  Printer, 
  ShieldAlert, 
  Sparkles,
  Award,
  Terminal,
  MessageSquare,
  Zap,
  Info
} from 'lucide-react'

export default function InterviewWarRoom({ 
  token, 
  activeJobId 
}: { 
  token: string | null, 
  activeJobId: number | null 
}) {
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedCandId, setSelectedCandId] = useState<number | null>(null)
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [difficultyFilter, setDifficultyFilter] = useState('All') // All, Easy/Intermediate, Hard/Advanced

  useEffect(() => {
    const fetchCandidatesList = async () => {
      if (!token || !activeJobId) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/v1/rankings?job_id=${activeJobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const list = await res.json()
          setCandidates(list)
          if (list.length > 0) {
            setSelectedCandId(list[0].candidate.id)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCandidatesList()
  }, [token, activeJobId])

  useEffect(() => {
    const fetchInterviewPlan = async () => {
      if (!token || !selectedCandId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/v1/candidates/${selectedCandId}/interview-plan?job_id=${activeJobId || ''}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setPlan(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchInterviewPlan()
  }, [token, selectedCandId, activeJobId])

  const activeCand = candidates.find(c => c.candidate.id === selectedCandId)

  // Filter questions based on selected difficulty
  const filterQuestion = (q: any) => {
    if (difficultyFilter === 'All') return true
    if (difficultyFilter === 'Easy/Medium') {
      return q.difficulty.toLowerCase() === 'easy' || q.difficulty.toLowerCase() === 'medium' || q.difficulty.toLowerCase() === 'intermediate'
    }
    if (difficultyFilter === 'Advanced/Hard') {
      return q.difficulty.toLowerCase() === 'hard' || q.difficulty.toLowerCase() === 'advanced'
    }
    return true
  }

  const technicalQuestions = plan?.technical_questions?.filter(filterQuestion) || []
  const behavioralQuestions = plan?.behavioral_questions?.filter(filterQuestion) || []
  const projectQuestions = plan?.project_questions?.filter(filterQuestion) || []
  const scenarioQuestions = plan?.scenario_questions?.filter(filterQuestion) || []
  const skillGapQuestions = plan?.skill_gap_questions?.filter(filterQuestion) || []

  if (loading && candidates.length === 0) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4" />
        <div className="h-96 bg-slate-800 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Interview Intelligence <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20"><Target className="w-4 h-4" /> Assessment Planners</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Generate technical interview plans tailored to candidate qualifications and gaps.</p>
        </div>
        
        {/* Export / Print */}
        <button
          onClick={() => window.print()}
          className="self-start px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-350 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <Printer className="w-4 h-4" /> Print Assessment Guide
        </button>
      </div>

      {/* SWAPPER & FILTERS PANELS */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-950/25 border border-slate-900 p-4 rounded-2xl">
        {/* Candidate Selector */}
        <div className="flex-1 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Candidate Subject</span>
          <select
            value={selectedCandId || ''}
            onChange={(e) => setSelectedCandId(Number(e.target.value))}
            className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-205 focus:outline-none"
          >
            {candidates.map(c => (
              <option key={c.candidate.id} value={c.candidate.id}>{c.candidate.name} ({Math.round(c.overall_score)}% Alignment)</option>
            ))}
            {candidates.length === 0 && (
              <option>No candidate records</option>
            )}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex-1 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Question Difficulty</span>
          <div className="flex rounded-xl bg-slate-900/60 p-0.5 border border-slate-800">
            {["All", "Easy/Medium", "Advanced/Hard"].map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`flex-1 py-2 text-[10px] font-extrabold rounded-lg uppercase transition-all ${difficultyFilter === diff ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED CONTENT PLANNER */}
      {!activeCand ? (
        <div className="glass-panel p-20 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
          <Info className="w-12 h-12 text-slate-750" />
          <span>Select a candidate and job to generate interview intelligence.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Strategy columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Strategy note */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 radial-glow-primary pointer-events-none opacity-20 rounded-full" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-400" /> Assessment Strategy</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{plan?.strategy || 'Assess engineering capabilities.'}</p>
            </div>

            {/* Questions lists */}
            <div className="space-y-4">
              {/* Technical Section */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><Terminal className="w-4.5 h-4.5 text-indigo-400" /> Tailored Technical Questions ({technicalQuestions.length})</h3>
                
                <div className="space-y-4.5">
                  {technicalQuestions.map((q: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-indigo-500 pl-4 py-1 space-y-1.5">
                      <span className="text-[10px] font-bold text-indigo-405 uppercase">Question #{idx+1} • {q.difficulty}</span>
                      <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed"><b className="text-slate-300">Expected Signals:</b> {q.ideal_answer}</p>
                    </div>
                  ))}
                  {technicalQuestions.length === 0 && (
                    <span className="text-xs text-slate-500 block italic">No technical questions matching filters.</span>
                  )}
                </div>
              </div>

              {/* Behavioral Section */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><MessageSquare className="w-4.5 h-4.5 text-purple-400" /> Behavioral & Competency Questions ({behavioralQuestions.length})</h3>
                
                <div className="space-y-4.5">
                  {behavioralQuestions.map((q: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-purple-500 pl-4 py-1 space-y-1.5">
                      <span className="text-[10px] font-bold text-purple-405 uppercase">Question #{idx+1} • {q.difficulty}</span>
                      <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed"><b className="text-slate-300">Expected Signals:</b> {q.ideal_answer}</p>
                    </div>
                  ))}
                  {behavioralQuestions.length === 0 && (
                    <span className="text-xs text-slate-500 block italic">No behavioral questions matching filters.</span>
                  )}
                </div>
              </div>

              {/* Project-Based Section */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><Award className="w-4.5 h-4.5 text-emerald-400" /> Project-Based Questions ({projectQuestions.length})</h3>
                
                <div className="space-y-4.5">
                  {projectQuestions.map((q: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-emerald-500 pl-4 py-1 space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-405 uppercase">Question #{idx+1} • {q.difficulty}</span>
                      <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed"><b className="text-slate-300">Expected Signals:</b> {q.ideal_answer}</p>
                    </div>
                  ))}
                  {projectQuestions.length === 0 && (
                    <span className="text-xs text-slate-500 block italic">No project-based questions matching filters.</span>
                  )}
                </div>
              </div>

              {/* Scenario Section */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><Zap className="w-4.5 h-4.5 text-cyan-400" /> Scenario & Architecture Challenges ({scenarioQuestions.length})</h3>
                
                <div className="space-y-4.5">
                  {scenarioQuestions.map((q: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-cyan-500 pl-4 py-1 space-y-1.5">
                      <span className="text-[10px] font-bold text-cyan-405 uppercase">Question #{idx+1} • {q.difficulty}</span>
                      <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed"><b className="text-slate-300">Expected Signals:</b> {q.ideal_answer}</p>
                    </div>
                  ))}
                  {scenarioQuestions.length === 0 && (
                    <span className="text-xs text-slate-500 block italic">No scenario-based questions matching filters.</span>
                  )}
                </div>
              </div>

              {/* Skill-Gap Validation Section */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><ShieldAlert className="w-4.5 h-4.5 text-rose-400" /> Skill-Gap Validation Questions ({skillGapQuestions.length})</h3>
                
                <div className="space-y-4.5">
                  {skillGapQuestions.map((q: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-rose-500 pl-4 py-1 space-y-1.5">
                      <span className="text-[10px] font-bold text-rose-405 uppercase">Question #{idx+1} • {q.difficulty}</span>
                      <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed"><b className="text-slate-300">Expected Signals:</b> {q.ideal_answer}</p>
                    </div>
                  ))}
                  {skillGapQuestions.length === 0 && (
                    <span className="text-xs text-slate-500 block italic">No skill-gap validation questions matching filters.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar insights */}
          <div className="space-y-6">
            {/* Candidate summary panel */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-left space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Assessment Subject Profile</h4>
              
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-indigo-400">{activeCand.candidate.name[0]}</div>
                <div>
                  <h4 className="text-xs font-bold text-white">{activeCand.candidate.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{activeCand.candidate.current_title} • {activeCand.candidate.experience_years} Years XP</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-850 pt-4 text-[10px] font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Match Score:</span>
                  <span className="text-indigo-400 font-bold">{Math.round(activeCand.overall_score)}% Alignment</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Level:</span>
                  <span className={`font-bold ${activeCand.candidate.risk_level === 'High' ? 'text-rose-400' : activeCand.candidate.risk_level === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{activeCand.candidate.risk_level} Risk</span>
                </div>
              </div>
            </div>

            {/* Strategy topics parameters */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-left space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-indigo-400" /> Focus Target Areas</h4>
              <div className="space-y-2 text-xs">
                {plan?.focus_areas?.map((fa: any, idx: number) => (
                  <div key={idx} className="bg-slate-950/45 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
                    <span className="text-slate-450 font-bold text-[10px] uppercase">{fa.area}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${fa.priority === 'High' ? 'bg-indigo-650/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>{fa.priority}</span>
                  </div>
                ))}
                {!plan?.focus_areas && (
                  <span className="text-xs text-slate-550 italic">Standard assessment limits apply.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
