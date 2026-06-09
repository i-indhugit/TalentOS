import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { 
  ArrowLeft, 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  FileText,
  Clock,
  Compass,
  ArrowUpRight,
  ChevronRight,
  Clipboard,
  Printer,
  Terminal,
  MessageSquare,
  Zap,
  Award,
  ShieldAlert
} from 'lucide-react'

export default function CandidateProfile({ 
  token, 
  activeJobId 
}: { 
  token: string | null, 
  activeJobId: number | null 
}) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState<any>(null)
  const [skills, setSkills] = useState<any[]>([])
  const [resume, setResume] = useState<any>(null)
  const [interviewPlan, setInterviewPlan] = useState<any>(null)
  const [ranking, setRanking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'questions' | 'resume'>('overview')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchProfileDetails = async () => {
    if (!token || !id) return
    try {
      // 1. Candidate details
      const candRes = await fetch(`/api/v1/candidates/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      // 2. Candidate skills
      const skillsRes = await fetch(`/api/v1/candidates/${id}/skills`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      // 3. Candidate resume text
      const resumeRes = await fetch(`/api/v1/candidates/${id}/resume`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      // 4. Candidate interview plan
      const planRes = await fetch(`/api/v1/candidates/${id}/interview-plan?job_id=${activeJobId || ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      // 5. Candidate ranking details for current activeJobId
      let rankingData = null
      if (activeJobId) {
        const rankingsRes = await fetch(`/api/v1/rankings?job_id=${activeJobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (rankingsRes.ok) {
          const list = await rankingsRes.json()
          rankingData = list.find((r: any) => r.candidate_id === Number(id))
        }
      }

      if (candRes.ok) {
        const candData = await candRes.json()
        setCandidate(candData)
        setRanking(rankingData)
      }
      if (skillsRes.ok) setSkills(await skillsRes.json())
      if (resumeRes.ok) setResume(await resumeRes.json())
      if (planRes.ok) setInterviewPlan(await planRes.json())
      
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchProfileDetails()
  }, [token, id, activeJobId])

  const handleStatusChange = async (nextStatus: string) => {
    if (!candidate) return
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/v1/rankings/status?candidate_id=${candidate.id}&status=${nextStatus}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setCandidate((prev: any) => ({ ...prev, status: nextStatus }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/5" />
        <div className="h-44 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-slate-800 rounded-2xl" />
          <div className="h-96 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="glass-panel p-16 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
        Candidate profile not found.
      </div>
    )
  }

  // DNA Chart mapping
  const radarData = [
    { subject: 'Technical', A: candidate.dna_technical, fullMark: 100 },
    { subject: 'Leadership', A: candidate.dna_leadership, fullMark: 100 },
    { subject: 'Learning', A: candidate.dna_learning, fullMark: 100 },
    { subject: 'Communication', A: candidate.dna_communication, fullMark: 100 },
    { subject: 'Innovation', A: candidate.dna_innovation, fullMark: 100 }
  ]

  // Default mocked questions if endpoint returns async loading or generic plans
  const displayPlan = interviewPlan || {
    strategy: `Validate general programming capabilities in the context of candidate skills.`,
    technical_questions: [
      { question: "Explain how you handle thread safety and race conditions in concurrent scripting architectures.", difficulty: "Advanced", ideal_answer: "Look for lock primitives, atomic structures, thread states, or thread-local contexts." },
      { question: "How would you design a scalable caching layer for an API endpoint experiencing highly dynamic reads?", difficulty: "Advanced", ideal_answer: "Use Redis or Memcached with cache-aside pattern, key TTL settings, and eviction policies." }
    ],
    behavioral_questions: [
      { question: "Describe a complex technical bug that delayed release. How did you diagnose and solve it?", difficulty: "Intermediate", ideal_answer: "Details on logging analysis, stack traces, step-by-step diagnostic reasoning, and risk management." }
    ],
    project_questions: [],
    scenario_questions: [],
    skill_gap_questions: []
  }

  return (
    <div className="space-y-6 text-left">
      {/* Return link */}
      <Link 
        to="/rankings" 
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Rankings List
      </Link>

      {/* OVERVIEW PANEL HEADER */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 radial-glow-primary pointer-events-none opacity-30 rounded-full" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-lg">
            {candidate.name[0]}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
              {candidate.name}
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${candidate.risk_level === 'High' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-455' : candidate.risk_level === 'Medium' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-450' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                {candidate.risk_level} Risk
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-semibold">{candidate.current_title || 'Software Engineer'} • {candidate.experience_years} Years Experience</p>
            
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 pt-1.5">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {candidate.email || 'N/A'}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {candidate.phone || 'N/A'}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {candidate.location || 'San Francisco, CA'}</span>
            </div>
          </div>
        </div>

        {/* Right metrics and status update */}
        <div className="flex flex-wrap items-center gap-6 shrink-0 border-t border-slate-850 md:border-t-0 pt-4 md:pt-0">
          <div>
            <span className="text-[9px] text-slate-550 block font-bold uppercase tracking-wider mb-1">Update Status</span>
            <select
              value={candidate.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-350 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {ranking && (
            <div className="text-right border-l border-slate-850 pl-5 pr-1 min-w-[70px]">
              <span className="text-3xl font-black text-indigo-400 leading-none">{Math.round(ranking.overall_score)}%</span>
              <span className="text-[9px] text-slate-550 font-bold block uppercase tracking-wider mt-1">ALIGNMENT</span>
            </div>
          )}
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-900 gap-6 select-none">
        {[
          { id: 'overview', label: 'Candidate Overview', icon: <Compass className="w-4 h-4" /> },
          { id: 'skills', label: 'Skill Gap Analysis', icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: 'questions', label: 'Tailored Interview Plan', icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'resume', label: 'Original Resume Text', icon: <FileText className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${activeTab === tab.id ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left main area (Columns 2) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-400" /> AI Summary & Insights</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{candidate.summary}</p>
                {candidate.ai_insights && (
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-indigo-300 text-xs leading-relaxed">
                    <b>Recruiter Intel:</b> {candidate.ai_insights}
                  </div>
                )}
              </div>

              {/* Risk Audit Panel */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5"><AlertTriangle className="w-4.5 h-4.5 text-amber-450" /> Retention & Hiring Risk Assessment</h3>
                <div className="flex gap-4.5 items-start">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${candidate.risk_level === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' : candidate.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-300">Computed Classification: <span className={`${candidate.risk_level === 'High' ? 'text-rose-400' : candidate.risk_level === 'Medium' ? 'text-amber-450' : 'text-emerald-450'}`}>{candidate.risk_level} Risk</span></span>
                    <p className="text-xs text-slate-400 leading-relaxed">{candidate.risk_explanations || 'No significant structural risks or gaps identified.'}</p>
                  </div>
                </div>
              </div>

              {/* Experience Timeline list */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-1.5"><Briefcase className="w-4.5 h-4.5 text-indigo-400" /> Career Milestones & Experience Timeline</h3>
                
                <div className="relative border-l border-slate-800 ml-3.5 pl-6.5 space-y-6 py-2">
                  <div className="relative">
                    <div className="absolute -left-9.5 top-0.5 w-6 h-6 rounded-full bg-slate-900 border border-indigo-500 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-indigo-400 uppercase">Current Role</span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{candidate.current_title || 'Lead Systems Developer'}</h4>
                      <p className="text-xs text-slate-500 font-semibold">Tenure: {candidate.experience_years} Years</p>
                      <p className="text-[11px] text-slate-450 mt-2 leading-relaxed">{candidate.summary}</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-9.5 top-0.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Prior Experience</span>
                      <h4 className="text-xs font-bold text-slate-400 mt-0.5">Software Engineer / Research Intern</h4>
                      <p className="text-xs text-slate-500 font-semibold">{candidate.education || 'CS Program'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}          {activeTab === 'skills' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Required vs Candidate Overlap</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Detailed map of matched, missing, and additional skill vectors compared to the target job description.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Matched Skills */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-emerald-400 block border-b border-slate-850 pb-2">✓ Matched Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {(ranking?.matched_skills && ranking.matched_skills.length > 0
                      ? ranking.matched_skills
                      : skills.filter(cs => ranking?.job?.target_skills?.toLowerCase().split(',').map((s: string) => s.trim()).includes(cs.skill_name.toLowerCase())).map(cs => cs.skill_name)
                    ).map((skillName: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded-lg bg-emerald-550/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> {skillName}
                      </span>
                    ))}
                    {skills.length === 0 && <span className="text-xs text-slate-500">No matched skills detected.</span>}
                  </div>
                </div>

                {/* Missing Gaps */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-rose-400 block border-b border-slate-850 pb-2">✗ Missing Gaps</span>
                  <div className="flex flex-wrap gap-2">
                    {(ranking?.missing_skills && ranking.missing_skills.length > 0
                      ? ranking.missing_skills
                      : ranking?.job?.target_skills ? ranking.job.target_skills.split(',').map((ts: string) => ts.trim()).filter((ts: string) => !skills.some(cs => cs.skill_name.toLowerCase() === ts.toLowerCase())) : []
                    ).map((skillName: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> {skillName}
                      </span>
                    ))}
                    {(ranking?.missing_skills ? ranking.missing_skills.length === 0 : true) && !ranking?.job?.target_skills && (
                      <span className="text-xs text-slate-500">No missing gaps mapped.</span>
                    )}
                  </div>
                </div>

                {/* Additional Skills */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-indigo-400 block border-b border-slate-850 pb-2">✦ Additional Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {(ranking?.additional_skills && ranking.additional_skills.length > 0
                      ? ranking.additional_skills
                      : skills.filter(cs => !ranking?.job?.target_skills?.toLowerCase().split(',').map((s: string) => s.trim()).includes(cs.skill_name.toLowerCase())).map(cs => cs.skill_name)
                    ).map((skillName: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> {skillName}
                      </span>
                    ))}
                    {skills.length === 0 && <span className="text-xs text-slate-500">No additional skills.</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tailored Interview Plan</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Custom questions generated to probe technical limits, projects, scenarios, and alignment.</p>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-350 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Guide
                </button>
              </div>

              {displayPlan.strategy && (
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-xs text-slate-400">
                  <span className="font-bold text-indigo-400 block mb-1">Interview Assessment Strategy:</span>
                  {displayPlan.strategy}
                </div>
              )}

              <div className="space-y-5">
                {displayPlan.technical_questions?.map((q: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-indigo-500 pl-4 py-1.5 space-y-2 text-left">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-1"><Terminal className="w-3.5 h-3.5 text-indigo-400" /> Technical Question #{idx+1} • {q.difficulty}</span>
                    <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                    <p className="text-[11px] text-slate-500"><b className="text-slate-400">Ideal Answer Signals:</b> {q.ideal_answer}</p>
                  </div>
                ))}
                
                {displayPlan.behavioral_questions?.map((q: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-purple-500 pl-4 py-1.5 space-y-2 text-left">
                    <span className="text-[10px] font-bold text-purple-400 uppercase flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Behavioral Question #{idx+1} • {q.difficulty}</span>
                    <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                    <p className="text-[11px] text-slate-500"><b className="text-slate-400">Ideal Answer Signals:</b> {q.ideal_answer}</p>
                  </div>
                ))}

                {displayPlan.project_questions?.map((q: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-emerald-500 pl-4 py-1.5 space-y-2 text-left">
                    <span className="text-[10px] font-bold text-emerald-450 uppercase flex items-center gap-1"><Award className="w-3.5 h-3.5 text-emerald-400" /> Project-Based Question #{idx+1} • {q.difficulty}</span>
                    <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                    <p className="text-[11px] text-slate-500"><b className="text-slate-400">Ideal Answer Signals:</b> {q.ideal_answer}</p>
                  </div>
                ))}

                {displayPlan.scenario_questions?.map((q: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-cyan-500 pl-4 py-1.5 space-y-2 text-left">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-cyan-400" /> Scenario Question #{idx+1} • {q.difficulty}</span>
                    <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                    <p className="text-[11px] text-slate-500"><b className="text-slate-400">Ideal Answer Signals:</b> {q.ideal_answer}</p>
                  </div>
                ))}

                {displayPlan.skill_gap_questions?.map((q: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-rose-500 pl-4 py-1.5 space-y-2 text-left">
                    <span className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-rose-455" /> Skill-Gap Validation Question #{idx+1} • {q.difficulty}</span>
                    <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                    <p className="text-[11px] text-slate-500"><b className="text-slate-400">Ideal Answer Signals:</b> {q.ideal_answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                <span className="text-xs text-indigo-455 font-bold uppercase flex items-center gap-1.5"><FileText className="w-4.5 h-4.5" /> {resume?.filename || 'Resume Raw Source'}</span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl max-h-[400px] overflow-y-auto pr-1 no-scrollbar border border-slate-855/60 text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap text-left">
                {resume?.raw_text || 'No resume text parsed.'}
              </div>
            </div>
          )}
        </div>

        {/* Right side widgets (Radar Chart / Education) */}
        <div className="space-y-6">
          {/* Radar Chart DNA panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col items-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 self-start flex items-center gap-1.5"><Compass className="w-4 h-4 text-indigo-400" /> DNA Alignment Map</h4>
            
            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="#334155" opacity={0.5} />
                  <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                  <Radar name="Candidate" dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Score Grid details */}
            <div className="w-full grid grid-cols-2 gap-2.5 mt-4 text-xs">
              <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850 flex justify-between">
                <span className="text-slate-500">Tech</span>
                <span className="font-bold text-white">{candidate.dna_technical}%</span>
              </div>
              <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850 flex justify-between">
                <span className="text-slate-500">Lead</span>
                <span className="font-bold text-white">{candidate.dna_leadership}%</span>
              </div>
              <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850 flex justify-between">
                <span className="text-slate-500">Learn</span>
                <span className="font-bold text-white">{candidate.dna_learning}%</span>
              </div>
              <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850 flex justify-between">
                <span className="text-slate-500">Comm</span>
                <span className="font-bold text-white">{candidate.dna_communication}%</span>
              </div>
            </div>
          </div>

          {/* Education credentials */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-left space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><GraduationCap className="w-4.5 h-4.5 text-indigo-400" /> Education Mappings</h4>
            <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase">Degree & School</span>
              <p className="text-xs font-bold text-white">{candidate.education || 'Not Specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
