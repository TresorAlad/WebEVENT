import { Save, Globe, Mail, Shield, Palette, Smartphone } from 'lucide-react'
import { useNotification } from '../components/ui/NotificationProvider'
import { useState } from 'react'

export default function Settings() {
  const { notify } = useNotification()
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      notify('Settings saved successfully!')
    }, 1000)
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="page-header-info">
          <h1>System Settings</h1>
          <p>Configure platform branding, languages, emails and security.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Branding */}
        <div className="card">
          <div className="settings-card-header">
            <Palette size={20} className="text-primary" />
            <h3 className="settings-card-title">Platform Branding</h3>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label className="label">Platform Name</label>
              <input type="text" className="input" defaultValue="EventHub Togo" />
            </div>
            <div className="form-group">
              <label className="label">Primary Branding Color</label>
              <div className="color-picker-wrap">
                <input type="color" className="color-input" defaultValue="#03045e" />
                <span className="text-xs font-semibold">#03045E</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regional */}
        <div className="card">
          <div className="settings-card-header">
            <Globe size={20} className="text-primary" />
            <h3 className="settings-card-title">Regional & Language</h3>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label className="label">Default Language</label>
              <select className="input">
                <option>Français (Togo)</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card full-width">
          <div className="settings-card-header">
            <Shield size={20} className="text-primary" />
            <h3 className="settings-card-title">Security & API Keys</h3>
          </div>
          <div className="settings-form grid-2">
            <div className="form-group">
              <label className="label">Firebase Project ID</label>
              <input type="password" title="Firebase Project ID" className="input" defaultValue="PLATFORM_PROJECT_ID" />
            </div>
            <div className="form-group">
              <label className="label">API Secret Key</label>
              <input type="password" title="API Secret Key" className="input" defaultValue="PLATFORM_SECRET_KEY" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
