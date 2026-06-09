import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Sparkles, 
  Layers, 
  FileCheck, 
  Users, 
  Bot, 
  BarChart3, 
  Compass, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Briefcase, 
  Menu, 
  X,
  Target,
  PlusCircle
} from 'lucide-react'

export default function Layout({ 
  user, 
  jobs, 
  activeJobId, 
  setActiveJobId, 
  handleLogout, 
  fetchJobs,
  children 
}: { 
  user: any, 
  jobs: any[], 
  activeJobId: number | null, 
  setActiveJobId: (id: number) => void, 
  handleLogout: () => void,
  fetchJobs: () => Promise<void>,
  children: React.ReactNode 
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showJobSelect, setShowJobSelect] = useState(false)
  const [showNewJobModal, setShowNewJobModal] = useState(false)
  
  // New Job states
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobDept, setNewJobDept] = useState('')
  const [newJobDesc, setNewJobDesc] = useState('')
  const [newJobSkills, setNewJobSkills] = useState('')
  const [newJobExp, setNewJobExp] = useState(3)
  const [newJobLoc, setNewJobLoc] = useState('San Francisco, CA')
  const [newJobEdu, setNewJobEdu] = useState("Bachelor's in Computer Science")
  const [creatingJob, setCreatingJob] = useState(false)

  const menuItems = [
    { name: "Command Center", path: "/dashboard", icon: <Layers className="w-4.5 h-4.5" /> },
    { name: "Talent Intake", path: "/intake", icon: <FileCheck className="w-4.5 h-4.5" /> },
    { name: "Candidate Rankings", path: "/rankings", icon: <Users className="w-4.5 h-4.5" /> },
    { name: "Talent Radar", path: "/radar", icon: <Compass className="w-4.5 h-4.5" /> },
    { name: "Recruiter Copilot", path: "/copilot", icon: <Bot className="w-4.5 h-4.5" /> },
    { name: "Interview Intelligence", path: "/interview", icon: <Target className="w-4.5 h-4.5" /> },
    { name: "Hiring Analytics", path: "/analytics", icon: <BarChart3 className="w-4.5 h-4.5" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="w-4.5 h-4.5" /> },
  ]

  const activeJob = jobs.find(j => j.id === activeJobId)

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJobTitle.trim() || !newJobDesc.trim()) return
    setCreatingJob(true)
    try {
      const token = localStorage.getItem('talentos_token')
      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newJobTitle,
          description: newJobDesc,
          department: newJobDept || "Engineering",
          location: newJobLoc,
          experience_years: Number(newJobExp),
          education_req: newJobEdu,
          target_skills: newJobSkills
        })
      })
      if (res.ok) {
        const data = await res.json()
        await fetchJobs()
        setActiveJobId(data.id)
        setShowNewJobModal(false)
        setNewJobTitle('')
        setNewJobDept('')
        setNewJobDesc('')
        setNewJobSkills('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCreatingJob(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex overflow-hidden">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] radial-glow-primary pointer-events-none rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] radial-glow-secondary pointer-events-none rounded-full blur-[120px] z-0" />

      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden md:flex md:w-64 bg-slate-950/45 border-r border-slate-900 flex-col justify-between p-5 z-20 shrink-0 select-none">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-1.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">Talent<span className="text-indigo-400">OS</span></span>
          </div>

          {/* Job Swapper Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowJobSelect(!showJobSelect)}
              className="w-full py-2.5 px-3 bg-slate-900/50 border border-slate-800/80 rounded-xl flex items-center justify-between hover:bg-slate-850 transition-all text-left group"
            >
              <div className="flex items-center gap-2 max-w-[80%]">
                <Briefcase className="w-4 h-4 text-indigo-450 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-0.5">Hiring For</div>
                  <div className="text-xs font-bold text-slate-200 truncate leading-none mt-1">{activeJob ? activeJob.title : 'No Positions'}</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-350 transition-colors shrink-0" />
            </button>

            {showJobSelect && (
              <div className="absolute left-0 mt-2 w-full glass-panel border border-slate-800 rounded-xl py-1.5 shadow-xl z-30 max-h-56 overflow-y-auto pr-1 no-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => {
                      setActiveJobId(job.id)
                      setShowJobSelect(false)
                    }}
                    className={`w-full py-2 px-3 text-left text-xs font-bold hover:bg-slate-800/60 block truncate ${job.id === activeJobId ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-400'}`}
                  >
                    {job.title}
                  </button>
                ))}
                <div className="border-t border-slate-800/60 my-1.5" />
                <button
                  onClick={() => {
                    setShowNewJobModal(true)
                    setShowJobSelect(false)
                  }}
                  className="w-full py-2 px-3 text-left text-xs font-bold text-indigo-450 hover:bg-slate-800/60 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Add New Position
                </button>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item, idx) => {
              const active = location.pathname === item.path || (item.path === '/rankings' && location.pathname.startsWith('/candidate'))
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${active ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer profile */}
        <div className="border-t border-slate-900 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5 max-w-[75%]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              {user ? user.full_name[0] : 'U'}
            </div>
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate leading-none mb-1">{user ? user.full_name : 'Recruiter'}</h4>
              <span className="text-[10px] text-slate-500 truncate block leading-none">{user ? user.company_name : 'TalentOS'}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-805/80 hover:bg-rose-950/20 hover:border-rose-900/30 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-all shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden absolute top-0 left-0 w-full bg-[#0F172A]/80 border-b border-slate-850/60 p-4 flex items-center justify-between z-30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">TalentOS</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-all"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-950/90 z-20 backdrop-blur-md p-6 pt-20 flex flex-col justify-between select-none">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Select position</span>
              <select
                value={activeJobId || ''}
                onChange={(e) => {
                  setActiveJobId(Number(e.target.value))
                  setMobileMenuOpen(false)
                }}
                className="w-full py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map((item, idx) => {
                const active = location.pathname === item.path
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${active ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-350'}`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center justify-between border-t border-slate-900 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">{user ? user.full_name[0] : 'U'}</div>
              <div>
                <h4 className="text-sm font-bold text-white leading-none mb-1">{user ? user.full_name : 'Recruiter'}</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-none">{user ? user.company_name : 'TalentOS'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                handleLogout()
                setMobileMenuOpen(false)
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-rose-955/20 border border-slate-800 hover:border-rose-900/30 text-rose-455 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* WORKSPACE AREA */}
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8 overflow-y-auto no-scrollbar relative z-10 min-h-screen">
        {children}
      </main>

      {/* NEW JOB POSITION CREATION MODAL */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
            <div className="flex justify-between items-start mb-5 text-left">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-400" /> Create Hiring Position</h3>
                <p className="text-xs text-slate-450 mt-1">Specify parameters to trigger matching embeddings scoring.</p>
              </div>
              <button 
                onClick={() => setShowNewJobModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="e.g. Senior Staff AI Engineer"
                    className="w-full py-2 px-3.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Department</label>
                  <input
                    type="text"
                    value={newJobDept}
                    onChange={(e) => setNewJobDept(e.target.value)}
                    placeholder="e.g. Machine Learning"
                    className="w-full py-2 px-3.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Job Description & Description Details</label>
                <textarea
                  required
                  rows={3}
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  placeholder="Summarize key tasks, tech stack, and goals..."
                  className="w-full py-2 px-3.5 rounded-xl glass-input text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Target Skills (Comma separated)</label>
                <input
                  type="text"
                  value={newJobSkills}
                  onChange={(e) => setNewJobSkills(e.target.value)}
                  placeholder="Python, PyTorch, Transformers, FastAPI, NLP"
                  className="w-full py-2 px-3.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Required Experience (Years)</label>
                  <input
                    type="number"
                    value={newJobExp}
                    onChange={(e) => setNewJobExp(Number(e.target.value))}
                    min={0}
                    className="w-full py-2 px-3.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Education Requirement</label>
                  <input
                    type="text"
                    value={newJobEdu}
                    onChange={(e) => setNewJobEdu(e.target.value)}
                    className="w-full py-2 px-3.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={newJobLoc}
                  onChange={(e) => setNewJobLoc(e.target.value)}
                  className="w-full py-2 px-3.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-850/60">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingJob}
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  {creatingJob ? 'Creating...' : 'Create Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
