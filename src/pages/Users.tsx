import { useState, useMemo, useEffect } from 'react'
import { SlidersHorizontal, MoreVertical, ChevronLeft, ChevronRight, UserPlus, CheckCircle, AlertTriangle, Ban, Eye } from 'lucide-react'
import { getUsers, getDashboardStats } from '../services/api'
import type { User, DashboardStats } from '../types'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'

const PAGE_SIZE = 5
type TabFilter = 'tous' | 'organisateurs' | 'suspendus'

const TAB_LABELS: Record<TabFilter, string> = {
  tous: 'Tous les comptes',
  organisateurs: 'Organisateurs',
  suspendus: 'Suspendus',
}

function libelleStatut(status: User['status']): string {
  if (status === 'Suspended') return 'Suspendu'
  if (status === 'Active') return 'Actif'
  return status
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabFilter>('tous')
  const [page, setPage] = useState(1)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [searchVal] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        getUsers(),
        getDashboardStats()
      ])
      setUsers(usersData.map((u: any) => ({
        ...u,
        joinedAt: new Date(u.createdAt).toLocaleDateString()
      })))
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching users data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchTab =
        tab === 'tous' ? true :
        tab === 'organisateurs' ? u.role === 'ORGANIZER' :
        u.status === 'Suspended'
      const matchSearch =
        u.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        u.email.toLowerCase().includes(searchVal.toLowerCase())
      return matchTab && matchSearch
    })
  }, [users, tab, searchVal])

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
          <h1>Gestion des comptes</h1>
          <p>Supervisez les organisateurs et le personnel de la plateforme.</p>
        </div>
        <div className="page-header-actions">
          <div className="tabs">
            {(['tous', 'organisateurs', 'suspendus'] as TabFilter[]).map(t => (
              <button
                key={t}
                type="button"
                className={`tab-btn${tab === t ? ' active' : ''}`}
                onClick={() => { setTab(t); setPage(1) }}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-outline" id="users-filter-btn">
            <SlidersHorizontal size={15} />
            Filtres
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Compte</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton width="150px" height="40px" /></td>
                    <td><Skeleton width="200px" height="20px" /></td>
                    <td><Skeleton width="80px" height="20px" /></td>
                    <td><Skeleton width="100px" height="20px" /></td>
                    <td><Skeleton width="40px" height="20px" /></td>
                  </tr>
                ))
              ) : paginated.length > 0 ? (
                paginated.map((user: User) => (
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
                          <p className="user-cell-date">Inscrit le {user.joinedAt}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="user-email">{user.email}</span></td>
                    <td><span className={`badge ${roleBadgeClass(user.role)}`}>{user.role}</span></td>
                    <td>
                      <div className="status-cell">
                        <span className={`status-dot ${statusCls(user.status)}`} />
                        <span className={`status-text ${statusCls(user.status)}`}>{libelleStatut(user.status)}</span>
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
                            <button type="button" className="dropdown-item" onClick={() => setSelectedUser(user)}>
                              <Eye size={14} /> Voir le détail
                            </button>
                            <button type="button" className="dropdown-item">
                              <CheckCircle size={14} /> Activer
                            </button>
                            <button type="button" className="dropdown-item">
                              <Ban size={14} /> Suspendre
                            </button>
                            <button type="button" className="dropdown-item danger">
                              <AlertTriangle size={14} /> Retirer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10">Aucun utilisateur trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            {filtered.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} résultats
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
            <p className="stat-card-label">Nouveaux cette semaine</p>
            <p className="stat-card-value">+{stats?.newUsersThisWeek || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-label">Organisateurs vérifiés</p>
            <p className="stat-card-value">{stats?.verifiedOrganizers || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-label">Modérations en attente</p>
            <p className="stat-card-value">{stats?.pendingReviews || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <Ban size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-label">Comptes suspendus</p>
            <p className="stat-card-value">{stats?.suspendedUsers || 0}</p>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Détails du compte"
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
                  <span className={`badge ${statusCls(selectedUser.status)}`}>{libelleStatut(selectedUser.status)}</span>
                </div>
              </div>
            </div>

            <div className="grid-2 gap-6">
              <div className="detail-group">
                <p className="label">Inscription</p>
                <p className="font-semibold">{selectedUser.joinedAt}</p>
              </div>
              <div className="detail-group">
                <p className="label">Identifiant du compte</p>
                <p className="font-semibold">{selectedUser.id}</p>
              </div>
            </div>

            <div className="divider" />

            <div className="modal-footer" style={{ margin: 'var(--space-6) -var(--space-6) -var(--space-6)' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setSelectedUser(null)}>Fermer</button>
              {selectedUser.status === 'Active' ? (
                <button type="button" className="btn btn-danger">Suspendre le compte</button>
              ) : (
                <button type="button" className="btn btn-primary">Activer le compte</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
