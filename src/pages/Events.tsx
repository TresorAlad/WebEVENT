import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, Plus, MoreVertical, MapPin, Users, CheckCircle, Clock, Flag, Archive, Calendar as CalendarIcon, Upload, X, ShieldAlert, BadgeCheck } from 'lucide-react'
import { mockEvents } from '../services/mockData'
import type { EventStatus, Event } from '../types'
import Modal from '../components/ui/Modal'
import { useNotification } from '../components/ui/NotificationProvider'

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
  const { notify } = useNotification()
  const [activeTab, setActiveTab] = useState<EventStatus | 'All'>('All')
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const filtered = useMemo(() => {
    return mockEvents.filter((ev: Event) => {
      const matchTab = activeTab === 'All' || ev.status === activeTab
      const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
                          ev.organizer.toLowerCase().includes(search.toLowerCase())
      return matchTab && matchSearch
    })
  }, [activeTab, search])

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation()
    notify(`Event ${action} successfully!`)
    setOpenMenu(null)
  }

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
          />
        </div>
      </div>

      {/* Grid */}
      <div className="events-grid">
        {filtered.map((event: Event) => {
          const sc = statusConfig[event.status] || { label: 'UNKNOWN', cls: 'badge-neutral' }
          return (
            <div key={event.id} className="event-card" onClick={() => setSelectedEvent(event)}>
              <div className="event-card-img-wrap">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="event-card-img" />
                ) : (
                  <div className="event-card-img event-card-img-placeholder" />
                )}
                <div className="event-card-img-badges">
                  <span className={`badge ${sc.cls}`}>{sc.label}</span>
                </div>
              </div>
              <div className="event-card-body">
                <div className="flex justify-between items-start mb-2">
                  <p className="event-card-category">{event.category}</p>
                  <div className="dropdown" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setOpenMenu(openMenu === event.id ? null : event.id)}>
                      <MoreVertical size={14} />
                    </button>
                    {openMenu === event.id && (
                      <div className="dropdown-menu">
                        <button className="dropdown-item" onClick={(e) => handleAction(e, 'approved')}><CheckCircle size={14}/> Approve</button>
                        <button className="dropdown-item" onClick={(e) => handleAction(e, 'flagged')}><Flag size={14}/> Flag</button>
                        <button className="dropdown-item danger" onClick={(e) => handleAction(e, 'archived')}><Archive size={14}/> Archive</button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-organizer">by {event.organizer}</p>
                
                <div className="event-card-meta mt-4">
                  <div className="event-meta-item">
                    <MapPin size={12} />
                    <span>{event.location}</span>
                  </div>
                  <div className="event-meta-item">
                    <Users size={12} />
                    <span>{event.attendees} registered</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add New Platform Event">
         <div className="p-6">
            <div className="form-group mb-4">
               <label className="label">Event Title</label>
               <input type="text" className="input" placeholder="e.g. Lomé DevOps Summit" />
            </div>
            <div className="grid-2 gap-4 mb-4">
               <div className="form-group">
                  <label className="label">Organizer</label>
                  <input type="text" className="input" placeholder="Company or Community" />
               </div>
               <div className="form-group">
                  <label className="label">Category</label>
                  <select className="input">
                     <option>Tech & Development</option>
                     <option>Business & Startups</option>
                     <option>Web3 & Crypto</option>
                  </select>
               </div>
            </div>
            <div className="form-group mb-6">
               <label className="label">Promotional Banner</label>
               <div className="upload-box">
                  <Upload size={24} className="text-muted mb-2" />
                  <p className="text-xs">Select image (建議 1200x600)</p>
               </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
               <button className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
               <button className="btn btn-primary" onClick={() => { notify('Event created successfully'); setIsCreateModalOpen(false); }}>Create Event</button>
            </div>
         </div>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details" size="lg">
         {selectedEvent && (
            <div className="event-details-modal">
               <div className="event-detail-banner">
                  {selectedEvent.image ? (
                     <img src={selectedEvent.image} alt="" className="event-banner-img" />
                  ) : (
                     <div className="event-banner-img placeholder-img" />
                  )}
                  <span className={`badge ${statusConfig[selectedEvent.status].cls} banner-badge`}>
                     {selectedEvent.status}
                  </span>
               </div>
               
               <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h2 className="text-3xl font-extrabold text-primary mb-2">{selectedEvent.title}</h2>
                        <p className="flex items-center gap-2 text-muted font-semibold">
                           <MapPin size={16} /> {selectedEvent.location}
                        </p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-bold text-muted uppercase tracking-wider">Estimated Attendees</p>
                        <p className="text-2xl font-black text-primary">{selectedEvent.attendees}</p>
                     </div>
                  </div>

                  <div className="grid-3 gap-6 mb-8">
                     <div className="info-box">
                        <CalendarIcon size={18} className="text-primary" />
                        <div>
                           <p className="text-xs text-muted font-bold">DATE</p>
                           <p className="font-bold">{selectedEvent.date}, 2026</p>
                        </div>
                     </div>
                     <div className="info-box">
                        <Clock size={18} className="text-warning" />
                        <div>
                           <p className="text-xs text-muted font-bold">TIME</p>
                           <p className="font-bold">09:00 AM GMT</p>
                        </div>
                     </div>
                     <div className="info-box">
                        <Users size={18} className="text-success" />
                        <div>
                           <p className="text-xs text-muted font-bold">ORGANIZER</p>
                           <p className="font-bold">{selectedEvent.organizer}</p>
                        </div>
                     </div>
                  </div>

                  <div className="divider" />

                  <div className="mt-8">
                     <h4 className="font-bold mb-4">Event Description</h4>
                     <p className="text-muted leading-relaxed">
                        This is a major tech event happening in Togo. It focuses on the latest trends in {selectedEvent.category} and brings together experts, developers and entrepreneurs for a day of learning and networking at {selectedEvent.location}.
                     </p>
                  </div>

                  {selectedEvent.status === 'Flagged' && (
                     <div className="warning-panel mt-8">
                        <ShieldAlert size={20} className="text-danger" />
                        <div>
                           <p className="font-bold text-danger">Safety Alert</p>
                           <p className="text-sm text-danger opacity-80">{selectedEvent.flagReason || 'This event has been reported for violations.'}</p>
                        </div>
                     </div>
                  )}

                  <div className="modal-footer mt-10">
                     <button className="btn btn-ghost" onClick={() => setSelectedEvent(null)}>Close</button>
                     <div className="flex gap-3">
                        {selectedEvent.status === 'Pending' && (
                           <button className="btn btn-success" onClick={() => { notify('Event approved'); setSelectedEvent(null); }}>
                              <BadgeCheck size={16} /> Approve Event
                           </button>
                        )}
                        <button className="btn btn-danger-outline" onClick={() => { notify('Event flagged'); setSelectedEvent(null); }}>
                           <ShieldAlert size={16} /> Flag content
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </Modal>
    </div>
  )
}
