import { useState } from 'react'
import { User, Mail, Shield, Camera, Save, Key, Bell } from 'lucide-react'
import { useNotification } from '../components/ui/NotificationProvider'

export default function Profile() {
  const { notify } = useNotification()
  const [saving, setSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      notify('Profile updated successfully!')
    }, 1000)
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
                <img src="https://i.pravatar.cc/150?img=52" alt="Avatar" className="avatar avatar-xl" style={{ width: 100, height: 100 }} />
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-border hover:bg-bg-card transition-colors">
                    <Camera size={16} className="text-primary" />
                </button>
             </div>
             <div>
                <h2 className="text-2xl font-extrabold text-primary">E. Kodjo</h2>
                <p className="text-muted">Super Admin • Lomé, Togo</p>
                <div className="badge badge-success mt-2">Verified Admin</div>
             </div>
          </div>

          <form className="settings-form" onSubmit={handleSave}>
            <div className="grid-2">
                <div className="form-group">
                    <label className="label">Full Name</label>
                    <div className="flex items-center gap-3">
                        <User size={16} className="text-muted" />
                        <input type="text" className="input" defaultValue="Emanuel Kodjo" />
                    </div>
                </div>
                <div className="form-group">
                    <label className="label">Public Username</label>
                    <input type="text" className="input" defaultValue="@ekodjo_admin" />
                </div>
            </div>

            <div className="form-group mt-4">
                <label className="label">Bio</label>
                <textarea className="input" style={{ height: 80 }} defaultValue="Lomé tech ecosystem lead and lead developer for EventHub platform management." />
            </div>

            <div className="form-group mt-4">
                <label className="label">Email Address</label>
                <div className="flex items-center gap-3">
                    <Mail size={16} className="text-muted" />
                    <input type="email" className="input" defaultValue="e.kodjo@eventhub.tg" />
                </div>
            </div>

            <div className="divider mt-8" />
            
            <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={16} />
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
