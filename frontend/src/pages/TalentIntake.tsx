import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileCheck, 
  UploadCloud, 
  File, 
  Check, 
  AlertCircle, 
  X, 
  Sparkles,
  Clipboard,
  Send,
  Loader,
  ArrowUpRight
} from 'lucide-react'

interface UploadFileItem {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'parsing' | 'success' | 'error'
  errorMsg?: string
  extractedCandId?: number
  extractedName?: string
}

export default function TalentIntake({ 
  token, 
  activeJobId 
}: { 
  token: string | null, 
  activeJobId: number | null 
}) {
  const [files, setFiles] = useState<UploadFileItem[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Quick paste states
  const [pasteName, setPasteName] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [pasting, setPasting] = useState(false)
  const [pasteSuccess, setPasteSuccess] = useState<any>(null)
  const [pasteError, setPasteError] = useState<string | null>(null)

  // Session ingested candidates and toast notifications
  const [ingestedCandidates, setIngestedCandidates] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (incomingFiles: File[]) => {
    const validTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
      "text/plain"
    ]
    
    const newItems: UploadFileItem[] = incomingFiles.map(file => {
      const isValid = validTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.txt')
      return {
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: isValid ? 'uploading' : 'error',
        errorMsg: isValid ? undefined : 'Unsupported format. Use PDF, DOCX, or TXT.'
      }
    })

    setFiles(prev => [...prev, ...newItems])
    
    // Trigger upload pipeline for valid files
    newItems.forEach(item => {
      if (item.status === 'uploading') {
        uploadFile(item)
      }
    })
  }

  const uploadFile = async (item: UploadFileItem) => {
    // 1. Simulate upload progress
    let prog = 0
    const interval = setInterval(() => {
      prog += 15
      if (prog >= 100) {
        clearInterval(interval)
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress: 100, status: 'parsing' } : f))
        // Add optimistic placeholder card
        addOptimisticPlaceholder(item.id, item.file.name.replace(/\.[^/.]+$/, ""))
        // 2. Perform actual server upload after upload progress completes
        sendToServer(item)
      } else {
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress: prog } : f))
      }
    }, 150)
  }

  const addOptimisticPlaceholder = (id: string, name: string) => {
    const placeholder = {
      id,
      name,
      status: 'parsing',
      isOptimistic: true,
      candidate: { 
        name, 
        current_title: "Extracting resume details...", 
        summary: "Running NLP entity extractors to map skills, work tenure, alma maters, and DNA metrics..." 
      },
      ranking: null,
      rank: null,
      skills: []
    }
    setIngestedCandidates(prev => [placeholder, ...prev])
  }

  const resolveParsedCandidate = async (tempId: string, candidateData: any) => {
    if (!token) return
    try {
      // 1. Fetch ranking details to get active alignment metrics & positioning
      const q = activeJobId ? `?job_id=${activeJobId}` : ''
      const rankingsRes = await fetch(`/api/v1/rankings${q}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      let rankingInfo = null
      let rankPosition = null
      let totalPool = 0
      
      if (rankingsRes.ok) {
        const rankingsList = await rankingsRes.json()
        totalPool = rankingsList.length
        const candidateRankIndex = rankingsList.findIndex((r: any) => r.candidate_id === candidateData.id)
        if (candidateRankIndex !== -1) {
          rankingInfo = rankingsList[candidateRankIndex]
          rankPosition = candidateRankIndex + 1
        }
      }

      // 2. Fetch candidate skills list directly from association table
      const skillsRes = await fetch(`/api/v1/candidates/${candidateData.id}/skills`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      let candidateSkills = []
      if (skillsRes.ok) {
        candidateSkills = await skillsRes.json()
      }

      const resolved = {
        id: candidateData.id,
        name: candidateData.name,
        status: 'success',
        isOptimistic: false,
        candidate: candidateData,
        ranking: rankingInfo,
        rank: rankPosition,
        totalPool,
        skills: candidateSkills
      }

      setIngestedCandidates(prev => {
        const filtered = prev.filter(c => c.id !== tempId && c.id !== candidateData.id)
        return [resolved, ...filtered]
      })

      // Trigger success toast
      if (candidateData.is_duplicate) {
        setToast({
          message: "This candidate already exists. Existing profile has been updated.",
          type: 'success'
        })
      } else {
        setToast({
          message: `Successfully ingested ${candidateData.name}! alignment: ${rankingInfo ? Math.round(rankingInfo.overall_score) : 0}%, Rank #${rankPosition || 'N/A'}.`,
          type: 'success'
        })
      }
      setTimeout(() => setToast(null), 5000)

    } catch (e) {
      console.error(e)
      removePlaceholder(tempId, "Ingested, but ranking evaluation failed.")
    }
  }

  const removePlaceholder = (tempId: string, errorMsg?: string) => {
    setIngestedCandidates(prev => prev.filter(c => c.id !== tempId))
    if (errorMsg) {
      setToast({ message: errorMsg, type: 'error' })
      setTimeout(() => setToast(null), 5000)
    }
  }

  const sendToServer = async (item: UploadFileItem) => {
    if (!token) return
    const formData = new FormData()
    formData.append('file', item.file)

    try {
      const q = activeJobId ? `?job_id=${activeJobId}` : ''
      const res = await fetch(`/api/v1/candidates/upload${q}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setFiles(prev => prev.map(f => f.id === item.id ? { 
          ...f, 
          status: 'success', 
          extractedCandId: data.id,
          extractedName: data.name
        } : f))
        await resolveParsedCandidate(item.id, data)
      } else {
        setFiles(prev => prev.map(f => f.id === item.id ? { 
          ...f, 
          status: 'error', 
          errorMsg: data.detail || 'Parser extraction failed.' 
        } : f))
        removePlaceholder(item.id, data.detail || 'Parser extraction failed.')
      }
    } catch (e) {
      setFiles(prev => prev.map(f => f.id === item.id ? { 
        ...f, 
        status: 'error', 
        errorMsg: 'Network link failed.' 
      } : f))
      removePlaceholder(item.id, 'Network link failed.')
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  // Handle manual resume text pasting for rapid developer testing
  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasteError(null)
    setPasteSuccess(null)
    if (!pasteName.trim() || !pasteText.trim()) {
      setPasteError("Please fill in candidate name and paste resume text.")
      return
    }

    setPasting(true)
    const tempId = Math.random().toString(36).substring(7)
    addOptimisticPlaceholder(tempId, pasteName)

    try {
      // Build a simulated file blob
      const blob = new Blob([pasteText], { type: 'text/plain' })
      const simulatedFile = new (window as any).File([blob], `${pasteName.replace(/\s+/g, '_')}_Resume.txt`, { type: 'text/plain' })
      
      const formData = new FormData()
      formData.append('file', simulatedFile)
      
      const q = activeJobId ? `?job_id=${activeJobId}` : ''
      const res = await fetch(`/api/v1/candidates/upload${q}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setPasteSuccess(data)
        setPasteName('')
        setPasteText('')
        await resolveParsedCandidate(tempId, data)
      } else {
        setPasteError(data.detail || "Simulated parsing failed.")
        removePlaceholder(tempId, data.detail || "Simulated parsing failed.")
      }
    } catch (err) {
      setPasteError("Failed to communicate with parsing backend.")
      removePlaceholder(tempId, "Failed to communicate with parsing backend.")
    } finally {
      setPasting(false)
    }
  }

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Toast Notification overlay */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-5 duration-350 ${toast.type === 'success' ? 'bg-slate-900/95 border-emerald-500/30 text-emerald-400' : 'bg-slate-900/95 border-rose-500/30 text-rose-400'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
            {toast.type === 'success' ? <Check className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
          </div>
          <div className="text-xs font-semibold pr-4 text-slate-200">{toast.message}</div>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          Talent Intake <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">Data Ingestion</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Upload resumes in bulk. The parser extracts profiles and computes similarity matching automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Drag area */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`glass-panel border-2 border-dashed p-10 rounded-2xl flex flex-col items-center justify-center text-center transition-all relative select-none cursor-pointer ${dragActive ? 'border-indigo-500 bg-indigo-550/5' : 'border-slate-800 hover:border-slate-700'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-400 transition-colors shadow-lg">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Drag & drop resume files here</h3>
            <p className="text-[10px] text-slate-550 mb-4">PDF, DOCX, or TXT file formats up to 8MB</p>
            <button 
              type="button"
              className="px-4.5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs rounded-xl transition-all shadow-md"
            >
              Browse Files
            </button>
          </div>

          {/* Files List panel */}
          {files.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-indigo-405" /> Ingestion Status Feed</h3>
              
              <div className="divide-y divide-slate-850/60 max-h-72 overflow-y-auto pr-1 no-scrollbar space-y-3">
                {files.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 truncate max-w-[65%]">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        <File className="w-4.5 h-4.5 text-slate-450" />
                      </div>
                      <div className="truncate text-xs">
                        <span className="font-semibold text-slate-200 block truncate">{item.file.name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">{(item.file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Upload status markers */}
                      {item.status === 'uploading' && (
                        <div className="w-24 text-right">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                            <span>UPLOADING</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      )}
                      
                      {item.status === 'parsing' && (
                        <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                          <Loader className="w-3.5 h-3.5 animate-spin" /> NLP Extracting...
                        </span>
                      )}

                      {item.status === 'success' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Parsed
                          </span>
                          <button
                            onClick={() => removeFile(item.id)}
                            className="text-slate-500 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {item.status === 'error' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-rose-455 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded flex items-center gap-0.5" title={item.errorMsg}>
                            <AlertCircle className="w-3 h-3" /> Error
                          </span>
                          <button
                            onClick={() => removeFile(item.id)}
                            className="text-slate-500 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copy Paste testing workspace */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clipboard className="w-4 h-4 text-indigo-400" /> Interactive Quick Paste</h3>
              <p className="text-[10px] text-slate-500 mb-4">Paste raw text directly to test parser accuracy instantly.</p>
              
              {pasteError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4 text-rose-400 text-xs font-medium">
                  {pasteError}
                </div>
              )}
              {pasteSuccess && (
                <div className="p-4.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 text-emerald-400 text-xs leading-relaxed space-y-1 text-left">
                  <span className="font-bold block text-white">✓ Candidate successfully ingested!</span>
                  <span>Name: <b>{pasteSuccess.name}</b></span><br/>
                  <span>Phone: <b>{pasteSuccess.phone || 'None'}</b></span><br/>
                  <span>XP: <b>{pasteSuccess.experience_years} Years</b></span>
                  <span className="block mt-2 text-[10px] text-slate-400">Match score is calculated and listed in Rankings.</span>
                </div>
              )}

              <form onSubmit={handlePasteSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Candidate Name</label>
                  <input
                    type="text"
                    value={pasteName}
                    onChange={(e) => setPasteName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Resume Text Profile</label>
                  <textarea
                    rows={8}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste resume content here... Include experience details, education history, and technical skills like React, PyTorch, Node.js..."
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pasting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  {pasting ? 'Parsing...' : 'Analyze pasted profile'} <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
            
            <div className="text-[9px] text-slate-550 leading-relaxed border-t border-slate-850 pt-4 mt-6">
              * Note: pasting profile is analyzed using our local spaCy rules engine, matching it automatically against your active job profiles.
            </div>
          </div>
        </div>
      </div>

      {/* Ingested Candidates section */}
      {ingestedCandidates.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Extracted Ingested Profiles ({ingestedCandidates.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Workspace Telemetry Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ingestedCandidates.map((item) => {
              const isParsing = item.status === 'parsing'
              const cand = item.candidate
              const rank = item.ranking

              if (isParsing) {
                return (
                  <div 
                    key={item.id} 
                    className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between min-h-[220px] animate-pulse text-left relative"
                  >
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-800" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-850 flex items-center justify-center border border-slate-800">
                          <Loader className="w-5 h-5 text-indigo-500 animate-spin" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-800 rounded w-1/3" />
                          <div className="h-3 bg-slate-800 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2.5 pt-2">
                        <div className="h-3 bg-slate-800 rounded w-full" />
                        <div className="h-3 bg-slate-800 rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div 
                  key={item.id} 
                  className="glass-panel p-6 rounded-2xl border border-slate-850 hover:border-slate-750 transition-all flex flex-col justify-between min-h-[220px] relative group text-left"
                >
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-indigo-400 text-sm">
                          {cand.name[0]}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-white">{cand.name}</h4>
                          <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{cand.current_title || 'Software Engineer'}</span>
                        </div>
                      </div>
                      
                      {rank && (
                        <div className="text-right">
                          <span className="text-2xl font-black text-indigo-400 block leading-none">{Math.round(rank.overall_score)}%</span>
                          <span className="text-[8px] text-slate-550 block font-bold uppercase tracking-wider mt-1">ALIGNMENT</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-350 leading-relaxed">
                      <b>AI Profile Analysis:</b> {cand.summary.substring(0, 160)}...
                    </div>

                    {/* Extracted credentials details */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-slate-850/40">
                      <div>XP Tenure: <span className="text-slate-300">{cand.experience_years} Years</span></div>
                      <div>Education: <span className="text-slate-300 truncate block max-w-[150px]" title={cand.education}>{cand.education || 'Not Mapped'}</span></div>
                      <div>Rank Status: <span className="text-indigo-400">#{item.rank || 'N/A'} of {item.totalPool}</span></div>
                      <div>Retention Risk: <span className={`${cand.risk_level === 'High' ? 'text-rose-400' : cand.risk_level === 'Medium' ? 'text-amber-450' : 'text-emerald-450'}`}>{cand.risk_level} Risk</span></div>
                    </div>

                    {/* Extracted Skills badges */}
                    {item.skills && item.skills.length > 0 && (
                      <div className="pt-2.5 border-t border-slate-850/40 space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block">Extracted Skill Taxonomies</span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.skills.slice(0, 6).map((s: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold">
                              {s.skill_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-850 pt-4 flex justify-between items-center shrink-0">
                    <span className="text-[9px] text-slate-550 font-bold uppercase tracking-widest">Persisted to SQLite DB</span>
                    <Link 
                      to={`/candidate/${cand.id}`}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-650 border border-slate-800 hover:border-indigo-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95"
                    >
                      View Profile <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
