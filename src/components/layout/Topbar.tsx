import { useState, useEffect } from 'react'
import { Search, Bell, Moon, Sun, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useNotification } from '../ui/NotificationProvider'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Topbar() {
  const { notify } = useNotification()
  const { user, dbUser, logout } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useState(false)
  const [search, setSearch] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Sync Dark Mode with Body class
  useEffect(() => {
    if (dark) document.body.classList.add('dark-mode')
    else document.body.classList.remove('dark-mode')
  }, [dark])

  const handleSignOut = async () => {
    await logout()
    notify('Signed out successfully', 'info')
    navigate('/login')
  }

  return (
    <header className="topbar">
      {/* Search */}
      <div className="topbar-search">
        <Search size={15} className="topbar-search-icon" />
        <input
          id="topbar-search"
          type="text"
          className="topbar-search-input"
          placeholder="Global search events, admins..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={(e) => {
             if(e.key === 'Enter' && search) {
                notify(`Global search for "${search}" triggered.`, 'info')
             }
          }}
        />
      </div>

      {/* Center tabs */}
      <div className="topbar-tabs">
        <button className="topbar-tab active">Console</button>
        <button className="topbar-tab" onClick={() => notify('Activity Logs coming soon in v2.0', 'info')}>Log History</button>
      </div>

      {/* Right actions */}
      <div className="topbar-actions">
        {/* Notifications */}
        <div className="dropdown">
          <button 
            className={`topbar-icon-btn ${showNotifications ? 'active' : ''}`} 
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfileMenu(false)
            }}
          >
            <Bell size={18} />
          </button>
          {showNotifications && (
            <div className="dropdown-menu" style={{ width: 250, right: 0 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <p className="font-bold text-sm">Notifications</p>
              </div>
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p className="text-xs font-semibold">Aucune notification</p>
              </div>
            </div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          className="topbar-icon-btn"
          onClick={() => setDark(!dark)}
          title="Toggle Dark Mode"
        >
          {dark ? <Sun size={18} className="text-warning" /> : <Moon size={18} />}
        </button>

        {/* Profile */}
        <div className="dropdown">
          <div 
            className="topbar-profile" 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu)
              setShowNotifications(false)
            }}
          >
            <img src={dbUser?.avatar || user?.photoURL || "https://i.pravatar.cc/150?img=52"} alt="Admin" className="avatar avatar-md" />
            <div className="topbar-profile-info">
              <span className="topbar-profile-name">{dbUser?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Admin'}</span>
              <span className="topbar-profile-role">SUPER ADMIN</span>
            </div>
            <ChevronDown size={14} className={`topbar-profile-arrow ${showProfileMenu ? 'rotate' : ''}`} />
          </div>
          {showProfileMenu && (
            <div className="dropdown-menu" style={{ right: 0, minWidth: 200 }}>
              <button className="dropdown-item" onClick={() => navigate('/profile')}>
                <User size={14} /> Account Profile
              </button>
              <button className="dropdown-item" onClick={() => navigate('/settings')}>
                <Settings size={14} /> System Settings
              </button>
              <button className="dropdown-item" onClick={() => notify('Security center active', 'info')}>
                <Shield size={14} /> Security Center
              </button>
              <div className="divider" />
              <button className="dropdown-item danger" onClick={handleSignOut}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// Small helper since I used it above
const CheckCircle = ({ size }: { size: number }) => <span style={{ color: 'var(--success)' }}><Bell size={size} /></span>
const AlertTriangle = ({ size }: { size: number }) => <span style={{ color: 'var(--warning)' }}><Bell size={size} /></span>
const Shield = ({ size }: { size: number }) => <span style={{ color: 'var(--info)' }}><Bell size={size} /></span>
