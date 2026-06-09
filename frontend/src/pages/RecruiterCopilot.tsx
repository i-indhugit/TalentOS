import React, { useState, useEffect, useRef } from 'react'
import { 
  Bot, 
  Send, 
  Trash2, 
  Sparkles, 
  Terminal, 
  MessageSquare, 
  Code,
  HelpCircle,
  Copy,
  Check,
  Plus
} from 'lucide-react'

interface ChatMessageItem {
  sender: 'user' | 'copilot'
  message: string
}

export default function RecruiterCopilot({ token }: { token: string | null }) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const promptSuggestions = [
    "Who is the best candidate for the Senior Full Stack Engineer role?",
    "Which candidates know PyTorch?",
    "Show skill gaps for Rajesh Kumar.",
    "Generate interview questions for John Doe.",
    "Summarize top candidates for Senior Data Scientist."
  ]

  const fetchChatHistory = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/v1/copilot/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const list = await res.json()
        setMessages(list)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchChatHistory()
  }, [token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !token) return
    
    // Add user message locally
    setMessages(prev => [...prev, { sender: 'user', message: text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/copilot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      })
      if (res.ok) {
        const reply = await res.json()
        // Replace or append copilot response
        setMessages(prev => [...prev, { sender: 'copilot', message: reply.message }])
      } else {
        setMessages(prev => [...prev, { sender: 'copilot', message: "Sorry, I encountered an error processing your query. Please make sure the database is seeded." }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'copilot', message: "Network connection failed. Please ensure the backend server is running." }])
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (!token) return
    if (!window.confirm("Are you sure you want to clear chat history?")) return
    try {
      const res = await fetch('/api/v1/copilot/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setMessages([
          { sender: 'copilot', message: "Hello! I am your TalentOS Recruiter Copilot. Ask me questions about candidates, compare profiles, generate interview questions, or examine skill gaps. Let's find your next hire!" }
        ])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(idx)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-between text-left relative overflow-hidden select-text">
      {/* Absolute background effects */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] radial-glow-primary pointer-events-none rounded-full blur-[80px] opacity-20" />
      
      {/* Top Header bar */}
      <div className="pb-3 border-b border-slate-900 flex justify-between items-center shrink-0 z-10">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            Recruiter Copilot <span className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider py-1 px-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">AI Assistant</span>
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5">Ask questions about candidates, search skills, or draft interview plans.</p>
        </div>
        <button
          onClick={handleClearHistory}
          className="px-3.5 py-2 bg-slate-900 border border-slate-805 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 transition-all flex items-center gap-1.5 shadow-sm"
          title="Clear Chat Logs"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* CHAT BUBBLES WINDOW */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-5 pr-1 z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-10 py-16 space-y-4 max-w-md mx-auto text-slate-550">
            <Bot className="w-10 h-10 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-350">Conversation Workspace</h3>
            <p className="text-xs leading-relaxed">No chat logs recorded. Select a prompt shortcut below or type a custom question to initialize the copilot.</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isCopilot = msg.sender === 'copilot'
          return (
            <div 
              key={idx} 
              className={`flex items-start gap-4.5 max-w-[85%] ${isCopilot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
            >
              {/* Profile icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${isCopilot ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-slate-900 border-slate-805 text-slate-300'}`}>
                {isCopilot ? <Bot className="w-5 h-5" /> : <MessageSquare className="w-4.5 h-4.5" />}
              </div>

              {/* Message box */}
              <div className="relative group/msg">
                <div 
                  className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${isCopilot ? 'bg-slate-900/40 border border-slate-850/80 text-slate-300 backdrop-blur-sm' : 'bg-indigo-600 text-white shadow-lg'}`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.message}
                </div>

                {/* Copy helper */}
                {isCopilot && (
                  <button
                    onClick={() => handleCopyText(msg.message, idx)}
                    className="absolute -bottom-3 right-4 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 hover:text-white flex items-center gap-1 text-[9px] font-bold"
                  >
                    {copiedId === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Text
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-4.5 mr-auto">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-405 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* PROMPT SHORTCUT PANEL */}
      <div className="py-3 shrink-0 z-10 border-t border-slate-900/60 mt-2">
        <div className="flex items-center gap-1 px-1 mb-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550">Prompt Shortcuts</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSendMessage(prompt)}
              className="py-1.5 px-3 bg-slate-900/80 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-[10px] md:text-xs font-semibold rounded-xl text-left transition-all active:scale-98"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT WORKSPACE AREA */}
      <form 
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage(input)
        }}
        className="pt-2 shrink-0 z-10 flex gap-3 items-center"
      >
        <input
          type="text"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot about candidates (e.g. 'Who is the top fullstack candidate?')"
          className="flex-1 py-3 px-4 rounded-xl glass-input text-xs md:text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-550 disabled:bg-indigo-850 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 shrink-0"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  )
}
