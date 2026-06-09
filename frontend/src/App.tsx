import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TalentRadarPage from './pages/TalentRadarPage'
import TalentIntake from './pages/TalentIntake'
import CandidateRankings from './pages/CandidateRankings'
import CandidateProfile from './pages/CandidateProfile'
import CandidateComparison from './pages/CandidateComparison'
import RecruiterCopilot from './pages/RecruiterCopilot'
import InterviewWarRoom from './pages/InterviewWarRoom'
import HiringAnalytics from './pages/HiringAnalytics'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('talentos_token') || sessionStorage.getItem('talentos_token')
  )
  const [user, setUser] = useState<any>(null)
  const [activeJobId, setActiveJobId] = useState<number | null>(null)
  const [jobs, setJobs] = useState<any[]>([])

  const saveToken = (newToken: string | null, rememberMe: boolean = false) => {
    if (newToken) {
      if (rememberMe) {
        localStorage.setItem('talentos_token', newToken)
        sessionStorage.removeItem('talentos_token')
      } else {
        sessionStorage.setItem('talentos_token', newToken)
        localStorage.removeItem('talentos_token')
      }
      setToken(newToken)
    } else {
      localStorage.removeItem('talentos_token')
      sessionStorage.removeItem('talentos_token')
      setToken(null)
      setUser(null)
    }
  }

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setUser(null)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        saveToken(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchJobs = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/v1/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
        if (data.length > 0 && !activeJobId) {
          setActiveJobId(data[0].id)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (token) {
      fetchJobs()
    }
  }, [token])

  const handleLogout = () => {
    saveToken(null)
  }

  // Auth Guards
  const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    if (!token) {
      return <Navigate to="/auth" replace />
    }
    if (user && !user.onboarding_completed) {
      return <Navigate to="/onboard" replace />
    }
    return <>{children}</>
  }

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage token={token} />} />

        {/* Auth (Login/Register) */}
        <Route path="/auth" element={
          token && user?.onboarding_completed ? <Navigate to="/dashboard" replace /> :
            token && !user?.onboarding_completed ? <Navigate to="/onboard" replace /> :
              <AuthPage setToken={saveToken} />
        } />

        {/* Onboarding Flow */}
        <Route path="/onboard" element={
          !token ? <Navigate to="/auth" replace /> :
            user?.onboarding_completed ? <Navigate to="/dashboard" replace /> :
              <OnboardingPage token={token} fetchUser={fetchUser} fetchJobs={fetchJobs} />
        } />

        {/* Authenticated Dashboard Shell */}
        <Route path="/*" element={
          <RequireAuth>
            <Layout
              user={user}
              jobs={jobs}
              activeJobId={activeJobId}
              setActiveJobId={setActiveJobId}
              handleLogout={handleLogout}
              fetchJobs={fetchJobs}
            >
              <Routes>
                <Route path="/dashboard" element={<Dashboard token={token} activeJobId={activeJobId} user={user} />} />
                <Route path="/radar" element={<TalentRadarPage token={token} activeJobId={activeJobId} />} />
                <Route path="/intake" element={<TalentIntake token={token} activeJobId={activeJobId} />} />
                <Route path="/rankings" element={<CandidateRankings token={token} activeJobId={activeJobId} />} />
                <Route path="/candidate/:id" element={<CandidateProfile token={token} activeJobId={activeJobId} />} />
                <Route path="/compare" element={<CandidateComparison token={token} activeJobId={activeJobId} />} />
                <Route path="/copilot" element={<RecruiterCopilot token={token} />} />
                <Route path="/interview" element={<InterviewRoom token={token} activeJobId={activeJobId} />} />
                <Route path="/analytics" element={<HiringAnalytics token={token} activeJobId={activeJobId} />} />
                <Route path="/settings" element={<SettingsPage token={token} fetchUser={fetchUser} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </RequireAuth>
        } />
      </Routes>
    </Router>
  )
}

// Temporary wrapper for Router resolution before InterviewWarRoom imports
function InterviewRoom({ token, activeJobId }: { token: string | null, activeJobId: number | null }) {
  return <InterviewWarRoom token={token} activeJobId={activeJobId} />
}
