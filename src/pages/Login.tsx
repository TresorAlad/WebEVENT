import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login, user } = useAuth()

  if (user) {
    navigate('/dashboard')
    return null
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login
    localStorage.setItem('eh_auth', 'true')
    navigate('/dashboard')
  }

  const handleGoogleLogin = async () => {
    try {
      await login()
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      alert('Google login failed')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.png" alt="EventHub" className="login-logo" />
          <h1 className="login-title">EventHub</h1>
          <p className="login-subtitle">SUPER ADMIN DASHBOARD</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={16} />
              <input
                type="email"
                className="input"
                placeholder="admin@eventhub.tg"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={16} />
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            Connect to Console
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="divider" style={{ margin: '20px 0', textAlign: 'center', color: '#889' }}>
          <span>OR</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="btn btn-outline login-btn" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
          Sign in with Google
        </button>

        <div className="login-footer">
          <p>© 2026 EventHub Togo. All rights reserved.</p>
          <p className="text-xs">Secure Admin Access Only</p>
        </div>
      </div>

      <div className="login-bg-decoration">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  )
}
