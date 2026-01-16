import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { dataService } from '../services/dataService'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalVisits: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeLeads: 0,
    conversionRate: 0
  })

  useEffect(() => {
    const leads = dataService.getLeads()
    const visits = dataService.getVisits()
    const bookings = dataService.getBookings()

    let filteredLeads = leads
    let filteredVisits = visits
    let filteredBookings = bookings

    if (user?.role === 'executive') {
      filteredLeads = leads.filter(l => l.assignedExecutiveId === user.id)
      filteredVisits = visits.filter(v => v.executiveId === user.id)
      filteredBookings = bookings.filter(b => b.executiveId === user.id)
    }

    const activeLeads = filteredLeads.filter(l => 
      ['New', 'Visit Done', 'Follow-up'].includes(l.status)
    ).length

    const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.amount || 0), 0)
    const conversionRate = filteredLeads.length > 0 
      ? ((filteredBookings.length / filteredLeads.length) * 100).toFixed(1)
      : 0

    setStats({
      totalLeads: filteredLeads.length,
      totalVisits: filteredVisits.length,
      totalBookings: filteredBookings.length,
      totalRevenue,
      activeLeads,
      conversionRate
    })
  }, [user])

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="welcome-text">Welcome back, {user?.name}!</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon leads">📋</div>
          <div className="stat-content">
            <h3>{stats.totalLeads}</h3>
            <p>Total Leads</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon visits">📍</div>
          <div className="stat-content">
            <h3>{stats.totalVisits}</h3>
            <p>Total Visits</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings">✅</div>
          <div className="stat-content">
            <h3>{stats.totalBookings}</h3>
            <p>Bookings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <h3>₹{(stats.totalRevenue / 100000).toFixed(1)}L</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">🔥</div>
          <div className="stat-content">
            <h3>{stats.activeLeads}</h3>
            <p>Active Leads</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon conversion">📈</div>
          <div className="stat-content">
            <h3>{stats.conversionRate}%</h3>
            <p>Conversion Rate</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <RecentLeads />
        <RecentVisits />
      </div>
    </div>
  )
}

function RecentLeads() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])

  useEffect(() => {
    let allLeads = dataService.getLeads()
    if (user?.role === 'executive') {
      allLeads = allLeads.filter(l => l.assignedExecutiveId === user.id)
    }
    const recent = allLeads
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
    setLeads(recent)
  }, [user])

  return (
    <div className="activity-section">
      <h3>Recent Leads</h3>
      <table className="activity-table">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Source</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id}>
              <td>{lead.clientName}</td>
              <td>{lead.leadSource}</td>
              <td>
                <span className={`status-badge ${lead.status.toLowerCase().replace(' ', '-')}`}>
                  {lead.status}
                </span>
              </td>
              <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecentVisits() {
  const { user } = useAuth()
  const [visits, setVisits] = useState([])

  useEffect(() => {
    let allVisits = dataService.getVisits()
    if (user?.role === 'executive') {
      allVisits = allVisits.filter(v => v.executiveId === user.id)
    }
    const recent = allVisits
      .sort((a, b) => new Date(b.checkinTime) - new Date(a.checkinTime))
      .slice(0, 5)
    setVisits(recent)
  }, [user])

  const getSiteName = (siteId) => {
    const site = dataService.getSite(siteId)
    return site?.name || 'Unknown'
  }

  return (
    <div className="activity-section">
      <h3>Recent Visits</h3>
      <table className="activity-table">
        <thead>
          <tr>
            <th>Site</th>
            <th>Check-in</th>
            <th>Duration</th>
            <th>Verified</th>
          </tr>
        </thead>
        <tbody>
          {visits.map(visit => {
            const duration = visit.checkoutTime
              ? Math.round((new Date(visit.checkoutTime) - new Date(visit.checkinTime)) / 60000)
              : 'Ongoing'
            return (
              <tr key={visit.id}>
                <td>{getSiteName(visit.siteId)}</td>
                <td>{new Date(visit.checkinTime).toLocaleString()}</td>
                <td>{duration} min</td>
                <td>
                  <span className={visit.locationVerified ? 'verified' : 'not-verified'}>
                    {visit.locationVerified ? '✓' : '✗'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}



