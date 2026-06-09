import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  Cpu, 
  Layers, 
  BarChart3, 
  Users, 
  Sparkles, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ArrowRight,
  TrendingUp,
  FileCheck,
  Zap,
  Globe,
  ShieldCheck,
  Star
} from 'lucide-react'

export default function LandingPage({ token }: { token: string | null }) {
  const navigate = useNavigate()
  const [isAnnual, setIsAnnual] = useState(true)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const features = [
    {
      icon: <Bot className="w-6 h-6 text-indigo-400" />,
      title: "Recruiter Copilot",
      desc: "An intelligent AI partner built right into your workflow. Get answers about candidates, skill gaps, or generate custom interview plans in seconds."
    },
    {
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
      title: "Resume Intelligence",
      desc: "Extract detailed parameters like skills, work history, projects, and education with granular confidence tracking and profile structured mapping."
    },
    {
      icon: <Layers className="w-6 h-6 text-purple-400" />,
      title: "Semantic Match Engine",
      desc: "Our model understands context, not just keywords. Compute similarity scores based on skills, projects, and experience requirements."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
      title: "Talent Analytics",
      desc: "Get deep macro-level recruiting insights. View candidate experience distribution, university hubs, and real-time hiring funnel velocity."
    },
    {
      icon: <Users className="w-6 h-6 text-pink-400" />,
      title: "Candidate Rankings",
      desc: "A centralized command dashboard that lists applicants sorted by AI alignment. Break down scoring into skills, education, and projects."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      title: "Skill Gap Analysis",
      desc: "Direct overlap matrices showing required vs. matched vs. missing skills, offering direct suggestions to close candidate gaps."
    }
  ]

  const steps = [
    {
      num: "01",
      title: "Upload Resumes",
      desc: "Drag and drop bulk PDF or DOCX files. Our parser processes multiple documents simultaneously."
    },
    {
      num: "02",
      title: "AI Parsing & Analysis",
      desc: "Extract text, classify technical skills, and analyze candidate risk levels using specialized local models."
    },
    {
      num: "03",
      title: "Semantic Matching",
      desc: "Compare candidates to job requirements dynamically, generating high-fidelity weighted match percentages."
    },
    {
      num: "04",
      title: "Hire Instantly",
      desc: "Use the Recruiter Copilot to instantly shortlist high-potential talent and start tailored interviewing."
    }
  ]

  const pricing = [
    {
      name: "Starter",
      price: isAnnual ? "79" : "99",
      desc: "Ideal for growing teams looking to accelerate their screening process.",
      features: [
        "Up to 100 Resume Uploads / mo",
        "5 Active Job Profiles",
        "Basic Semantic Match Engine",
        "Standard Recruiter Copilot",
        "CSV Data Export"
      ],
      popular: false,
      cta: "Start Free Trial",
      color: "border-slate-800"
    },
    {
      name: "Professional",
      price: isAnnual ? "199" : "249",
      desc: "Built for scaling startups and active staffing agencies.",
      features: [
        "Up to 1,000 Resume Uploads / mo",
        "25 Active Job Profiles",
        "Advanced Core NLP Semantic Engine",
        "Premium Recruiter Copilot with SQL-search",
        "High-Fidelity Candidate DNA Insights",
        "Tailored Interview Generation"
      ],
      popular: true,
      cta: "Get Started Now",
      color: "border-indigo-500/50"
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "Tailored solutions for high-volume enterprise hiring teams.",
      features: [
        "Unlimited Resume Uploads",
        "Unlimited Active Job Profiles",
        "Custom Weights & Advanced Matching Tuning",
        "Dedicated Custom Local LLM & AI instances",
        "HRIS Integrations (Workday, Greenhouse)",
        "Dedicated Talent Support Architect"
      ],
      popular: false,
      cta: "Schedule Enterprise Demo",
      color: "border-slate-800"
    }
  ]

  const faqs = [
    {
      q: "How does the Semantic Matching Engine calculate candidates' scores?",
      a: "Rather than doing simple keyword matching, TalentOS uses sentence embedding vectors (using the sentence-transformers model) to compute cosine similarities. The overall score is calculated as a weighted average: Skills Match (50%), Experience Match (25%), Education Match (15%), and Projects Match (10%)."
    },
    {
      q: "Can I customize the weights used for candidate matching?",
      a: "Yes! In the dashboard, you can alter the requirements, experience limits, and skills required for each job profile. The matching engine automatically recalculates and ranks candidates instantly based on your adjustments."
    },
    {
      q: "Is candidate data stored securely on TalentOS?",
      a: "Absolutely. All resume parsing, databases, and semantic models run inside a secure sandbox. We use local state models and SQLite database storage, meaning your sensitive hiring database is never sold or used for training public third-party models."
    },
    {
      q: "What file formats does TalentOS support?",
      a: "Currently, TalentOS supports raw resume uploads in PDF and DOCX (Word Document) formats, as well as text copy-pasting for quick interactive testing."
    }
  ]

  const testimonials = [
    {
      quote: "TalentOS completely changed our staffing agency's throughput. We went from reviewing resumes for hours to immediately interviewing high-potential candidates flagged by the copilot.",
      author: "Sarah Jenkins",
      role: "VP of Talent, TechFlow Solutions",
      rating: 5
    },
    {
      quote: "The Skill Gap Analysis is pure magic. Seeing a radar graph comparing what a candidate knows vs what our tech leads require helps us avoid hiring mistakes before we even schedule technical rounds.",
      author: "Marcus Chen",
      role: "Head of Engineering, Veloce AI",
      rating: 5
    },
    {
      quote: "The interface is gorgeous, fast, and feels like tools developers love to use. It's like Linear and Cursor combined for recruitment. Highly recommended.",
      author: "Elena Rostova",
      role: "Founder, Zenith HR",
      rating: 5
    }
  ]

  return (
    <div className="relative min-h-screen bg-[#0F172A] overflow-hidden">
      {/* Background glow highlights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] radial-glow-primary pointer-events-none rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] radial-glow-secondary pointer-events-none rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] radial-glow-accent pointer-events-none rounded-full blur-[100px]" />

      {/* Header / Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Talent<span className="text-indigo-400">OS</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-4">
          {token ? (
            <Link 
              to="/dashboard" 
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800/80 rounded-lg hover:bg-slate-700/80 border border-slate-700 transition-all shadow-md"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
              <Link 
                to="/auth?tab=register" 
                className="px-4.5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center gap-1.5"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Recruitment platform
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6"
        >
          The Operating System for <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-glow">Intelligent Hiring</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Transform resumes into hiring intelligence. Instantly parse profiles, rank alignment using semantic modeling, and unlock talent with our local recruiter copilot.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <button 
            onClick={() => navigate(token ? '/dashboard' : '/auth?tab=register')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 group"
          >
            Start Recruiting Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a 
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 text-slate-200 font-semibold rounded-xl hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            See How it Works
          </a>
        </motion.div>

        {/* Product Mockup Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 rounded-2xl pointer-events-none" />
          <div className="flex items-center gap-2 pb-3.5 border-b border-slate-800">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <div className="h-4.5 px-6 ml-4 bg-slate-850 rounded text-[10px] text-slate-500 font-medium flex items-center border border-slate-800">
              https://talentos.app/dashboard
            </div>
          </div>
          
          <div className="relative mt-4 aspect-[16/10] bg-[#0b0f19] rounded-xl overflow-hidden border border-slate-800/80 flex">
            {/* Mock layout side menu */}
            <div className="w-48 bg-slate-950/70 border-r border-slate-800/80 p-4 flex flex-col gap-6 text-left">
              <div className="flex items-center gap-2 px-1">
                <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-white" /></div>
                <span className="font-bold text-xs text-white">TalentOS</span>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="h-7 bg-indigo-500/10 border border-indigo-500/20 rounded flex items-center px-2.5 text-xs text-indigo-400 font-semibold gap-2"><Layers className="w-3.5 h-3.5" /> Command Center</div>
                <div className="h-7 rounded flex items-center px-2.5 text-xs text-slate-500 gap-2"><FileCheck className="w-3.5 h-3.5" /> Intake Panel</div>
                <div className="h-7 rounded flex items-center px-2.5 text-xs text-slate-500 gap-2"><Users className="w-3.5 h-3.5" /> Candidates</div>
                <div className="h-7 rounded flex items-center px-2.5 text-xs text-slate-500 gap-2"><Bot className="w-3.5 h-3.5" /> Recruiter Copilot</div>
                <div className="h-7 rounded flex items-center px-2.5 text-xs text-slate-500 gap-2"><BarChart3 className="w-3.5 h-3.5" /> Analytics</div>
              </div>
            </div>
            
            {/* Mock Dashboard Workspace */}
            <div className="flex-1 p-6 text-left flex flex-col gap-6 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Command Center Overview</h3>
                  <p className="text-xs text-slate-500">Live AI recruiting telemetry and matchmaking status.</p>
                </div>
                <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 flex items-center gap-2">
                  Active Position: <span className="text-indigo-400">Senior Staff AI Engineer</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Evaluated</span>
                  <span className="text-2xl font-bold text-white mt-2">128</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1"><TrendingUp className="w-3 h-3" /> +18.4% this week</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Average Match</span>
                  <span className="text-2xl font-bold text-white mt-2">81.4%</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full" style={{ width: '81.4%' }} />
                  </div>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Top Talent Candidate</span>
                  <span className="text-sm font-semibold text-white mt-2 truncate">Alex Rivera</span>
                  <span className="text-xs font-bold text-indigo-400 mt-1">94.8% Match</span>
                </div>
              </div>

              {/* List component mockup */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
                <span className="text-xs text-white font-bold block mb-3">Top Matching Shortlist</span>
                <div className="flex flex-col gap-2.5">
                  {[
                    { name: "Alex Rivera", role: "AI Research Scientist", score: "94.8%", match: "indigo", exp: "8 years", edu: "Stanford MS" },
                    { name: "Sophia Martinez", role: "Lead Machine Learning Lead", score: "91.2%", match: "purple", exp: "6 years", edu: "MIT PhD" },
                    { name: "Jordan K.", role: "Staff Engineer (AI Platform)", score: "88.6%", match: "cyan", exp: "9 years", edu: "UC Berkeley BS" }
                  ].map((cand, i) => (
                    <div key={i} className="bg-slate-950/60 border border-slate-850 p-3 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">{cand.name[0]}</div>
                        <div>
                          <div className="font-semibold text-slate-200">{cand.name}</div>
                          <div className="text-[10px] text-slate-500">{cand.role} • {cand.exp}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-850">{cand.edu}</span>
                        <div className="text-right">
                          <span className={`text-[11px] font-bold ${cand.match === 'indigo' ? 'text-indigo-400' : cand.match === 'purple' ? 'text-purple-400' : 'text-cyan-400'}`}>{cand.score}</span>
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Match</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By logos */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-slate-800/40">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8">Empowering next-gen teams globally</p>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-30 grayscale hover:opacity-40 transition-opacity">
          <div className="text-lg font-bold text-white tracking-widest flex items-center gap-1.5"><Globe className="w-5 h-5" /> ACME LABS</div>
          <div className="text-lg font-bold text-white tracking-widest flex items-center gap-1.5"><Zap className="w-5 h-5" /> KINETIC</div>
          <div className="text-lg font-bold text-white tracking-widest flex items-center gap-1.5"><ShieldCheck className="w-5 h-5" /> SECURE_LY</div>
          <div className="text-lg font-bold text-white tracking-widest flex items-center gap-1.5"><Layers className="w-5 h-5" /> MATRIX.AI</div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/40">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Everything you need to hire at <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">warp speed</span></h2>
          <p className="text-slate-400">Our suite of modules operates seamlessly together to parse, score, analyze, and communicate candidate qualities.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works timeline */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/40">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Four steps to <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">talent alignment</span></h2>
          <p className="text-slate-400">We make pipeline intake completely frictionless for recruiters and talent leads.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col gap-4 text-left">
              <div className="text-4xl font-black bg-gradient-to-br from-indigo-500/20 to-purple-500/0 bg-clip-text text-transparent text-slate-800/40 border-b border-slate-800/80 pb-3 flex justify-between items-end">
                <span>{step.num}</span>
                <Sparkles className="w-4 h-4 text-indigo-500/30" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mt-2">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/40">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Loved by <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Recruiters</span></h2>
          <p className="text-slate-400">Hear how TalentOS enables teams to optimize screening workflows and fill complex tech positions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col justify-between text-left relative">
              <div className="absolute top-6 right-6 flex gap-1">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic leading-relaxed mb-6 mt-4">"{test.quote}"</p>
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-800/60">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-sm">{test.author[0]}</div>
                <div>
                  <h4 className="text-xs font-bold text-white">{test.author}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/40 text-center">
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Simple, transparent <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">pricing plans</span></h2>
          <p className="text-slate-400 mb-8">Save up to 20% with annual plans.</p>
          
          <div className="inline-flex items-center gap-2.5 p-1 bg-slate-900 border border-slate-800 rounded-full">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`px-4.5 py-1.5 rounded-full text-xs font-semibold transition-all ${!isAnnual ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Monthly billing
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`px-4.5 py-1.5 rounded-full text-xs font-semibold transition-all ${isAnnual ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Annual billing (-20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          {pricing.map((plan, idx) => (
            <div 
              key={idx} 
              className={`glass-panel p-8 rounded-2xl flex flex-col justify-between border-t-2 relative ${plan.popular ? 'border-t-indigo-500 shadow-indigo-500/5' : plan.color}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-600 text-white tracking-widest shadow-md">Popular</span>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed min-h-[36px]">{plan.desc}</p>
                <div className="my-6 flex items-baseline gap-1">
                  {plan.price !== "Custom" && <span className="text-sm font-semibold text-slate-500">$</span>}
                  <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-xs font-medium text-slate-500 ml-1">/ month</span>}
                </div>
                
                <div className="flex flex-col gap-3.5 mb-8 border-t border-slate-800/60 pt-6">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => navigate(token ? '/dashboard' : '/auth?tab=register')}
                className={`w-full py-3 text-xs font-bold rounded-xl transition-all ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750'}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ accordion */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-24 border-t border-slate-800/40">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center text-white mb-12">Frequently Asked <span className="text-indigo-400">Questions</span></h2>
        
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between text-slate-200 hover:text-white transition-colors"
              >
                <span className="font-semibold text-sm md:text-base flex items-center gap-2.5"><HelpCircle className="w-4.5 h-4.5 text-indigo-400" /> {faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-5 pt-1 text-slate-400 text-xs md:text-sm leading-relaxed border-t border-slate-800/40">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-[#070a14] border-t border-slate-900 py-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center"><Sparkles className="w-4.5 h-4.5 text-white" /></div>
              <span className="font-extrabold text-lg tracking-tight text-white">Talent<span className="text-indigo-400">OS</span></span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              TalentOS — The Operating System for Intelligent Hiring. Building the future of enterprise recruitment automation and candidate parsing.
            </p>
            <div className="text-[10px] text-slate-600 mt-4">
              © {new Date().getFullYear()} TalentOS Inc. All rights reserved. Registered patents pending.
            </div>
          </div>
          
          <div className="flex flex-col gap-3.5 text-left">
            <span className="font-bold text-white text-xs uppercase tracking-wider">Product</span>
            <a href="#features" className="hover:text-slate-350 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-350 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-slate-350 transition-colors">Pricing</a>
            <a href="#" className="hover:text-slate-350 transition-colors">API Docs</a>
          </div>

          <div className="flex flex-col gap-3.5 text-left">
            <span className="font-bold text-white text-xs uppercase tracking-wider">Resources</span>
            <a href="#" className="hover:text-slate-350 transition-colors">Hiring Guide</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Documentation</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Case Studies</a>
            <a href="#" className="hover:text-slate-350 transition-colors">System Status</a>
          </div>

          <div className="flex flex-col gap-3.5 text-left">
            <span className="font-bold text-white text-xs uppercase tracking-wider">Legal</span>
            <a href="#" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-350 transition-colors">GDPR & Compliance</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Security Overview</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
