import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell,
} from 'recharts'
import { TrendingUp, Eye, MousePointerClick, Share2, Activity } from 'lucide-react'
import { mockUserGrowth, mockRevenueByMonth } from '../services/mockData'

const engagementData = [
  { label: 'Event Views', value: 124800, icon: Eye, color: 'var(--primary)' },
  { label: 'Ticket Clicks', value: 38200, icon: MousePointerClick, color: 'var(--primary-600)' },
  { label: 'Social Shares', value: 9120, icon: Share2, color: 'var(--success)' },
  { label: 'Active Sessions', value: 2340, icon: Activity, color: 'var(--warning)' },
]

const popularEvents = [
  { title: 'Lomé Web3 Summit 2026', category: 'WEB3', views: 18400, tickets: 320 },
  { title: 'DevFest Lomé 2026', category: 'TECH', views: 14200, tickets: 680 },
  { title: 'Lomé Crypto Summit', category: 'FINTECH', views: 11600, tickets: 120 },
  { title: 'Founders Night', category: 'NETWORKING', views: 9800, tickets: 45 },
  { title: 'Exclusive Startup Gala', category: 'BUSINESS', views: 8200, tickets: 450 },
]

const combinedData = mockUserGrowth.map((d, i: number) => ({
  month: d.month,
  users: d.value,
  revenue: Math.round(mockRevenueByMonth[i]?.value / 100000) || 0,
}))

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontWeight: 600, fontSize: 12 }}>
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Analytics() {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="page-header-info">
          <h1>Post Analytics</h1>
          <p>Track growth, engagement and performance across the platform.</p>
        </div>
        <div className="page-header-actions">
          {['7d', '30d', '3m', '12m'].map(p => (
            <button key={p} className={`period-btn${p === '12m' ? ' active' : ''}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Engagement Cards */}
      <div className="grid-4 mb-6">
        {engagementData.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card engagement-card">
            <div className="engagement-icon" style={{ background: `${color}15`, color }}>
              <Icon size={20} />
            </div>
            <p className="engagement-value">{value.toLocaleString()}</p>
            <p className="engagement-label">{label}</p>
            <div className="stat-pill up" style={{ marginTop: 6, width: 'fit-content' }}>
              <TrendingUp size={10} /> +{(Math.random() * 10 + 2).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="analytics-charts-row">
        {/* Growth Chart */}
        <div className="card">
          <p className="chart-section-title">User & Revenue Growth</p>
          <p className="text-xs text-muted mb-4">Monthly trends across the platform</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Line type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 3 }} name="Users" />
              <Line type="monotone" dataKey="revenue" stroke="var(--primary-400)" strokeWidth={2.5} dot={{ fill: 'var(--primary-400)', r: 3 }} name="Revenue (x100k)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart by month */}
        <div className="card">
          <p className="chart-section-title">Monthly Ticket Sales</p>
          <p className="text-xs text-muted mb-4">Volume of tickets sold per month</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mockRevenueByMonth} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Revenue">
                {mockRevenueByMonth.map((_, i: number) => (
                  <Cell key={i} fill={i === 6 ? 'var(--primary)' : 'var(--primary-100)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Events Table */}
      <div className="card" style={{ marginTop: 'var(--space-5)', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-light)' }}>
          <p className="chart-section-title">Top Performing Events</p>
        </div>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Event</th>
                <th>Category</th>
                <th>Total Views</th>
                <th>Tickets Sold</th>
                <th>Engagement</th>
              </tr>
            </thead>
            <tbody>
              {popularEvents.map((ev, i: number) => (
                <tr key={ev.title}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>0{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{ev.title}</td>
                  <td><span className="badge badge-primary">{ev.category}</span></td>
                  <td>{ev.views.toLocaleString()}</td>
                  <td>{ev.tickets}</td>
                  <td>
                    <div className="progress-bar" style={{ width: 100 }}>
                      <div className="progress-fill" style={{ width: `${(ev.views / 20000) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
