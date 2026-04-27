import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Users, BarChart2,
  DollarSign, Settings, HelpCircle, LogOut, Plus,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/events',     icon: Calendar,        label: 'Events' },
  { to: '/users',      icon: Users,           label: 'Admin Management' },
  { to: '/analytics',  icon: BarChart2,       label: 'Post Analytics' },
  { to: '/financials', icon: DollarSign,      label: 'Financials' },
  { to: '/settings',   icon: Settings,        label: 'System Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { dbUser, logout } = useAuth()

  const handleSignOut = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <img src="/logo.png" alt="EventHub" className="sidebar-logo-img" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">EventHub</span>
          <span className="sidebar-role">SUPER ADMIN</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}`
            }
          >
            <Icon size={18} strokeWidth={2} className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button
          className="create-event-btn"
          onClick={() => navigate('/events?action=create')}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Create New Event</span>
        </button>

        <div className="sidebar-footer-links">
          <button className="sidebar-footer-item">
            <HelpCircle size={16} />
            <span className="sidebar-nav-text">Support</span>
          </button>
          <button className="sidebar-footer-item" onClick={handleSignOut}>
            <LogOut size={16} />
            <span className="sidebar-nav-text">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
