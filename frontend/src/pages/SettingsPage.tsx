import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Settings, 
  User, 
  Building, 
  Palette, 
  Database, 
  ShieldCheck, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react'

export default function SettingsPage({ 
  token, 
  fetchUser 
}: { 
  token: string | null, 
  fetchUser: () => Promise<void> 
}) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'profile' | 'org' | 'data'>('profile')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Profile forms
  const [profileName, setProfileName] = useState('')
  
  // Org forms
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')

  const handleSeedDatabase = async () => {
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/v1/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMsg("Database successfully populated with high-fidelity candidate matching logs!")
        await fetchUser()
      } else {
        setErrorMsg(data.detail || "Database seeding failed.")
      }
    } catch (e) {
      setErrorMsg("Failed to connect to backend seed router.")
    } finally {
      setLoading(false)
    }
  }

  const handleClearDatabase = async () => {
    if (!window.confirm("CAUTION: This will clear candidates, resumes, and rankings records. Continue?")) return
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/v1/copilot/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setSuccessMsg("Candidate and logs database successfully cleared.")
      } else {
        setErrorMsg("Failed to clear database.")
      }
    } catch (e) {
      setErrorMsg("Network connection error.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          System Settings <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20"><Settings className="w-4 h-4" /> Control Panel</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure user profiles, company preferences, security credentials, and data seeding options.</p>
      </div>

      {/* ALERTS */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-450 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-455 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* TABS CONTAINER */}
        <div className="w-full lg:w-56 bg-slate-950/30 border border-slate-900 p-4 rounded-2xl flex flex-row lg:flex-col gap-1 shrink-0 select-none">
          {[
            { id: 'profile', label: 'User Profile', icon: <User className="w-4.5 h-4.5" /> },
            { id: 'org', label: 'Organization', icon: <Building className="w-4.5 h-4.5" /> },
            { id: 'data', label: 'Data Management', icon: <Database className="w-4.5 h-4.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2.5 ${activeTab === tab.id ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-350'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* WORKSPACE SECTIONS */}
        <div className="flex-1 w-full glass-panel p-6 rounded-2xl border border-slate-800">
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-2">Profile Preferences</h3>
              
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full py-2.5 px-3.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">System Role</label>
                  <input
                    type="text"
                    disabled
                    value="Platform Administrator"
                    className="w-full py-2.5 px-3.5 rounded-xl glass-input text-xs opacity-50 select-none cursor-not-allowed"
                  />
                </div>
                <button
                  type="button"
                  className="px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'org' && (
            <div className="space-y-6 max-w-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-2">Organization Preferences</h3>
              
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Vortex AI Solutions"
                    className="w-full py-2.5 px-3.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Software Engineering"
                    className="w-full py-2.5 px-3.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <button
                  type="button"
                  className="px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Update Company Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-2">Database Telemetry & Management</h3>
              
              <div className="space-y-5 text-xs leading-relaxed max-w-xl">
                {/* Seed explanation */}
                <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850 flex gap-3.5 items-start">
                  <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-left">
                    <span className="font-bold text-xs text-white">Seed Demo Workspace Data</span>
                    <p className="text-slate-450 text-[10px]">Populates SQLite tables with mock engineering jobs (Fullstack, Data Science, DevOps) and 10 detailed profiles with vectors and rankings matching those requirements. Ideal for immediate presentation testing.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3.5">
                  <button
                    onClick={handleSeedDatabase}
                    disabled={loading}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Populates Demo Database
                  </button>
                  <button
                    onClick={handleClearDatabase}
                    disabled={loading}
                    className="px-5 py-3 bg-slate-900 border border-slate-805 hover:bg-rose-955/20 hover:border-rose-900/30 text-slate-350 hover:text-rose-400 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
                  >
                    <AlertTriangle className="w-4 h-4" /> Clear Candidate Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
