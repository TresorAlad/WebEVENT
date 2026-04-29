import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)
  const navigate = useNavigate()
  const { login, logout, user, dbUser, loading } = useAuth()

  useEffect(() => {
    if (!loading && user && dbUser?.role === 'ADMIN') {
      navigate('/dashboard')
    }
  }, [loading, user, dbUser, navigate])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('Veuillez utiliser la connexion Google.')
  }

  const handleGoogleLogin = async () => {
    setErrorMsg(null)
    setSigningIn(true)
    try {
      const syncedUser = await login()

      if (syncedUser?.role === 'ADMIN') {
        navigate('/dashboard')
        return
      }

      if (syncedUser && syncedUser.role !== 'ADMIN') {
        setErrorMsg("Accès refusé : ce compte n'est pas administrateur.")
      } else {
        setErrorMsg("Connexion réussie, mais synchronisation serveur échouée. Vérifiez VITE_API_URL et la config Firebase Admin du backend.")
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error)
      
      let message = 'Échec de la connexion Google.'
      
      if (error.code === 'auth/popup-blocked') {
        message = 'Le popup a été bloqué par votre navigateur.'
      } else if (error.code === 'auth/unauthorized-domain') {
        message = 'Ce domaine n\'est pas autorisé dans la console Firebase.'
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'La connexion Google n\'est pas activée sur Firebase.'
      } else if (error?.response?.data?.message) {
        message = `API: ${error.response.data.message}`
      } else if (error.message) {
        message = `Erreur: ${error.message}`
      }
      
      setErrorMsg(message)
    } finally {
      setSigningIn(false)
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

        {errorMsg && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
          }}>
            <AlertCircle size={16} />
            <p>{errorMsg}</p>
          </div>
        )}

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
          disabled={signingIn || loading}
          type="button"
          className="btn btn-outline login-btn" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: signingIn || loading ? 0.6 : 1 }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
          {signingIn || loading ? 'Connexion en cours...' : 'Sign in with Google'}
        </button>

        {user && !loading && dbUser && dbUser.role !== 'ADMIN' && (
          <div style={{ marginTop: '20px', color: '#b91c1c' }}>
            <p>Accès refusé : ce compte n'est pas administrateur.</p>
            <button
              type="button"
              onClick={logout}
              className="btn btn-secondary"
              style={{ marginTop: '10px' }}
            >
              Se déconnecter
            </button>
          </div>
        )}

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
