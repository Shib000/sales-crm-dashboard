import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dataService } from '../services/dataService'
import './Profile.css'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (user) {
      const userData = dataService.getUser(user.id)
      setProfile(userData)

      if (user.role === 'executive') {
        const leads = dataService.getLeads().filter(l => l.assignedExecutiveId === user.id)
        const visits = dataService.getVisits().filter(v => v.executiveId === user.id)
        const bookings = dataService.getBookings().filter(b => b.executiveId === user.id)
        const revenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0)
        const conversionRate = leads.length > 0
          ? ((bookings.length / leads.length) * 100).toFixed(1)
          : 0

        setStats({
          totalLeads: leads.length,
          totalVisits: visits.length,
          totalBookings: bookings.length,
          revenue,
          conversionRate: parseFloat(conversionRate)
        })
      }
    }
  }, [user])

  if (!profile) return <div>Loading...</div>

  const getSiteName = (siteId) => {
    if (!siteId) return 'Not assigned'
    const site = dataService.getSite(siteId)
    return site?.name || 'Unknown'
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{profile.name}</h2>
            <span className="role-badge">{profile.role}</span>
          </div>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <label>Email</label>
            <p>{profile.email}</p>
          </div>

          <div className="info-item">
            <label>Role</label>
            <p className="capitalize">{profile.role}</p>
          </div>

          {profile.role === 'executive' && (
            <div className="info-item">
              <label>Assigned Site</label>
              <p>{getSiteName(profile.assignedSiteId)}</p>
            </div>
          )}
        </div>

        {stats && (
          <div className="profile-stats">
            <h3>My Performance</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-number">{stats.totalLeads}</span>
                <span className="stat-text">Leads Generated</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.totalVisits}</span>
                <span className="stat-text">Site Visits</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.totalBookings}</span>
                <span className="stat-text">Bookings Closed</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.conversionRate}%</span>
                <span className="stat-text">Conversion Rate</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">₹{(stats.revenue / 100000).toFixed(1)}L</span>
                <span className="stat-text">Revenue Generated</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



