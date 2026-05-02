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
      } else if (error?.message === 'Network Error') {
        message = 'Backend injoignable. Vérifiez que le serveur tourne sur VITE_API_URL et que CORS est bien configuré.'
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
          <div className="alert-danger" role="alert">
            <AlertCircle size={16} aria-hidden />
            <p>{errorMsg}</p>
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Adresse e-mail</label>
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
            <label className="label">Mot de passe</label>
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
            Connexion à la console
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="login-or-divider">
          <span>OU</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={signingIn || loading}
          type="button"
          className="btn btn-outline login-btn login-google-btn w-full flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
          {signingIn || loading ? 'Connexion en cours...' : 'Connexion avec Google'}
        </button>

        {user && !loading && dbUser && dbUser.role !== 'ADMIN' && (
          <div className="login-access-denied">
            <p>Accès refusé : ce compte n'est pas administrateur.</p>
            <button
              type="button"
              onClick={logout}
              className="btn btn-secondary mt-3"
            >
              Se déconnecter
            </button>
          </div>
        )}

        <div className="login-footer">
          <p>© 2026 EventHub Togo. Tous droits réservés.</p>
          <p className="text-xs">Accès administrateur sécurisé uniquement</p>
        </div>
      </div>

      <div className="login-bg-decoration">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  )
}
