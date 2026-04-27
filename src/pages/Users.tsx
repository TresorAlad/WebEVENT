import { useState, useMemo } from 'react'
import { SlidersHorizontal, MoreVertical, ChevronLeft, ChevronRight, UserPlus, CheckCircle, AlertTriangle, Ban, Eye } from 'lucide-react'
import { mockUsers, mockStats } from '../services/mockData'
import type { User } from '../types'
import Modal from '../components/ui/Modal'

const PAGE_SIZE = 5
type TabFilter = 'All Accounts' | 'Organizers' | 'Suspended'

export default function Users() {
  const [tab, setTab] = useState<TabFilter>('All Accounts')
  const [page, setPage] = useState(1)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [searchVal, setSearchVal] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filtered = useMemo(() => {
    return mockUsers.filter(u => {
      const matchTab =
        tab === 'All Accounts' ? true :
        tab === 'Organizers' ? u.role === 'ORGANIZER' :
        u.status === 'Suspended'
      const matchSearch =
        u.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        u.email.toLowerCase().includes(searchVal.toLowerCase())
      return matchTab && matchSearch
    })
  }, [tab, searchVal])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }, [filtered, page])

  const roleBadgeClass = (role: User['role']) =>
    role === 'ORGANIZER' ? 'badge-info' : role === 'ADMIN' ? 'badge-primary' : 'badge-neutral'

  const statusCls = (status: User['status']) =>
    status === 'Active' ? 'active' : status === 'Suspended' ? 'suspended' : 'pending'

  return (
    <div className="users-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Account Management</h1>
          <p>Oversee and manage your community of organizers and staff.</p>
        </div>
        <div className="page-header-actions">
          <div className="tabs">
            {(['All Accounts', 'Organizers', 'Suspended'] as TabFilter[]).map(t => (
              <button
                key={t}
                className={`tab-btn${tab === t ? ' active' : ''}`}
                onClick={() => { setTab(t); setPage(1) }}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="btn btn-outline" id="users-filter-btn">
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user: User) => (
                <tr key={user.id} onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="user-cell">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="avatar avatar-md" />
                      ) : (
                        <div className="avatar-placeholder avatar-md">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="user-cell-info">
                        <p className="user-cell-name">{user.name}</p>
                        <p className="user-cell-date">Joined {user.joinedAt}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="user-email">{user.email}</span></td>
                  <td><span className={`badge ${roleBadgeClass(user.role)}`}>{user.role}</span></td>
                  <td>
                    <div className="status-cell">
                      <span className={`status-dot ${statusCls(user.status)}`} />
                      <span className={`status-text ${statusCls(user.status)}`}>{user.status}</span>
                    </div>
                  </td>
                  <td>
                    <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenu === user.id && (
                        <div className="dropdown-menu" style={{ right: 'auto', left: 0 }}>
                          <button className="dropdown-item" onClick={() => setSelectedUser(user)}>
                            <Eye size={14} /> View Details
                          </button>
                          <button className="dropdown-item">
                            <CheckCircle size={14} /> Activate
                          </button>
                          <button className="dropdown-item">
                            <Ban size={14} /> Suspend
                          </button>
                          <button className="dropdown-item danger">
                            <AlertTriangle size={14} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            Showing {filtered.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
          </span>
          <div className="pagination-controls">
            <button
              className="btn btn-ghost btn-icon"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`pagination-num${page === i + 1 ? ' active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="btn btn-ghost btn-icon"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="users-stats-row">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
              <UserPlus size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-label">New This Week</p>
            <p className="stat-card-value">+{mockStats.newUsersThisWeek}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-label">Verified Organizers</p>
            <p className="stat-card-value">{mockStats.verifiedOrganizers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-label">Pending Reviews</p>
            <p className="stat-card-value">{mockStats.pendingReviews}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <Ban size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-label">Suspended Accounts</p>
            <p className="stat-card-value">0{mockStats.suspendedUsers}</p>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Account Profile Details"
        size="md"
      >
        {selectedUser && (
          <div className="user-profile-details">
            <div className="flex items-center gap-6 mb-8">
              {selectedUser.avatar ? (
                <img src={selectedUser.avatar} alt="" className="avatar avatar-xl" />
              ) : (
                <div className="avatar-placeholder avatar-xl">{selectedUser.name.charAt(0)}</div>
              )}
              <div>
                <h2 className="text-2xl font-extrabold">{selectedUser.name}</h2>
                <p className="text-muted">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`badge ${roleBadgeClass(selectedUser.role)}`}>{selectedUser.role}</span>
                  <span className={`badge ${statusCls(selectedUser.status)}`}>{selectedUser.status}</span>
                </div>
              </div>
            </div>

            <div className="grid-2 gap-6">
              <div className="detail-group">
                <p className="label">Registered On</p>
                <p className="font-semibold">{selectedUser.joinedAt}</p>
              </div>
              <div className="detail-group">
                <p className="label">Account ID</p>
                <p className="font-semibold">{selectedUser.id}</p>
              </div>
            </div>

            <div className="divider" />

            <div className="modal-footer" style={{ margin: 'var(--space-6) -var(--space-6) -var(--space-6)' }}>
              <button className="btn btn-ghost" onClick={() => setSelectedUser(null)}>Close</button>
              {selectedUser.status === 'Active' ? (
                <button className="btn btn-danger">Suspend Account</button>
              ) : (
                <button className="btn btn-primary">Activate Account</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
