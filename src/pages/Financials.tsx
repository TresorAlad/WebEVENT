import { useState, useMemo, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  DollarSign, TrendingUp, Download, CreditCard, RefreshCcw, Search, Filter
} from 'lucide-react'
import { getDashboardStats, getTransactions, getRevenueGrowth } from '../services/api'
import type { Transaction, DashboardStats, ChartDataPoint } from '../types'

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
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [revenueByMonth, setRevenueByMonth] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, txsData, revData] = await Promise.all([
          getDashboardStats(),
          getTransactions(),
          getRevenueGrowth()
        ])
        setStats(statsData)
        setTransactions(txsData)
        setRevenueByMonth(revData)
      } catch (error) {
        console.error('Error fetching financial data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx =>
      tx.event.toLowerCase().includes(search.toLowerCase()) ||
      tx.organizer.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, transactions])

  if (loading || !stats) {
    return <div className="p-8">Loading financial data...</div> // Or a more complex skeleton
  }

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
              <TrendingUp size={11} /> +{stats.growth}%
            </span>
          </div>
          <p className="stat-card-label">TOTAL REVENUE (FCFA)</p>
          <p className="stat-card-value">{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-muted mt-2">Cumulative revenue from ticket sales</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <p className="stat-card-label">TICKET SALES</p>
          <p className="stat-card-value">{(stats.ticketSales / 1000).toFixed(1)}K</p>
          <p className="text-xs text-muted mt-2">Total tickets sold across all events</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <RefreshCcw size={20} />
            </div>
          </div>
          <p className="stat-card-label">ORGANIZER PAYOUTS</p>
          <p className="stat-card-value">{((stats.totalRevenue * 0.8) / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-muted mt-2">Estimated transfers (80% of revenue)</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card mb-6">
        <p className="chart-section-title">Revenue Trends</p>
        <p className="text-xs text-muted mb-6">Monthly revenue performance across the platform</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueByMonth} barCategoryGap="30%">
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
                  <td className="font-semibold text-primary">{tx.id.substring(0, 8)}...</td>
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
                    No transactions found
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
