import { useState, useMemo, useEffect } from 'react'
import { Search, SlidersHorizontal, Plus, MoreVertical, MapPin, Users, CheckCircle, Clock, Flag, Archive, Calendar as CalendarIcon, Upload, ShieldAlert, BadgeCheck, Loader2 } from 'lucide-react'
import { getAllEvents, createEvent } from '../services/api'
import type { EventStatus, Event } from '../types'
import Modal from '../components/ui/Modal'
import { useNotification } from '../components/ui/NotificationProvider'
import Skeleton from '../components/ui/Skeleton'

const tabs: { label: string; status: EventStatus | 'All' }[] = [
  { label: 'Tous', status: 'All' },
  { label: 'En attente', status: 'Pending' },
  { label: 'En direct', status: 'Live' },
  { label: 'Signalés', status: 'Flagged' },
  { label: 'Passés', status: 'Past' },
]

const statusConfig: Record<EventStatus, { label: string; cls: string }> = {
  Live:      { label: 'LIVE',        cls: 'badge-live' },
  Upcoming:  { label: 'À VENIR',     cls: 'badge-pending' },
  Pending:   { label: 'EN ATTENTE',  cls: 'badge-pending' },
  Flagged:   { label: 'SIGNALÉ',     cls: 'badge-flagged' },
  Past:      { label: 'PASSÉ',       cls: 'badge-neutral' },
  Cancelled: { label: 'ANNULÉ',      cls: 'badge-neutral' },
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
      notify('Veuillez remplir les champs obligatoires')
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
      formData.append('description', newEventDescription || 'Un nouvel événement.')
      formData.append('participationMode', newEventType === 'online' ? 'Online' : 'InPlace')
      formData.append('registrationMode', newEventIsExternal ? 'External' : 'Internal')
      if (newEventIsExternal && newEventExternalLink) {
        formData.append('externalLink', newEventExternalLink)
      }
      if (newEventImage) {
        formData.append('image', newEventImage)
      }
      
      await createEvent(formData)
      notify('Événement créé avec succès')
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
        organizer: e.organizer?.name || 'Organisateur Inconnu',
        attendees: e._count?.participants || 0
      })))
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error)
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
    const actionsFr: any = { approved: 'approuvé', flagged: 'signalé', archived: 'archivé' }
    notify(`Événement ${actionsFr[action] || action} avec succès !`)
    setOpenMenu(null)
  }

  return (
    <div className="events-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Gestion des Événements</h1>
          <p>Gérez, approuvez et surveillez tous les événements de l'écosystème au Togo.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" id="events-filter-btn">
            <SlidersHorizontal size={15} />
            Filtres Avancés
          </button>
          <button className="btn btn-primary" id="events-create-btn" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={15} />
            Créer un Événement
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
            placeholder="Rechercher des événements, organisateurs, ou IDs..."
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
            const endDate = event.endDate ? new Date(event.endDate) : null;

            if (currentStatus === 'Upcoming' || currentStatus === 'Live') {
              if (now < startDate) {
                currentStatus = 'Upcoming';
              } else if (endDate && now > endDate) {
                currentStatus = 'Past';
              } else {
                currentStatus = 'Live';
              }
            }

            const sc = statusConfig[currentStatus] || { label: 'INCONNU', cls: 'badge-neutral' }
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
                    {event.participationMode === 'Online' ? 'EN LIGNE' : 'PRÉSENTIEL'}
                  </span>
                </div>
              </div>
              <div className="event-card-body">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <p className="event-card-category">{event.category}</p>
                    <span className={`text-xs px-2 py-05 rounded-full ${event.registrationMode === 'External' ? 'badge-reg-external' : 'badge-reg-internal'}`}>
                      {event.registrationMode === 'External' ? 'Externe' : 'Interne'}
                    </span>
                  </div>
                  <div className="dropdown" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setOpenMenu(openMenu === event.id ? null : event.id)}>
                      <MoreVertical size={14} />
                    </button>
                    {openMenu === event.id && (
                      <div className="dropdown-menu">
                        <button className="dropdown-item" onClick={(e) => handleAction(e, 'approved')}><CheckCircle size={14}/> Approuver</button>
                        <button className="dropdown-item" onClick={(e) => handleAction(e, 'flagged')}><Flag size={14}/> Signaler</button>
                        <button className="dropdown-item danger" onClick={(e) => handleAction(e, 'archived')}><Archive size={14}/> Archiver</button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-organizer">par {event.organizer}</p>
                
                <div className="event-card-meta mt-4">
                  <div className="event-meta-item">
                    <MapPin size={12} />
                    <span className="truncate max-w-xs">{event.location}</span>
                  </div>
                  <div className="event-meta-item">
                    <Users size={12} />
                    <span>{event.attendees} inscrits</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted">Aucun événement ne correspond à vos critères.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setStep(1); }} title={`Créer un Événement (Étape ${step}/${TOTAL_STEPS})`} size="lg">
        <div className="modal-step-inner">
          <div className="step-progress-track">
            <div className="step-progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>

          {step === 1 && (
            <div className="step-content">
              <h3 className="text-xl font-bold mb-1">Informations générales</h3>
              <p className="text-sm text-secondary mb-6">Les éléments clés de votre événement.</p>

              <div className="form-group mb-6">
                <label className="label">Bannière</label>
                <label className={`upload-box${newEventImagePreview ? ' upload-box--has-image' : ''}`}>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  {newEventImagePreview ? (
                    <img src={newEventImagePreview} alt="Aperçu" className="w-full h-full object-cover min-h-180" />
                  ) : (
                    <div className="upload-zone-empty">
                      <Upload size={32} className="text-primary mb-3" />
                      <p className="text-sm font-semibold text-primary">Cliquer pour téléverser</p>
                      <p className="text-xs text-muted mt-2">Format suggéré : 1080×1080 (PNG, JPG)</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="form-group mb-4">
                <label className="label">Nom de l&apos;événement</label>
                <input type="text" className="input input-bg-muted" placeholder="Ex. : Lomé DevOps Summit" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} />
              </div>

              <div className="grid-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="label">Organisateur / communauté</label>
                  <input type="text" className="input input-bg-muted" placeholder="Ex. : Google Devs" value={newEventOrganizer} onChange={e => setNewEventOrganizer(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label">Catégorie</label>
                  <select className="input input-bg-muted" value={newEventCategory} onChange={e => setNewEventCategory(e.target.value)}>
                    <option>Tech &amp; développement</option>
                    <option>Business &amp; startups</option>
                    <option>Web3 &amp; crypto</option>
                    <option>Innovation &amp; fintech</option>
                  </select>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="label">Description complète</label>
                <textarea className="input input-bg-muted min-h-120 py-3" placeholder="Parlez-nous de l&apos;événement…" value={newEventDescription} onChange={e => setNewEventDescription(e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h3 className="text-xl font-bold mb-1">Date et horaire</h3>
              <p className="text-sm text-secondary mb-6">Planifiez le lancement.</p>

              <div className="grid-2 gap-6 mb-6">
                <div className="form-group">
                  <label className="label">Date et heure de début</label>
                  <div className="flex gap-2">
                    <input type="date" className="input input-bg-muted" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} />
                    <input type="time" className="input input-bg-muted" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Date et heure de fin</label>
                  <div className="flex gap-2">
                    <input type="date" className="input input-bg-muted" value={newEventEndDate} onChange={e => setNewEventEndDate(e.target.value)} />
                    <input type="time" className="input input-bg-muted" value={newEventEndTime} onChange={e => setNewEventEndTime(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3 className="text-xl font-bold mb-1">Type d&apos;événement</h3>
              <p className="text-sm text-secondary mb-6">Où se déroule l&apos;événement ?</p>

              <div className="event-type-grid">
                {[{ id: 'in-person', title: 'Présentiel', icon: <MapPin /> }, { id: 'online', title: 'En ligne', icon: <Users /> }, { id: 'hybrid', title: 'Hybride', icon: <ShieldAlert /> }].map(type => (
                  <div
                    key={type.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setNewEventType(type.id as 'in-person' | 'online' | 'hybrid') } }}
                    onClick={() => setNewEventType(type.id as 'in-person' | 'online' | 'hybrid')}
                    className={`event-type-card${newEventType === type.id ? ' active' : ''}`}
                  >
                    {type.icon}
                    <span className="font-bold text-sm">{type.title}</span>
                  </div>
                ))}
              </div>

              {(newEventType === 'in-person' || newEventType === 'hybrid') && (
                <div className="form-group mb-4">
                  <label className="label">Lieu et adresse</label>
                  <input type="text" className="input input-bg-muted" placeholder="Ex. : Hôtel 2 Février, Lomé" value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} />
                </div>
              )}

              {(newEventType === 'online' || newEventType === 'hybrid') && (
                <div className="form-group mb-4">
                  <label className="label">Lien de visioconférence (Meet, Teams…)</label>
                  <input type="text" className="input input-bg-muted" placeholder="https://…" value={newEventMeetingLink} onChange={e => setNewEventMeetingLink(e.target.value)} />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="step-content">
              <h3 className="text-xl font-bold mb-1">Inscriptions</h3>
              <p className="text-sm text-secondary mb-6">Définissez comment les participants s&apos;inscrivent.</p>

              <div className="registration-toggle-row">
                <div>
                  <h4 className="font-bold text-sm">Site web externe</h4>
                  <p className="text-xs text-secondary">Cochez si vous utilisez Eventbrite, Meetup, etc.</p>
                </div>
                <input type="checkbox" className="event-registration-checkbox" checked={newEventIsExternal} onChange={e => setNewEventIsExternal(e.target.checked)} aria-label="Inscription sur site externe" />
              </div>

              {newEventIsExternal ? (
                <div className="form-group mb-4">
                  <label className="label">URL d&apos;inscription externe</label>
                  <input type="url" className="input input-bg-muted" placeholder="https://…" value={newEventExternalLink} onChange={e => setNewEventExternalLink(e.target.value)} />
                </div>
              ) : (
                <div className="registration-native-panel">
                  <CheckCircle className="text-success mb-3" size={32} />
                  <h4 className="font-bold text-success">Inscription native active</h4>
                  <p className="text-sm text-secondary mt-2">Les participants s&apos;inscrivent depuis l&apos;application EventHub.</p>
                </div>
              )}
            </div>
          )}

          <div className="modal-step-actions">
            <button type="button" className="btn btn-muted-ghost px-6" onClick={() => (step === 1 ? setIsCreateModalOpen(false) : setStep(step - 1))} disabled={creating}>
              {step === 1 ? 'Annuler' : 'Précédent'}
            </button>
            {step < TOTAL_STEPS ? (
              <button type="button" className="btn btn-primary px-8" onClick={() => setStep(step + 1)}>
                Suivant
              </button>
            ) : (
              <button type="button" className="btn btn-success px-8" onClick={handleCreateEvent} disabled={creating}>
                {creating ? <Loader2 size={16} className="animate-spin" /> : 'Publier l&apos;événement'}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Détails de l'Événement" size="lg">
         {selectedEvent && (
            <div className="event-details-modal">
               <div className="event-detail-banner">
                  {(selectedEvent as any).imageUrl || (selectedEvent as any).image ? (
                     <img src={(selectedEvent as any).imageUrl || (selectedEvent as any).image} alt="" className="event-banner-img" />
                  ) : (
                     <div className="event-banner-img placeholder-img" />
                  )}
                  <span className={`badge ${statusConfig[selectedEvent.status].cls} banner-badge`}>
                     {statusConfig[selectedEvent.status].label}
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
                        <p className="text-sm font-bold text-muted uppercase tracking-wider">Participants estimés</p>
                        <p className="text-2xl font-black text-primary">{selectedEvent.attendees}</p>
                     </div>
                  </div>

                  <div className="grid-3 gap-6 mb-8">
                     <div className="info-box">
                        <CalendarIcon size={18} className="text-primary" />
                        <div>
                           <p className="text-xs text-muted font-bold">DATE</p>
                           <p className="font-bold">{new Date(selectedEvent.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                     </div>
                     <div className="info-box">
                        <Clock size={18} className="text-warning" />
                        <div>
                           <p className="text-xs text-muted font-bold">HEURE</p>
                           <p className="font-bold">{new Date(selectedEvent.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                     </div>
                     <div className="info-box">
                        <Users size={18} className="text-success" />
                        <div>
                           <p className="text-xs text-muted font-bold">ORGANISATEUR</p>
                           <p className="font-bold">{selectedEvent.organizer}</p>
                        </div>
                     </div>
                  </div>

                  <div className="divider" />

                  <div className="mt-8">
                     <h4 className="font-bold mb-4">Description de l'Événement</h4>
                     <p className="text-muted leading-relaxed">
                        {selectedEvent.description || `Ceci est un événement technologique majeur au Togo. Il se concentre sur les dernières tendances en ${selectedEvent.category} et rassemble des experts, des développeurs et des entrepreneurs pour une journée d'apprentissage et de réseautage à ${selectedEvent.location}.`}
                     </p>
                  </div>

                  {selectedEvent.status === 'Flagged' && (
                     <div className="warning-panel mt-8">
                        <ShieldAlert size={20} className="text-danger" />
                        <div>
                           <p className="font-bold text-danger">Alerte de Sécurité</p>
                           <p className="text-sm text-danger opacity-80">{selectedEvent.flagReason || 'Cet événement a été signalé pour violation des règles.'}</p>
                        </div>
                     </div>
                  )}

                  <div className="modal-footer mt-10 flex flex-wrap items-center justify-between gap-3">
                     <button type="button" className="btn btn-ghost" onClick={() => setSelectedEvent(null)}>Fermer</button>
                     <div className="flex gap-3">
                        {selectedEvent.status === 'Pending' && (
                           <button className="btn btn-success" onClick={() => { notify('Événement approuvé'); setSelectedEvent(null); }}>
                              <BadgeCheck size={16} /> Approuver l'Événement
                           </button>
                        )}
                        <button className="btn btn-danger-outline" onClick={() => { notify('Événement signalé'); setSelectedEvent(null); }}>
                           <ShieldAlert size={16} /> Signaler le contenu
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
