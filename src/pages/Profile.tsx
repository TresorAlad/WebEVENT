import { useState, useEffect } from 'react'
import { User, Mail, Shield, Save, Key, Bell, RefreshCw } from 'lucide-react'
import { useNotification } from '../components/ui/NotificationProvider'
import { useAuth } from '../hooks/useAuth'
import { updateProfile } from '../services/api'

const AVATAR_OPTIONS = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=11",
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=13",
  "https://i.pravatar.cc/150?img=14",
  "https://i.pravatar.cc/150?img=15",
  "https://i.pravatar.cc/150?img=21",
  "https://i.pravatar.cc/150?img=22",
  "https://i.pravatar.cc/150?img=23",
  "https://i.pravatar.cc/150?img=24",
  "https://i.pravatar.cc/150?img=25",
  "https://i.pravatar.cc/150?img=31",
  "https://i.pravatar.cc/150?img=32",
  "https://i.pravatar.cc/150?img=33",
  "https://i.pravatar.cc/150?img=34",
  "https://i.pravatar.cc/150?img=35",
];

export default function Profile() {
  const { notify } = useNotification()
  const { user, dbUser, refreshUser, updateDbUser } = useAuth()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    bio: ''
  })

  useEffect(() => {
    if (dbUser) {
      setFormData({
        name: dbUser.name || user?.displayName || '',
        avatar: dbUser.avatar || user?.photoURL || AVATAR_OPTIONS[0],
        bio: dbUser.bio || "Responsable de la plateforme EventHub au Togo — pilotage des événements et de la communauté."
      })
    }
  }, [dbUser, user])

  const handleRandomAvatar = () => {
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]
    setFormData(prev => ({ ...prev, avatar: randomAvatar }))
    updateDbUser({ avatar: randomAvatar })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(formData)
      await refreshUser()
      notify('Profil mis à jour !', 'success')
    } catch (error) {
      console.error('Failed to update profile', error)
      notify('Impossible de mettre à jour le profil. Réessayez.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="page-header-info">
          <h1>Profil du compte</h1>
          <p>Mettez à jour vos informations personnelles et la sécurité du compte.</p>
        </div>
      </div>

      <div className="grid-3 gap-6">
        {/* Left Col: Profile info */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <img src={formData.avatar} alt="Avatar" className="avatar avatar-xl" style={{ width: 100, height: 100, objectFit: 'cover' }} />
              <button
                type="button"
                onClick={handleRandomAvatar}
                className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg border border-border hover:bg-bg transition-colors"
                style={{ backgroundColor: 'var(--bg-card)' }}
                title="Changer d&apos;avatar"
              >
                <RefreshCw size={16} className="text-primary" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-primary">{formData.name || 'Admin'}</h2>
              <p className="text-muted">ADMIN • Lomé, Togo</p>
              <div className="badge badge-success mt-2">Administrateur vérifié</div>
            </div>
          </div>

          <form className="settings-form" onSubmit={handleSave}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Nom complet</label>
                <div className="flex items-center gap-3">
                  <User size={16} className="text-muted" />
                  <input
                    type="text"
                    name="name"
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Identifiant public</label>
                <input
                  type="text"
                  className="input"
                  value={`@${formData.name.toLowerCase().replace(/\s/g, '_')}`}
                  readOnly
                />
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="label">Bio</label>
              <textarea
                name="bio"
                className="input"
                style={{ height: 80 }}
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="form-group mt-4">
              <label className="label">Adresse e-mail</label>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-muted" />
                <input type="email" className="input" value={dbUser?.email || user?.email || ''} readOnly />
              </div>
            </div>

            <div className="divider mt-8" />

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Stats/Sec */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-warning" />
              <p className="font-bold">Sécurité</p>
            </div>
            <div className="flex flex-col gap-4">
              <button type="button" className="btn btn-outline w-full justify-start">
                <Key size={14} /> Changer le mot de passe
              </button>
              <button type="button" className="btn btn-outline w-full justify-start">
                <Bell size={14} /> Authentification à deux facteurs
              </button>
            </div>
          </div>

          <div className="card">
            <p className="label mb-2">Statistiques du compte</p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Événements approuvés (total)</span>
                <span className="font-bold">1 248</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Score de modération</span>
                <span className="font-bold text-success">98,5 %</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
