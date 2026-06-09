import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Building, Landmark, Compass, Target, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function OnboardingPage({ 
  token, 
  fetchUser, 
  fetchJobs 
}: { 
  token: string | null, 
  fetchUser: () => Promise<void>, 
  fetchJobs: () => Promise<void> 
}) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  
  // Form values
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [recruitmentVolume, setRecruitmentVolume] = useState('1-10 per month')
  const [primaryRoles, setPrimaryRoles] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const rolesOptions = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Fullstack Engineer",
    "AI/ML Engineer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "DevOps Engineer"
  ]

  const goalsOptions = [
    "Automate screening of inbound resumes",
    "Identify top 5% candidates contextually",
    "Reduce screening time by over 50%",
    "Verify skill alignment & gaps interactively",
    "Improve quality of generated technical interviews",
    "Audit hiring pipelines with detailed charts"
  ]

  const handleRoleToggle = (role: string) => {
    if (primaryRoles.includes(role)) {
      setPrimaryRoles(primaryRoles.filter(r => r !== role))
    } else {
      setPrimaryRoles([...primaryRoles, role])
    }
  }

  const handleGoalToggle = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal))
    } else {
      setGoals([...goals, goal])
    }
  }

  const handleNext = () => {
    setError(null)
    if (step === 1) {
      if (!companyName.trim()) {
        setError("Company Name is required.")
        return
      }
      if (!industry) {
        setError("Please select your industry.")
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (primaryRoles.length === 0) {
        setError("Please select at least one primary hiring role.")
        return
      }
      setStep(3)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (goals.length === 0) {
      setError("Please select at least one goal.")
      return
    }
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/auth/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: companyName,
          industry,
          recruitment_volume: recruitmentVolume,
          primary_roles: primaryRoles,
          goals
        })
      })
      if (res.ok) {
        await fetchUser()
        await fetchJobs()
        navigate('/dashboard')
      } else {
        const data = await res.json()
        setError(data.detail || "Onboarding submission failed.")
      }
    } catch (e) {
      setError("Connection to server failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0F172A] text-slate-200 overflow-hidden flex flex-col justify-between p-6">
      {/* Background glow highlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] radial-glow-primary pointer-events-none rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] radial-glow-secondary pointer-events-none rounded-full blur-[100px]" />

      {/* Header bar */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">Talent<span className="text-indigo-400">OS</span></span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-indigo-500' : s < step ? 'w-3 bg-indigo-500/50' : 'w-3 bg-slate-800'}`}
            />
          ))}
        </div>
      </div>

      {/* Main card */}
      <div className="relative z-10 my-auto max-w-xl mx-auto w-full">
        <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden border border-slate-800/80">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-left space-y-5"
              >
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Building className="w-5 h-5 text-indigo-450" /> Set Up Organization Profile</h3>
                  <p className="text-xs text-slate-400 mt-1">First, let's configure your basic company details.</p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-450 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-350 uppercase tracking-wider">Company / Team Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Tech Labs"
                      className="w-full py-3 px-4 rounded-xl glass-input text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-350 uppercase tracking-wider">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full py-3 px-4 rounded-xl glass-input text-sm focus:outline-none"
                    >
                      <option value="">Select Industry</option>
                      <option value="Technology & SaaS">Technology & SaaS</option>
                      <option value="Finance & Banking">Finance & Banking</option>
                      <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                      <option value="Staffing & Recruitment Agency">Staffing & Recruitment Agency</option>
                      <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-350 uppercase tracking-wider">Estimated Hiring Volume</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["1-10 / mo", "11-50 / mo", "50+ / mo"].map((vol) => (
                        <button
                          key={vol}
                          type="button"
                          onClick={() => setRecruitmentVolume(vol)}
                          className={`py-3 text-xs font-semibold rounded-xl transition-all border ${recruitmentVolume === vol ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'}`}
                        >
                          {vol}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-left space-y-5"
              >
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Landmark className="w-5 h-5 text-indigo-400" /> Focus Targets</h3>
                  <p className="text-xs text-slate-400 mt-1">Select the primary engineering roles you plan to recruit for.</p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                  {rolesOptions.map((role) => {
                    const selected = primaryRoles.includes(role)
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleToggle(role)}
                        className={`py-3 px-4 text-left text-xs font-semibold rounded-xl transition-all border flex items-center justify-between ${selected ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'}`}
                      >
                        <span>{role}</span>
                        {selected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-all border border-slate-750 flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-2/3 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-left space-y-5"
              >
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Target className="w-5 h-5 text-indigo-400" /> Platform Objectives</h3>
                  <p className="text-xs text-slate-400 mt-1">What are you hoping to accomplish with TalentOS?</p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                  {goalsOptions.map((goal) => {
                    const selected = goals.includes(goal)
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleGoalToggle(goal)}
                        className={`w-full py-3 px-4 text-left text-xs font-semibold rounded-xl transition-all border flex items-center gap-3 ${selected ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'}`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${selected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700'}`}>
                          {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white fill-indigo-500" />}
                        </div>
                        <span className="leading-snug">{goal}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-all border border-slate-750 flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-2/3 py-3.5 bg-indigo-650 hover:bg-indigo-550 disabled:bg-indigo-805 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    {submitting ? 'Submitting...' : 'Complete Setup'} <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer bar */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center py-4 text-[10px] text-slate-500">
        Secured under TalentOS privacy terms. Profile configurations can be altered later in settings.
      </div>
    </div>
  )
}
