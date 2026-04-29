import { useState, useMemo, useEffect } from 'react'
import { Search, SlidersHorizontal, Plus, MoreVertical, MapPin, Users, CheckCircle, Clock, Flag, Archive, Calendar as CalendarIcon, Upload, ShieldAlert, BadgeCheck, Loader2 } from 'lucide-react'
import { getAllEvents, createEvent } from '../services/api'
import type { EventStatus, Event } from '../types'
import Modal from '../components/ui/Modal'
import { useNotification } from '../components/ui/NotificationProvider'
import Skeleton from '../components/ui/Skeleton'

const tabs: { label: string; status: EventStatus | 'All' }[] = [
  { label: 'All Events', status: 'All' },
  { label: 'Pending', status: 'Pending' },
  { label: 'Live', status: 'Live' },
  { label: 'Flagged', status: 'Flagged' },
  { label: 'Past', status: 'Past' },
]

const statusConfig: Record<EventStatus, { label: string; cls: string }> = {
  Live:      { label: 'LIVE',      cls: 'badge-live' },
  Upcoming:  { label: 'À VENIR',   cls: 'badge-pending' },
  Pending:   { label: 'PENDING',   cls: 'badge-pending' },
  Flagged:   { label: 'FLAGGED',   cls: 'badge-flagged' },
  Past:      { label: 'PAST',      cls: 'badge-neutral' },
  Cancelled: { label: 'CANCELLED', cls: 'badge-neutral' },
}

export default function Events() {
  const { notify } = useNotification()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<EventStatus | 'All'>('All')
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // New Event Form State
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 4

  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventOrganizer, setNewEventOrganizer] = useState('')
  const [newEventCategory, setNewEventCategory] = useState('Tech & Development')
  const [newEventImage, setNewEventImage] = useState<File | null>(null)
  const [newEventImagePreview, setNewEventImagePreview] = useState<string | null>(null)
  
  // Advanced State
  const [newEventDescription, setNewEventDescription] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventTime, setNewEventTime] = useState('')
  const [newEventEndDate, setNewEventEndDate] = useState('')
  const [newEventEndTime, setNewEventEndTime] = useState('')
  
  const [newEventType, setNewEventType] = useState<'in-person'|'online'|'hybrid'>('in-person')
  const [newEventLocation, setNewEventLocation] = useState('')
  const [newEventMeetingLink, setNewEventMeetingLink] = useState('')

  const [newEventIsExternal, setNewEventIsExternal] = useState(false)
  const [newEventExternalLink, setNewEventExternalLink] = useState('')

  const [creating, setCreating] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify('L\'image est trop volumineuse (max 5MB). Veuillez en choisir une plus petite.')
        return
      }
      setNewEventImage(file)
      setNewEventImagePreview(URL.createObjectURL(file))
    }
  }

  const handleCreateEvent = async () => {
    if (!newEventTitle || !newEventOrganizer) {
      notify('Please fill out necessary fields')
      return
    }
    setCreating(true)
    try {
      const formData = new FormData()
      formData.append('title', newEventTitle)
      formData.append('organizer', newEventOrganizer)
      formData.append('category', newEventCategory)
      formData.append('date', newEventDate ? new Date(`${newEventDate}T${newEventTime || '00:00'}`).toISOString() : new Date().toISOString())
      if (newEventEndDate) {
        formData.append('endDate', new Date(`${newEventEndDate}T${newEventEndTime || '23:59'}`).toISOString())
      }
      formData.append('location', newEventType === 'in-person' ? newEventLocation : newEventMeetingLink)
      formData.append('description', newEventDescription || 'A brand new event.')
      formData.append('participationMode', newEventType === 'online' ? 'Online' : 'InPlace')
      formData.append('registrationMode', newEventIsExternal ? 'External' : 'Internal')
      if (newEventIsExternal && newEventExternalLink) {
        formData.append('externalLink', newEventExternalLink)
      }
      if (newEventImage) {
        formData.append('image', newEventImage)
      }
      
      await createEvent(formData)
      notify('Event created successfully')
      setIsCreateModalOpen(false)
      fetchEvents()
      // reset state
      setStep(1)
      setNewEventTitle('')
      setNewEventOrganizer('')
      setNewEventDescription('')
      setNewEventDate('')
      setNewEventTime('')
      setNewEventEndDate('')
      setNewEventEndTime('')
      setNewEventLocation('')
      setNewEventMeetingLink('')
      setNewEventImage(null)
      setNewEventImagePreview(null)
    } catch (error: any) {
      console.error(error?.response?.data || error)
      notify(`Échec de création : ${error?.response?.data?.message || error.message || 'Erreur réseau'}`)
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents()
      // Mapping server fields (like organizer.name) to frontend Event type if needed
      setEvents(data.map((e: any) => ({
        ...e,
        organizer: e.organizer?.name || 'Unknown Organizer',
        attendees: e._count?.participants || 0
      })))
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return events.filter((ev: Event) => {
      const matchTab = activeTab === 'All' || ev.status === activeTab
      const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
                          ev.organizer.toLowerCase().includes(search.toLowerCase())
      return matchTab && matchSearch
    })
  }, [events, activeTab, search])

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
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="event-card">
              <Skeleton height={200} />
              <div className="p-4">
                <Skeleton width="60%" height={24} className="mb-2" />
                <Skeleton width="40%" height={16} />
              </div>
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((event: Event) => {
            let currentStatus = event.status as EventStatus;
            const now = new Date();
            const startDate = new Date(event.date);
            const endDate = (event as any).endDate ? new Date((event as any).endDate) : null;

            if (currentStatus === 'Upcoming' || currentStatus === 'Live') {
              if (now < startDate) {
                currentStatus = 'Upcoming';
              } else if (endDate && now > endDate) {
                currentStatus = 'Past';
              } else {
                currentStatus = 'Live';
              }
            }

            const sc = statusConfig[currentStatus] || { label: 'UNKNOWN', cls: 'badge-neutral' }
            return (
              <div key={event.id} className="event-card" onClick={() => setSelectedEvent({ ...event, status: currentStatus })}>
              <div className="event-card-img-wrap">
                {(event as any).imageUrl || (event as any).image ? (
                  <img src={(event as any).imageUrl || (event as any).image} alt={event.title} className="event-card-img" />
                ) : (
                  <div className="event-card-img event-card-img-placeholder" />
                )}
                <div className="event-card-img-badges">
                  <span className={`badge ${sc.cls}`}>{sc.label}</span>
                  <span className={`badge ${event.participationMode === 'Online' ? 'badge-purple' : 'badge-indigo'}`}>
                    {event.participationMode === 'Online' ? 'ONLINE' : 'IN-PERSON'}
                  </span>
                </div>
              </div>
              <div className="event-card-body">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <p className="event-card-category">{event.category}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${event.registrationMode === 'External' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {event.registrationMode === 'External' ? 'External' : 'Internal'}
                    </span>
                  </div>
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
                    <span className="truncate max-w-[100px]">{event.location}</span>
                  </div>
                  <div className="event-meta-item">
                    <Users size={12} />
                    <span>{event.attendees} registered</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted">No events found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setStep(1); }} title={`Créer un Événement (Étape ${step}/${TOTAL_STEPS})`} size="lg">
         <div className="p-6 h-[600px] overflow-y-auto w-full relative">
            <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8 relative overflow-hidden">
               <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}></div>
            </div>

            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold mb-1">Informations Générales</h3>
                <p className="text-sm text-slate-500 mb-6">Les éléments clés de votre événement.</p>

                <div className="form-group mb-6">
                   <label className="label">Bannière</label>
                   <label className="upload-box relative" style={{ cursor: 'pointer', overflow: 'hidden', padding: newEventImagePreview ? 0 : undefined, display: 'flex', borderRadius: 16 }}>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      {newEventImagePreview ? (
                        <img src={newEventImagePreview} alt="Preview" className="w-full h-full object-cover" style={{ minHeight: 180 }} />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full min-h-[180px] bg-slate-50/50 hover:bg-slate-50 transition border rounded-2xl border-dashed">
                          <Upload size={32} className="text-primary mb-3" />
                          <p className="text-sm font-semibold text-primary">Cliquer pour uploader</p>
                          <p className="text-xs text-muted mt-1">Format suggéré : 1080x1080 (PNG, JPG)</p>
                        </div>
                      )}
                   </label>
                </div>

                <div className="form-group mb-4">
                   <label className="label">Nom de l'événement</label>
                   <input type="text" className="input bg-slate-50" placeholder="Ex: Lomé DevOps Summit" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} />
                </div>
                
                <div className="grid-2 gap-4 mb-4">
                   <div className="form-group">
                      <label className="label">Organisateur / Communauté</label>
                      <input type="text" className="input bg-slate-50" placeholder="Ex: Google Devs" value={newEventOrganizer} onChange={e => setNewEventOrganizer(e.target.value)} />
                   </div>
                   <div className="form-group">
                      <label className="label">Catégorie</label>
                      <select className="input bg-slate-50" value={newEventCategory} onChange={e => setNewEventCategory(e.target.value)}>
                         <option>Tech & Development</option>
                         <option>Business & Startups</option>
                         <option>Web3 & Crypto</option>
                         <option>Innovation & Fintech</option>
                      </select>
                   </div>
                </div>

                <div className="form-group mb-4">
                   <label className="label">Description Complète</label>
                   <textarea className="input bg-slate-50 min-h-[120px] py-3" placeholder="Parlez-nous de l'événement..." value={newEventDescription} onChange={e => setNewEventDescription(e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold mb-1">Date & Horaire</h3>
                <p className="text-sm text-slate-500 mb-6">Planifiez le lancement.</p>

                <div className="grid-2 gap-6 mb-6">
                   <div className="form-group">
                      <label className="label">Date & Heure de début</label>
                      <div className="flex gap-2">
                        <input type="date" className="input bg-slate-50" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} />
                        <input type="time" className="input bg-slate-50" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} />
                      </div>
                   </div>
                   <div className="form-group">
                      <label className="label">Date & Heure de fin</label>
                      <div className="flex gap-2">
                        <input type="date" className="input bg-slate-50" value={newEventEndDate} onChange={e => setNewEventEndDate(e.target.value)} />
                        <input type="time" className="input bg-slate-50" value={newEventEndTime} onChange={e => setNewEventEndTime(e.target.value)} />
                      </div>
                   </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold mb-1">Type d'Événement</h3>
                <p className="text-sm text-slate-500 mb-6">Où se déroule l'événement ?</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[{ id: 'in-person', title: 'Présentiel', icon: <MapPin/> }, { id: 'online', title: 'En ligne', icon: <Users/> }, { id: 'hybrid', title: 'Hybride', icon: <ShieldAlert/> }].map(type => (
                    <div key={type.id} onClick={() => setNewEventType(type.id as any)} className={`p-4 border-2 rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors ${newEventType === type.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {type.icon}
                      <span className="font-bold text-sm">{type.title}</span>
                    </div>
                  ))}
                </div>

                {(newEventType === 'in-person' || newEventType === 'hybrid') && (
                  <div className="form-group mb-4">
                     <label className="label">Lieu et Adresse</label>
                     <input type="text" className="input bg-slate-50" placeholder="Ex: Hôtel 2 Février, Lomé" value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} />
                  </div>
                )}

                {(newEventType === 'online' || newEventType === 'hybrid') && (
                  <div className="form-group mb-4">
                     <label className="label">Lien du meeting (Google Meet, Teams)</label>
                     <input type="text" className="input bg-slate-50" placeholder="https://..." value={newEventMeetingLink} onChange={e => setNewEventMeetingLink(e.target.value)} />
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold mb-1">Inscriptions</h3>
                <p className="text-sm text-slate-500 mb-6">Gérez comment les participants s'inscrivent.</p>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-6 border border-slate-200">
                  <div>
                    <h4 className="font-bold text-sm">Site Web Externe</h4>
                    <p className="text-xs text-slate-500">Cochez si vous utilisez Eventbrite, Meetup etc.</p>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" checked={newEventIsExternal} onChange={e => setNewEventIsExternal(e.target.checked)} />
                </div>

                {newEventIsExternal ? (
                  <div className="form-group mb-4">
                     <label className="label">URL d'inscription externe</label>
                     <input type="url" className="input bg-slate-50" placeholder="https://..." value={newEventExternalLink} onChange={e => setNewEventExternalLink(e.target.value)} />
                  </div>
                ) : (
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col items-center justify-center text-center">
                    <CheckCircle className="text-emerald-500 mb-3" size={32} />
                    <h4 className="font-bold text-emerald-800">Inscription Native Active</h4>
                    <p className="text-sm text-emerald-600 mt-1">Vos participants s'inscriront en un clic depuis votre application EventHub.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-8 pt-4">
               <button className="btn btn-ghost bg-slate-100 hover:bg-slate-200 px-6" onClick={() => step === 1 ? setIsCreateModalOpen(false) : setStep(step - 1)} disabled={creating}>
                 {step === 1 ? 'Annuler' : 'Précédent'}
               </button>
               {step < TOTAL_STEPS ? (
                 <button className="btn btn-primary px-8" onClick={() => setStep(step + 1)}>
                   Suivant
                 </button>
               ) : (
                 <button className="btn btn-primary px-8 bg-emerald-600 hover:bg-emerald-700 border-none" onClick={handleCreateEvent} disabled={creating}>
                   {creating ? <Loader2 size={16} className="animate-spin" /> : 'Publier Événement'}
                 </button>
               )}
            </div>
         </div>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details" size="lg">
         {selectedEvent && (
            <div className="event-details-modal">
               <div className="event-detail-banner">
                  {(selectedEvent as any).imageUrl || (selectedEvent as any).image ? (
                     <img src={(selectedEvent as any).imageUrl || (selectedEvent as any).image} alt="" className="event-banner-img" />
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
