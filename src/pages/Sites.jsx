import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dataService } from '../services/dataService'
import './Sites.css'

export default function Sites() {
  const { user } = useAuth()
  const [sites, setSites] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingSite, setEditingSite] = useState(null)

  useEffect(() => {
    loadSites()
  }, [])

  const loadSites = () => {
    const allSites = dataService.getSites()
    setSites(allSites)
  }

  const handleCreate = () => {
    setEditingSite(null)
    setShowModal(true)
  }

  const handleEdit = (site) => {
    setEditingSite(site)
    setShowModal(true)
  }

  const handleSave = (siteData) => {
    if (editingSite) {
      dataService.updateSite(editingSite.id, siteData)
    } else {
      dataService.createSite(siteData)
    }
    setShowModal(false)
    loadSites()
  }

  const getSiteStats = (siteId) => {
    const leads = dataService.getLeads().filter(l => l.siteId === siteId)
    const visits = dataService.getVisits().filter(v => v.siteId === siteId)
    const bookings = dataService.getBookings().filter(b => b.siteId === siteId)
    const revenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0)

    return {
      totalLeads: leads.length,
      totalVisits: visits.length,
      totalBookings: bookings.length,
      revenue
    }
  }

  return (
    <div className="sites-page">
      <div className="page-header">
        <h1>Site Management</h1>
        {user?.role === 'admin' && (
          <button onClick={handleCreate} className="btn-primary">
            + New Site
          </button>
        )}
      </div>

      <div className="sites-grid">
        {sites.map(site => {
          const stats = getSiteStats(site.id)
          return (
            <div key={site.id} className="site-card">
              <div className="site-header">
                <h3>{site.name}</h3>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleEdit(site)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              <div className="site-location">
                <p><strong>Location:</strong> {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}</p>
                <p><strong>Radius:</strong> {site.radius}m</p>
              </div>

              <div className="site-stats">
                <div className="stat-item">
                  <span className="stat-value">{stats.totalLeads}</span>
                  <span className="stat-label">Leads</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.totalVisits}</span>
                  <span className="stat-label">Visits</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.totalBookings}</span>
                  <span className="stat-label">Bookings</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">₹{(stats.revenue / 100000).toFixed(1)}L</span>
                  <span className="stat-label">Revenue</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <SiteModal
          site={editingSite}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function SiteModal({ site, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: site?.name || '',
    latitude: site?.latitude || '',
    longitude: site?.longitude || '',
    radius: site?.radius || 500
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius: parseInt(formData.radius)
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{site ? 'Edit Site' : 'New Site'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Site Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Latitude *</label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Longitude *</label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Radius (meters) *</label>
            <input
              type="number"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              required
              min="100"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

