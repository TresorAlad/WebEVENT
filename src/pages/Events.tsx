import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, Plus, MoreVertical, MapPin, Users, CheckCircle, Clock, Flag, Archive, Calendar as CalendarIcon, Upload } from 'lucide-react'
import { mockEvents } from '../services/mockData'
import type { EventStatus, Event } from '../types'
import Modal from '../components/ui/Modal'

const tabs: { label: string; status: EventStatus | 'All' }[] = [
  { label: 'All Events', status: 'All' },
  { label: 'Pending', status: 'Pending' },
  { label: 'Live', status: 'Live' },
  { label: 'Flagged', status: 'Flagged' },
  { label: 'Past', status: 'Past' },
]

const statusConfig: Record<EventStatus, { label: string; cls: string }> = {
  Live:      { label: 'LIVE',      cls: 'badge-live' },
  Pending:   { label: 'PENDING',   cls: 'badge-pending' },
  Flagged:   { label: 'FLAGGED',   cls: 'badge-flagged' },
  Past:      { label: 'PAST',      cls: 'badge-neutral' },
  Cancelled: { label: 'CANCELLED', cls: 'badge-neutral' },
}

export default function Events() {
  const [activeTab, setActiveTab] = useState<EventStatus | 'All'>('All')
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filtered = useMemo(() => {
    return mockEvents.filter((ev: Event) => {
      const matchTab = activeTab === 'All' || ev.status === activeTab
      const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
                          ev.organizer.toLowerCase().includes(search.toLowerCase())
      return matchTab && matchSearch
    })
  }, [activeTab, search])

  return (
    <div className="events-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Event Management</h1>
          <p>Manage, approve and monitor all tech ecosystem events in Togo.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" id="events-filter-btn">
            <SlidersHorizontal size={15} />
            Advanced Filters
          </button>
          <button className="btn btn-primary" id="events-create-btn" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={15} />
            Create New Event
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-underline">
        {tabs.map(t => (
          <button
            key={t.label}
            className={`tab-underline-btn${activeTab === t.status ? ' active' : ''}`}
            onClick={() => setActiveTab(t.status)}
          >
            {t.label} {activeTab === t.status && `(${filtered.length})`}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="events-search-bar">
        <div className="events-search-input-wrap">
          <Search size={15} className="events-search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Search events, organizers, or IDs..."
            style={{ paddingLeft: 42 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="events-search"
          />
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="events-grid">
        {filtered.map((event: Event) => {
          const sc = statusConfig[event.status] || { label: 'UNKNOWN', cls: 'badge-neutral' }
          return (
            <div key={event.id} className="event-card">
              {/* Image */}
              <div className="event-card-img-wrap">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="event-card-img" />
                ) : (
                  <div className="event-card-img event-card-img-placeholder" />
                )}
                <div className="event-card-img-badges">
                  <span className="event-cat-badge">{event.category}</span>
                  <span className={`badge ${sc.cls}`}>{sc.label}</span>
                </div>

                {/* More menu */}
                <div className="event-card-menu-wrap">
                  <button
                    className="event-card-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenu(openMenu === event.id ? null : event.id)
                    }}
                    id={`event-menu-${event.id}`}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenu === event.id && (
                    <div className="dropdown-menu">
                      <button className="dropdown-item">
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button className="dropdown-item">
                        <Clock size={14} /> Set Pending
                      </button>
                      <button className="dropdown-item">
                        <Flag size={14} /> Flag
                      </button>
                      <button className="dropdown-item danger">
                        <Archive size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="event-card-body">
                <p className="event-card-title">{event.title}</p>
                <p className="event-card-organizer">Organized by: {event.organizer}</p>
                <div className="event-card-meta">
                  <span><MapPin size={12} /> {event.location}</span>
                  <span><Users size={12} /> {event.attendees} attendees</span>
                </div>

                {event.status === 'Flagged' && event.flagReason && (
                  <div className="event-flag-reason">
                    <Flag size={12} />
                    <span>{event.flagReason}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="events-empty">
            <CalendarIcon size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p className="font-bold">No events matching your search</p>
            <p className="text-sm text-muted">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Event"
        size="lg"
      >
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); setIsCreateModalOpen(false); }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Event Title</label>
              <input type="text" className="input" placeholder="e.g. Lomé Tech Summit" required />
            </div>
            <div className="form-group">
              <label className="label">Category</label>
              <select className="input">
                <option>Technology</option>
                <option>Business</option>
                <option>Networking</option>
                <option>Web3</option>
              </select>
            </div>
          </div>

          <div className="form-group mt-4">
            <label className="label">Description</label>
            <textarea className="input" style={{ height: 100 }} placeholder="Describe the event..."></textarea>
          </div>

          <div className="grid-2 mt-4">
            <div className="form-group">
              <label className="label">Location</label>
              <input type="text" className="input" placeholder="e.g. Palais des Congrès" />
            </div>
            <div className="form-group">
              <label className="label">Date</label>
              <input type="date" className="input" />
            </div>
          </div>

          <div className="form-group mt-4">
            <label className="label">Event Cover Image</label>
            <div className="upload-zone">
              <Upload size={30} className="text-muted mb-2" />
              <p className="text-sm font-semibold">Click to upload or drag and drop</p>
              <p className="text-xs text-muted">PNG, JPG or WEBP (Max. 5MB)</p>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: 'var(--space-6) -var(--space-6) -var(--space-6)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Event</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

