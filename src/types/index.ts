// ── User ──
export interface User {
  id: string
  name: string
  email: string
  role: 'ORGANIZER' | 'USER' | 'ADMIN'
  status: 'Active' | 'Suspended' | 'Pending'
  avatar?: string
  joinedAt: string
}

// ── Event ──
export type EventStatus = 'Live' | 'Upcoming' | 'Pending' | 'Flagged' | 'Past' | 'Cancelled'
export interface Event {
  id: string
  title: string
  organizer: string
  location: string
  date: string
  endDate?: string
  category: string
  status: EventStatus
  attendees: number
  description?: string
  registrationMode: 'Internal' | 'External'
  participationMode: 'Online' | 'InPlace'
  image?: string
  flagReason?: string
  externalLink?: string
}

// ── Activity ──
export type ActivityType = 'organizer' | 'event' | 'warning' | 'campaign'
export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  createdAt: string
}

// ── Stats ──
export interface DashboardStats {
  totalEvents: number
  activeEvents: number
  pendingEvents: number
  totalRevenue: number
  ticketSales: number
  totalUsers: number
  newUsersThisWeek: number
  verifiedOrganizers: number
  pendingReviews: number
  suspendedUsers: number
  growth: number
}

// ── Chart ──
export interface ChartDataPoint {
  month: string
  value: number
}

// ── Financial ──
export interface Transaction {
  id: string
  event: string
  organizer: string
  amount: number
  date: string
  status: 'Completed' | 'Pending' | 'Refunded'
}
