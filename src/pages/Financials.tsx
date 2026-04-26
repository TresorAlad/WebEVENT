import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  DollarSign, TrendingUp, Download, CreditCard, RefreshCcw, Search, Filter
} from 'lucide-react'
import { mockStats, mockRevenueByMonth, mockTransactions } from '../services/mockData'
import type { Transaction } from '../types'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        <p className="chart-tooltip-value">{payload[0].value.toLocaleString()} FCFA</p>
      </div>
    )
  }
  return null
}

export default function Financials() {
  const [search, setSearch] = useState('')

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(tx =>
      tx.event.toLowerCase().includes(search.toLowerCase()) ||
      tx.organizer.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="financials-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Financial Overview</h1>
          <p>Track payments, payouts, and ecosystem revenue in Togo.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" id="export-finance-btn">
            <Download size={15} />
            Export Finance Report
          </button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary)' }}>
              <DollarSign size={20} />
            </div>
            <span className="stat-pill up">
              <TrendingUp size={11} /> +8.1%
            </span>
          </div>
          <p className="stat-card-label">TOTAL REVENUE (FCFA)</p>
          <p className="stat-card-value">{(mockStats.totalRevenue / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-muted mt-2">Cumulative revenue from ticket sales</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <p className="stat-card-label">TICKET SALES</p>
          <p className="stat-card-value">{(mockStats.ticketSales / 1000).toFixed(1)}K</p>
          <p className="text-xs text-muted mt-2">Total tickets sold across all events</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <RefreshCcw size={20} />
            </div>
          </div>
          <p className="stat-card-label">ORGANIZER PAYOUTS</p>
          <p className="stat-card-value">34.2M</p>
          <p className="text-xs text-muted mt-2">Transferred to organizers (last 30 days)</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card mb-6">
        <p className="chart-section-title">Revenue Trends</p>
        <p className="text-xs text-muted mb-6">Monthly revenue performance across the platform</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockRevenueByMonth} barCategoryGap="30%">
            <XAxis
              dataKey="month"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions List with Search */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="chart-section-title">Recent Transactions</p>
          <div className="flex gap-3">
             <div className="topbar-search" style={{ maxWidth: 200 }}>
                <Search size={14} className="topbar-search-icon" />
                <input
                  type="text"
                  className="topbar-search-input"
                  placeholder="Search tx..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '6px 10px 6px 32px', height: 32 }}
                />
             </div>
             <button className="btn btn-ghost btn-sm btn-icon"><Filter size={14} /></button>
          </div>
        </div>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Event</th>
                <th>Organizer</th>
                <th>Amount (FCFA)</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx: Transaction) => (
                <tr key={tx.id}>
                  <td className="font-semibold text-primary">{tx.id}</td>
                  <td className="font-medium">{tx.event}</td>
                  <td>{tx.organizer}</td>
                  <td className="font-bold">{(tx.amount).toLocaleString()}</td>
                  <td>{tx.date}</td>
                  <td>
                    <span className={`badge ${tx.status === 'Completed' ? 'badge-success' : tx.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                    No transactions found for "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
