import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import { useNotification } from '../components/ui/NotificationProvider'
import { approveOrganizerRequest, getOrganizerRequests, rejectOrganizerRequest } from '../services/api'

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

type OrganizerRequest = {
  id: string
  status: RequestStatus
  communityName: string
  description: string
  phone: string
  website?: string | null
  proofUrl?: string | null
  adminNote?: string | null
  decidedAt?: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    avatar?: string | null
    role: string
    status: string
    createdAt: string
  }
}

const tabs: { label: string; status?: RequestStatus }[] = [
  { label: 'En attente', status: 'PENDING' },
  { label: 'Approuvées', status: 'APPROVED' },
  { label: 'Refusées', status: 'REJECTED' },
  { label: 'Toutes' },
]

export default function OrganizerRequests() {
  const { notify } = useNotification()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<RequestStatus | 'ALL'>('PENDING')
  const [data, setData] = useState<OrganizerRequest[]>([])
  const [selected, setSelected] = useState<OrganizerRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const list = await getOrganizerRequests(status === 'ALL' ? undefined : status)
      setData(list)
    } catch (e: any) {
      notify(`Erreur: ${e?.response?.data?.message || e?.message || 'Impossible de charger les demandes'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const filtered = useMemo(() => data, [data])

  const badgeCls = (s: RequestStatus) =>
    s === 'PENDING' ? 'badge-pending' : s === 'APPROVED' ? 'badge-live' : 'badge-flagged'

  const approve = async (id: string) => {
    setActionLoading(true)
    try {
      await approveOrganizerRequest(id)
      notify('Demande approuvée. Le compte est maintenant ORGANIZER.', 'success')
      setSelected(null)
      await fetchData()
    } catch (e: any) {
      notify(`Erreur: ${e?.response?.data?.message || e?.message || 'Action impossible'}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const reject = async (id: string) => {
    setActionLoading(true)
    try {
      await rejectOrganizerRequest(id)
      notify('Demande refusée.', 'info')
      setSelected(null)
      await fetchData()
    } catch (e: any) {
      notify(`Erreur: ${e?.response?.data?.message || e?.message || 'Action impossible'}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="events-page">
      <div className="page-header">
        <div className="page-header-info">
          <h1>Demandes Organisateur</h1>
          <p>Étudiez les demandes avant de promouvoir un compte en ORGANIZER.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={fetchData} disabled={loading}>
            <RefreshCw size={15} /> Actualiser
          </button>
        </div>
      </div>

      <div className="tabs-underline">
        {tabs.map((t) => (
          <button
            key={t.label}
            className={`tab-underline-btn${(t.status ?? 'ALL') === status ? ' active' : ''}`}
            onClick={() => setStatus((t.status ?? 'ALL') as any)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Compte</th>
                <th>Communauté</th>
                <th>Statut</th>
                <th>Créée</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton width="220px" height="24px" /></td>
                    <td><Skeleton width="200px" height="24px" /></td>
                    <td><Skeleton width="120px" height="24px" /></td>
                    <td><Skeleton width="140px" height="24px" /></td>
                    <td><Skeleton width="80px" height="24px" /></td>
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={r.id} onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="user-cell">
                        {r.user.avatar ? (
                          <img src={r.user.avatar} alt="" className="avatar avatar-md" />
                        ) : (
                          <div className="avatar-placeholder avatar-md">{(r.user.name || r.user.email).charAt(0)}</div>
                        )}
                        <div className="user-cell-info">
                          <p className="user-cell-name">{r.user.name || 'Utilisateur'}</p>
                          <p className="user-cell-date">{r.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="font-semibold">{r.communityName}</span></td>
                    <td><span className={`badge ${badgeCls(r.status)}`}>{r.status}</span></td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); setSelected(r) }}>
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10">Aucune demande</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Détails de la demande" size="lg">
        {selected && (
          <div className="user-profile-details">
            <div className="grid-2 gap-6">
              <div className="detail-group">
                <p className="label">Communauté</p>
                <p className="font-semibold">{selected.communityName}</p>
              </div>
              <div className="detail-group">
                <p className="label">Téléphone</p>
                <p className="font-semibold">{selected.phone}</p>
              </div>
              <div className="detail-group">
                <p className="label">Site web</p>
                <p className="font-semibold">{selected.website || '—'}</p>
              </div>
              <div className="detail-group">
                <p className="label">Lien preuve</p>
                <p className="font-semibold">{selected.proofUrl || '—'}</p>
              </div>
            </div>

            <div className="divider" />

            <div className="detail-group">
              <p className="label">Description</p>
              <p className="text-muted leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{selected.description}</p>
            </div>

            <div className="divider" />

            <div className="modal-footer" style={{ margin: 'var(--space-6) -var(--space-6) -var(--space-6)' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>Fermer</button>
              {selected.status === 'PENDING' ? (
                <div className="flex gap-3">
                  <button type="button" className="btn btn-danger-outline" disabled={actionLoading} onClick={() => reject(selected.id)}>
                    <XCircle size={16} /> Refuser
                  </button>
                  <button type="button" className="btn btn-success" disabled={actionLoading} onClick={() => approve(selected.id)}>
                    <CheckCircle size={16} /> Approuver
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

