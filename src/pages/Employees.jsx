import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dataService } from '../services/dataService'
import './Employees.css'

export default function Employees() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = () => {
    const allUsers = dataService.getUsers()
    const employeeList = allUsers.filter(u => u.role === 'executive' || u.role === 'manager')
    setEmployees(employeeList)
  }

  const handleCreate = () => {
    setEditingEmployee(null)
    setShowModal(true)
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    setShowModal(true)
  }

  const handleSave = (employeeData) => {
    if (editingEmployee) {
      dataService.updateUser(editingEmployee.id, employeeData)
    } else {
      dataService.createUser({
        ...employeeData,
        password: 'password123' // Default password
      })
    }
    setShowModal(false)
    loadEmployees()
  }

  const getEmployeeStats = (employeeId) => {
    const leads = dataService.getLeads().filter(l => l.assignedExecutiveId === employeeId)
    const visits = dataService.getVisits().filter(v => v.executiveId === employeeId)
    const bookings = dataService.getBookings().filter(b => b.executiveId === employeeId)
    const revenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0)
    const conversionRate = leads.length > 0
      ? ((bookings.length / leads.length) * 100).toFixed(1)
      : 0

    // Calculate average time on site
    const employeeVisits = visits.filter(v => v.checkoutTime)
    const totalMinutes = employeeVisits.reduce((sum, v) => {
      return sum + Math.round((new Date(v.checkoutTime) - new Date(v.checkinTime)) / 60000)
    }, 0)
    const avgTimeOnSite = employeeVisits.length > 0
      ? Math.round(totalMinutes / employeeVisits.length)
      : 0

    // Calculate average response time (time between lead creation and first visit)
    let totalResponseTime = 0
    let responseTimeCount = 0
    leads.forEach(lead => {
      const firstVisit = visits
        .filter(v => v.leadId === lead.id)
        .sort((a, b) => new Date(a.checkinTime) - new Date(b.checkinTime))[0]
      if (firstVisit) {
        const responseTime = new Date(firstVisit.checkinTime) - new Date(lead.createdAt)
        totalResponseTime += responseTime
        responseTimeCount++
      }
    })
    const avgResponseTime = responseTimeCount > 0
      ? Math.round(totalResponseTime / responseTimeCount / (1000 * 60 * 60)) // Convert to hours
      : 0

    return {
      totalLeads: leads.length,
      totalVisits: visits.length,
      totalBookings: bookings.length,
      revenue,
      conversionRate: parseFloat(conversionRate),
      avgTimeOnSite,
      avgResponseTime
    }
  }

  const getSiteName = (siteId) => {
    if (!siteId) return 'Not assigned'
    const site = dataService.getSite(siteId)
    return site?.name || 'Unknown'
  }

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Employee Management</h1>
        {user?.role === 'admin' && (
          <button onClick={handleCreate} className="btn-primary">
            + New Employee
          </button>
        )}
      </div>

      <div className="employees-grid">
        {employees.map(employee => {
          const stats = getEmployeeStats(employee.id)
          return (
            <div key={employee.id} className="employee-card">
              <div className="employee-header">
                <div>
                  <h3>{employee.name}</h3>
                  <span className="role-badge">{employee.role}</span>
                </div>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleEdit(employee)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="employee-info">
                <p><strong>Email:</strong> {employee.email}</p>
                <p><strong>Assigned Site:</strong> {getSiteName(employee.assignedSiteId)}</p>
              </div>

              <div className="employee-stats">
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
                  <span className="stat-value">{stats.conversionRate}%</span>
                  <span className="stat-label">Conversion</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.avgTimeOnSite} min</span>
                  <span className="stat-label">Avg Time</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.avgResponseTime}h</span>
                  <span className="stat-label">Avg Response</span>
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
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function EmployeeModal({ employee, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    role: employee?.role || 'executive',
    assignedSiteId: employee?.assignedSiteId || ''
  })

  const sites = dataService.getSites()

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      assignedSiteId: formData.assignedSiteId ? parseInt(formData.assignedSiteId) : null
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{employee ? 'Edit Employee' : 'New Employee'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="executive">Sales Executive</option>
              <option value="manager">Sales Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assigned Site</label>
            <select
              value={formData.assignedSiteId}
              onChange={(e) => setFormData({ ...formData, assignedSiteId: e.target.value })}
            >
              <option value="">Not assigned</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
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
