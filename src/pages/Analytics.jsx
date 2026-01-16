import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dataService } from '../services/dataService'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './Analytics.css'

export default function Analytics() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('all')
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [user, timeRange])

  const loadAnalytics = () => {
    const leads = dataService.getLeads()
    const visits = dataService.getVisits()
    const bookings = dataService.getBookings()
    const sites = dataService.getSites()
    const executives = dataService.getUsers().filter(u => u.role === 'executive')

    let filteredLeads = leads
    let filteredVisits = visits
    let filteredBookings = bookings

    if (user?.role === 'executive') {
      filteredLeads = leads.filter(l => l.assignedExecutiveId === user.id)
      filteredVisits = visits.filter(v => v.executiveId === user.id)
      filteredBookings = bookings.filter(b => b.executiveId === user.id)
    }

    // Filter by time range
    const now = new Date()
    let startDate = new Date(0)

    if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    if (timeRange !== 'all') {
      filteredLeads = filteredLeads.filter(l => new Date(l.createdAt) >= startDate)
      filteredVisits = filteredVisits.filter(v => new Date(v.checkinTime) >= startDate)
      filteredBookings = filteredBookings.filter(b => new Date(b.createdAt) >= startDate)
    }

    // Lead status distribution
    const statusData = [
      { name: 'New', value: filteredLeads.filter(l => l.status === 'New').length },
      { name: 'Visit Done', value: filteredLeads.filter(l => l.status === 'Visit Done').length },
      { name: 'Follow-up', value: filteredLeads.filter(l => l.status === 'Follow-up').length },
      { name: 'Booked', value: filteredLeads.filter(l => l.status === 'Booked').length },
      { name: 'Lost', value: filteredLeads.filter(l => l.status === 'Lost').length }
    ]

    // Lead source distribution
    const sourceData = [
      { name: 'Walk-in', value: filteredLeads.filter(l => l.leadSource === 'Walk-in').length },
      { name: 'Campaign', value: filteredLeads.filter(l => l.leadSource === 'Campaign').length },
      { name: 'Referral', value: filteredLeads.filter(l => l.leadSource === 'Referral').length }
    ]

    // Site performance
    const sitePerformance = sites.map(site => {
      const siteLeads = filteredLeads.filter(l => l.siteId === site.id)
      const siteBookings = filteredBookings.filter(b => b.siteId === site.id)
      const siteRevenue = siteBookings.reduce((sum, b) => sum + (b.amount || 0), 0)
      return {
        name: site.name,
        leads: siteLeads.length,
        bookings: siteBookings.length,
        revenue: siteRevenue / 100000 // Convert to lakhs
      }
    })

    // Executive performance
    const executivePerformance = executives.map(exec => {
      const execLeads = filteredLeads.filter(l => l.assignedExecutiveId === exec.id)
      const execBookings = filteredBookings.filter(b => b.executiveId === exec.id)
      const execVisits = filteredVisits.filter(v => v.executiveId === exec.id)
      const conversionRate = execLeads.length > 0
        ? ((execBookings.length / execLeads.length) * 100).toFixed(1)
        : 0
      return {
        name: exec.name,
        leads: execLeads.length,
        visits: execVisits.length,
        bookings: execBookings.length,
        conversionRate: parseFloat(conversionRate)
      }
    })

    // Daily leads trend (last 7 days)
    const dailyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dayLeads = filteredLeads.filter(l => {
        const leadDate = new Date(l.createdAt)
        return leadDate.toDateString() === date.toDateString()
      }).length
      dailyTrend.push({ date: dateStr, leads: dayLeads })
    }

    // Peak visit times (by hour of day)
    const visitHours = Array(24).fill(0)
    filteredVisits.forEach(visit => {
      const hour = new Date(visit.checkinTime).getHours()
      visitHours[hour]++
    })
    const peakVisitTimes = visitHours.map((count, hour) => ({
      hour: `${hour}:00`,
      visits: count
    }))

    // Funnel drop-off analysis
    const funnelData = [
      { stage: 'New', value: filteredLeads.filter(l => l.status === 'New').length },
      { stage: 'Visit Done', value: filteredLeads.filter(l => l.status === 'Visit Done').length },
      { stage: 'Follow-up', value: filteredLeads.filter(l => l.status === 'Follow-up').length },
      { stage: 'Booked', value: filteredLeads.filter(l => l.status === 'Booked').length }
    ]

    // Campaign effectiveness (conversion rate by source)
    const campaignEffectiveness = [
      {
        source: 'Walk-in',
        leads: filteredLeads.filter(l => l.leadSource === 'Walk-in').length,
        bookings: filteredBookings.filter(b => {
          const lead = filteredLeads.find(l => l.id === b.leadId)
          return lead && lead.leadSource === 'Walk-in'
        }).length
      },
      {
        source: 'Campaign',
        leads: filteredLeads.filter(l => l.leadSource === 'Campaign').length,
        bookings: filteredBookings.filter(b => {
          const lead = filteredLeads.find(l => l.id === b.leadId)
          return lead && lead.leadSource === 'Campaign'
        }).length
      },
      {
        source: 'Referral',
        leads: filteredLeads.filter(l => l.leadSource === 'Referral').length,
        bookings: filteredBookings.filter(b => {
          const lead = filteredLeads.find(l => l.id === b.leadId)
          return lead && lead.leadSource === 'Referral'
        }).length
      }
    ].map(item => ({
      ...item,
      conversionRate: item.leads > 0 ? ((item.bookings / item.leads) * 100).toFixed(1) : 0
    }))

    setAnalytics({
      statusData,
      sourceData,
      sitePerformance,
      executivePerformance,
      dailyTrend,
      peakVisitTimes,
      funnelData,
      campaignEffectiveness,
      totalLeads: filteredLeads.length,
      totalVisits: filteredVisits.length,
      totalBookings: filteredBookings.length,
      totalRevenue: filteredBookings.reduce((sum, b) => sum + (b.amount || 0), 0)
    })
  }

  if (!analytics) return <div>Loading...</div>

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics & Insights</h1>
        <div className="time-range-selector">
          <button
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            This Month
          </button>
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            This Week
          </button>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <h3>{analytics.totalLeads}</h3>
          <p>Total Leads</p>
        </div>
        <div className="summary-card">
          <h3>{analytics.totalVisits}</h3>
          <p>Total Visits</p>
        </div>
        <div className="summary-card">
          <h3>{analytics.totalBookings}</h3>
          <p>Total Bookings</p>
        </div>
        <div className="summary-card">
          <h3>₹{(analytics.totalRevenue / 100000).toFixed(1)}L</h3>
          <p>Total Revenue</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Lead Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Lead Source Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.sourceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Daily Leads Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <>
            <div className="chart-card">
              <h3>Site Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.sitePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                  <Bar dataKey="bookings" fill="#10b981" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Executive Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.executivePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                  <Bar dataKey="visits" fill="#f59e0b" name="Visits" />
                  <Bar dataKey="bookings" fill="#10b981" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Executive Conversion Rates</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.executivePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="conversionRate" fill="#8b5cf6" name="Conversion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Peak Visit Times (by Hour)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.peakVisitTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#f59e0b" name="Visits" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Sales Funnel (Drop-off Analysis)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef4444" name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Campaign Effectiveness</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.campaignEffectiveness}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                  <Bar dataKey="bookings" fill="#10b981" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '15px', fontSize: '14px' }}>
                <strong>Conversion Rates:</strong>
                {analytics.campaignEffectiveness.map(item => (
                  <div key={item.source} style={{ marginTop: '5px' }}>
                    {item.source}: {item.conversionRate}%
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
