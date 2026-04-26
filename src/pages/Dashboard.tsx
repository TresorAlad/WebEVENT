import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  Download, TrendingUp, Calendar, AlertTriangle,
  CheckCircle, Megaphone, UserPlus, ArrowUpRight, Clock,
} from 'lucide-react'
import { mockStats, mockUserGrowth, mockActivity, mockEvents } from '../services/mockData'
import type { ActivityItem } from '../types'
import Skeleton from '../components/ui/Skeleton'

// ── Custom Bar Shape (rounded top) ──
const RoundedBar = (props: any) => {
  const { x, y, width, height, fill } = props
  const r = 6
  if (height <= 0) return null
  return (
    <path
      d={`M${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} L${x},${y + height} Z`}
      fill={fill}
    />
  )
}

const activityConfig: Record<ActivityItem['type'], { Icon: any; color: string; bg: string }> = {
  organizer: { Icon: UserPlus,     color: '#2dc653', bg: '#e6f9ed' },
  event:     { Icon: CheckCircle,  color: '#2dc653', bg: '#e6f9ed' },
  warning:   { Icon: AlertTriangle,color: '#e63946', bg: '#fdecea' },
  campaign:  { Icon: Megaphone,    color: '#7b2d8b', bg: '#f5edf7' },
}

const peakIndex = mockUserGrowth.findIndex(d => d.month === 'JUL')

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        <p className="chart-tooltip-value">{payload[0].value.toLocaleString()} users</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [activeChartIdx, setActiveChartIdx] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const liveEvents = mockEvents.filter(e => e.status === 'Live').slice(0, 2)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-header">
          <div className="page-header-info">
            <Skeleton width={300} height={32} />
            <Skeleton width={200} height={16} className="mt-2" />
          </div>
        </div>
        <div className="dashboard-top-row">
          <Skeleton height={200} />
          <Skeleton height={200} />
        </div>
        <div className="dashboard-bottom-row">
          <Skeleton height={400} />
          <Skeleton height={400} />
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="page-header-info">
          <h1>Lomé Tech Excellence Hub</h1>
          <p>Real-time overview of the ecosystem's performance</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" id="export-report-btn">
            <Download size={15} />
            Export Report
          </button>
        </div>
      </div>

      <div className="dashboard-top-row">
        <div className="stat-card stat-card-total">
          <div className="stat-card-header">
            <div className="stat-card-icon">
              <Calendar size={20} />
            </div>
            <span className="stat-pill up">
              <TrendingUp size={11} />
              +{mockStats.growth}%
            </span>
          </div>
          <p className="stat-card-label">TOTAL EVENTS MANAGED</p>
          <p className="stat-card-value">{mockStats.totalEvents.toLocaleString()}</p>
          <div className="stat-card-sub">
            <div className="stat-sub-item">
              <span className="stat-sub-label">ACTIVE</span>
              <span className="stat-sub-value">{mockStats.activeEvents}</span>
            </div>
            <div className="stat-sub-item">
              <span className="stat-sub-label">PENDING</span>
              <span className="stat-sub-value">{mockStats.pendingEvents}</span>
            </div>
          </div>
        </div>

        <div className="card user-growth-card">
          <div className="user-growth-header">
            <div>
              <p className="user-growth-title">User Growth</p>
              <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                Monthly acquisition trends in Lomé
              </p>
            </div>
            <span className="badge badge-primary">12 Months</span>
          </div>
          <div className="user-growth-chart">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={mockUserGrowth}
                barCategoryGap="20%"
                onMouseLeave={() => setActiveChartIdx(null)}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgba(202,240,248,0.6)', fontSize: 10, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar
                  dataKey="value"
                  shape={<RoundedBar />}
                  onMouseEnter={(_: unknown, index: number) => setActiveChartIdx(index)}
                >
                  {mockUserGrowth.map((_, index: number) => (
                    <Cell
                      key={index}
                      fill={
                        index === peakIndex
                          ? '#ffffff'
                          : activeChartIdx === index
                          ? 'rgba(202,240,248,0.7)'
                          : 'rgba(202,240,248,0.35)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-peak-label" style={{ left: `${(peakIndex / mockUserGrowth.length) * 100 + 3}%` }}>
              Peak
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-row">
        <div className="card revenue-card">
          <div className="revenue-header">
            <div>
              <p className="revenue-title">Revenue Overview</p>
            </div>
            <button className="btn btn-ghost text-sm" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Details <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="revenue-metrics">
            <div className="revenue-metric">
              <p className="revenue-metric-label">NET INCOME (FCFA)</p>
              <div className="revenue-metric-value-row">
                <span className="revenue-metric-value">42.5M</span>
                <span className="stat-pill up"><TrendingUp size={10} /> +8.1%</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: '72%' }} />
              </div>
            </div>
            <div className="revenue-metric">
              <p className="revenue-metric-label">TICKET SALES</p>
              <div className="revenue-metric-value-row">
                <span className="revenue-metric-value">8.2K</span>
                <span className="stat-pill stable">Stable</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: '55%' }} />
              </div>
            </div>
          </div>
          <div className="event-cards-mini">
            {liveEvents.map(event => (
              <div key={event.id} className="event-card-mini">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="event-card-mini-img" />
                ) : (
                  <div className="event-card-mini-img placeholder-img" />
                )}
                <div className="event-card-mini-info">
                  <p className="event-card-mini-title">{event.title}</p>
                  <p className="event-card-mini-meta">
                    {event.date} • {event.location}
                  </p>
                  <div className="event-card-mini-footer">
                    <div className="attendee-avatars">
                      {[1, 2, 3].map(i => (
                        <img
                          key={i}
                          src={`https://i.pravatar.cc/28?img=${i + event.attendees % 10}`}
                          alt="attendee"
                          className="attendee-avatar"
                        />
                      ))}
                      <span className="attendee-count">+{event.attendees}</span>
                    </div>
                    <span className={`badge ${event.status === 'Live' ? 'badge-live' : 'badge-pending'}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card activity-card">
          <div className="activity-header">
            <p className="activity-title">Recent Activity</p>
            <button className="topbar-icon-btn" aria-label="Activity history" style={{ width: 30, height: 30 }}>
              <Clock size={15} />
            </button>
          </div>
          <div className="activity-list">
            {mockActivity.map((item: ActivityItem) => {
              const { Icon, color, bg } = activityConfig[item.type]
              return (
                <div key={item.id} className="activity-item">
                  <div className="activity-icon" style={{ background: bg, color }}>
                    <Icon size={14} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-item-title">{item.title}</p>
                    <p className="activity-item-desc">{item.description}</p>
                    <p className="activity-item-time">{item.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--primary)', fontWeight: 600, marginTop: 4 }}>
            View All System Logs
          </button>
        </div>
      </div>
    </div>
  )
}
