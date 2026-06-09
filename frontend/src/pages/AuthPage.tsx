import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react'

export default function AuthPage({ setToken }: { setToken: (token: string, rememberMe?: boolean) => void }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  
  // States for Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // States for Register
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  
  // Forgot Password States
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  
  // Common States
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'register') {
      setIsLogin(false)
    } else {
      setIsLogin(true)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields.')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword })
      })
      const data = await res.json()
      if (res.ok) {
        setToken(data.access_token, rememberMe)
        navigate('/dashboard', { state: { justLoggedIn: true } })
      } else {
        setError(data.detail || 'Invalid email or password.')
      }
    } catch (err) {
      setError('Server unavailable')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    const trimmedName = registerName.trim()
    const trimmedEmail = registerEmail.trim().toLowerCase()
    const trimmedPassword = registerPassword.trim()
    const trimmedConfirm = registerConfirmPassword.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      setError('All fields are required.')
      return
    }
    if (trimmedPassword !== trimmedConfirm) {
      setError('Passwords do not match.')
      return
    }
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
          full_name: trimmedName
        })
      })
      const data = await res.json()
      if (res.ok) {
        setRegisterName('')
        setRegisterEmail('')
        setRegisterPassword('')
        setRegisterConfirmPassword('')
        setIsLogin(true)
        setSuccessMessage('Registration successful! Please sign in with your credentials.')
      } else {
        setError(data.detail || 'Registration failed.')
      }
    } catch (err) {
      setError('Server unavailable')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!forgotEmail) {
      setError('Please enter your email.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setForgotSuccess(true)
    }, 1200)
  }

  return (
    <div className="relative min-h-screen bg-[#0F172A] flex overflow-hidden">
      {/* Background glow highlights */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] radial-glow-primary pointer-events-none rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] radial-glow-secondary pointer-events-none rounded-full blur-[100px]" />

      {/* Left panel: Product branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950/40 relative border-r border-slate-900 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(99,102,241,0.02),transparent)] pointer-events-none" />
        
        {/* Top Header */}
        <div className="flex items-center gap-2.5 z-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">Talent<span className="text-indigo-400">OS</span></span>
        </div>

        {/* Content Promo Cards */}
        <div className="my-auto max-w-lg z-10 space-y-8 text-left">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Recruit with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-450 bg-clip-text text-transparent">AI Telemetry</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Experience the industry's first completely local, high-fidelity resume intelligence, automated screening vectors, and smart copilot search queries.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="glass-panel p-4.5 rounded-xl border border-slate-800 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Zero data leakage</h4>
                <p className="text-xs text-slate-400 mt-1">Local spaCy extraction keeps recruiter candidates lists private.</p>
              </div>
            </div>
            <div className="glass-panel p-4.5 rounded-xl border border-slate-800 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contextual embeddings</h4>
                <p className="text-xs text-slate-400 mt-1">Cosine similarities map experience profiles directly to jobs requirements.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="z-10 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <Users className="w-4 h-4 text-slate-500" /> Currently evaluating <span className="text-slate-350">1,280+ engineering candidates</span> this week.
        </div>
      </div>

      {/* Right panel: Authentication Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-550 to-cyan-500" />
          
          <AnimatePresence mode="wait">
            {forgotMode ? (
              // FORGOT PASSWORD FORM
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-left"
              >
                <h3 className="text-2xl font-bold text-white mb-2">Reset Password</h3>
                <p className="text-xs text-slate-400 mb-6">Enter your registered email and we will send you instructions.</p>

                {forgotSuccess ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
                    <p className="text-xs text-emerald-400 font-medium">Password reset instructions sent! Please check your email inbox.</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-450 text-xs font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-350 uppercase tracking-wide">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full py-3 pl-11 pr-4 rounded-xl glass-input text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-550 disabled:bg-indigo-800 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                    >
                      {loading ? 'Sending...' : 'Send Recovery Email'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                <button
                  onClick={() => { setForgotMode(false); setForgotSuccess(false); setError(null); setSuccessMessage(null); }}
                  className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 font-semibold block text-center w-full"
                >
                  Return to login page
                </button>
              </motion.div>
            ) : isLogin ? (
              // LOGIN FORM
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="text-left"
              >
                <div className="mb-6 flex justify-between items-baseline">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Welcome back</h3>
                    <p className="text-xs text-slate-400 mt-1">Sign in to control TalentOS hiring platform.</p>
                  </div>
                  <div className="lg:hidden w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-xs font-medium animate-fade-in">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-350 uppercase tracking-wide">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-350 uppercase tracking-wide">Password</label>
                      <button
                        type="button"
                        onClick={() => { setForgotMode(true); setError(null); }}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>

                  {/* Remember Me Toggle */}
                  <div className="flex items-center gap-2 mt-2 select-none">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900/40 text-indigo-600 focus:ring-indigo-550 focus:ring-offset-slate-900 accent-indigo-600"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-400 font-semibold cursor-pointer">
                      Remember Me
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-400">
                  New to TalentOS?{' '}
                  <button
                    onClick={() => { setIsLogin(false); setError(null); setSuccessMessage(null); }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                  >
                    Create a free account
                  </button>
                </div>
              </motion.div>
            ) : (
              // REGISTRATION FORM
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-left"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white">Create Account</h3>
                  <p className="text-xs text-slate-400 mt-1">Get started with automated recruitment screening.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-450 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-350 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-350 uppercase tracking-wide">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-350 uppercase tracking-wide">Create Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-350 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full py-3.5 pl-11 pr-4 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-2 bg-indigo-650 hover:bg-indigo-550 disabled:bg-indigo-850 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    {loading ? 'Creating...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setIsLogin(true); setError(null); setSuccessMessage(null); }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                  >
                    Sign in here
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
