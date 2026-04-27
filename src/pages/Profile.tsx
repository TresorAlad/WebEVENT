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
  const { user, dbUser, refreshUser } = useAuth()
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
        avatar: dbUser.avatar || user?.photoURL || AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
        bio: dbUser.bio || "Lomé tech ecosystem lead and lead developer for EventHub platform management."
      })
    }
  }, [dbUser, user])

  const handleRandomAvatar = () => {
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]
    setFormData(prev => ({ ...prev, avatar: randomAvatar }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(formData)
      await refreshUser()
      notify('Profile updated successfully!', 'success')
    } catch (error) {
      console.error('Failed to update profile', error)
      notify('Failed to update profile. Please try again.', 'error')
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
          <h1>Account Profile</h1>
          <p>Update your personal information and account security.</p>
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
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-border hover:bg-bg-card transition-colors"
                title="Random Avatar"
              >
                <RefreshCw size={16} className="text-primary" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-primary">{formData.name || 'Admin'}</h2>
              <p className="text-muted">ADMIN • Lomé, Togo</p>
              <div className="badge badge-success mt-2">Verified ADMIN</div>
            </div>
          </div>

          <form className="settings-form" onSubmit={handleSave}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Full Name</label>
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
                <label className="label">Public Username</label>
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
              <label className="label">Email Address</label>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-muted" />
                <input type="email" className="input" value={dbUser?.email || user?.email || ''} readOnly />
              </div>
            </div>

            <div className="divider mt-8" />

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Stats/Sec */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-warning" />
              <p className="font-bold">Security</p>
            </div>
            <div className="flex flex-col gap-4">
              <button className="btn btn-outline w-full justify-start">
                <Key size={14} /> Change Password
              </button>
              <button className="btn btn-outline w-full justify-start">
                <Bell size={14} /> 2FA Setup
              </button>
            </div>
          </div>

          <div className="card">
            <p className="label mb-2">Account Statistics</p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total Events Approved</span>
                <span className="font-bold">1,248</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Moderation Score</span>
                <span className="font-bold text-success">98.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
