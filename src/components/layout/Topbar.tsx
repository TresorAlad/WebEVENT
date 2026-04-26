import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Bell, Moon, Sun, ChevronDown } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard':  'Global View',
  '/events':     'EventHub Management',
  '/users':      'EventHub Management',
  '/analytics':  'EventHub Management',
  '/financials': 'EventHub Management',
  '/settings':   'EventHub Management',
}

export default function Topbar() {
  const location = useLocation()
  const [dark, setDark] = useState(false)
  const [search, setSearch] = useState('')

  const pageTitle = pageTitles[location.pathname] ?? 'EventHub'

  return (
    <header className="topbar">
      {/* Search */}
      <div className="topbar-search">
        <Search size={15} className="topbar-search-icon" />
        <input
          id="topbar-search"
          type="text"
          className="topbar-search-input"
          placeholder="Search events, users, or logs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Center tabs */}
      <div className="topbar-tabs">
        <button className="topbar-tab active">Global View</button>
        <button className="topbar-tab">Logs</button>
      </div>

      {/* Right actions */}
      <div className="topbar-actions">
        {/* Notifications */}
        <button className="topbar-icon-btn" id="topbar-notifications" aria-label="Notifications">
          <Bell size={18} />
          <span className="topbar-notif-badge">3</span>
        </button>

        {/* Dark mode toggle */}
        <button
          className="topbar-icon-btn"
          id="topbar-dark-toggle"
          aria-label="Toggle dark mode"
          onClick={() => setDark(!dark)}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Admin profile */}
        <div className="topbar-profile">
          <img
            src="https://i.pravatar.cc/150?img=52"
            alt="Admin"
            className="avatar avatar-md"
          />
          <div className="topbar-profile-info">
            <span className="topbar-profile-name">E. Kodjo</span>
            <span className="topbar-profile-role">ADMIN</span>
          </div>
          <ChevronDown size={14} className="topbar-profile-arrow" />
        </div>
      </div>
    </header>
  )
}
