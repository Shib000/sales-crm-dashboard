import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dataService } from '../services/dataService'
import './Leads.css'

export default function Leads() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingLeadId, setBookingLeadId] = useState(null)

  useEffect(() => {
    loadLeads()
  }, [user, filter])

  const loadLeads = () => {
    let allLeads = dataService.getLeads()
    
    if (user?.role === 'executive') {
      allLeads = allLeads.filter(l => l.assignedExecutiveId === user.id)
    }

    if (filter !== 'all') {
      allLeads = allLeads.filter(l => l.status === filter)
    }

    setLeads(allLeads)
  }

  const handleCreate = () => {
    setEditingLead(null)
    setShowModal(true)
  }

  const handleEdit = (lead) => {
    setEditingLead(lead)
    setShowModal(true)
  }

  const handleSave = (leadData) => {
    if (editingLead) {
      dataService.updateLead(editingLead.id, leadData)
    } else {
      dataService.createLead({
        ...leadData,
        assignedExecutiveId: leadData.assignedExecutiveId || user.id
      })
    }
    setShowModal(false)
    loadLeads()
  }

  const handleStatusChange = (leadId, newStatus) => {
    const lead = dataService.getLead(leadId)
    
    // Create booking if status changed to "Booked"
    if (newStatus === 'Booked' && lead && lead.status !== 'Booked') {
      const existingBooking = dataService.getBookings().find(b => b.leadId === leadId)
      if (!existingBooking) {
        setBookingLeadId(leadId)
        setShowBookingModal(true)
        return // Don't update status yet, wait for booking amount
      }
    }
    
    dataService.updateLead(leadId, { status: newStatus })
    loadLeads()
  }

  const handleBookingSave = (amount) => {
    if (bookingLeadId && amount) {
      const lead = dataService.getLead(bookingLeadId)
      dataService.createBooking({
        leadId: bookingLeadId,
        siteId: lead.siteId,
        executiveId: lead.assignedExecutiveId,
        amount: parseFloat(amount)
      })
      dataService.updateLead(bookingLeadId, { status: 'Booked' })
      setShowBookingModal(false)
      setBookingLeadId(null)
      loadLeads()
    }
  }

  const getExecutiveName = (id) => {
    const executive = dataService.getUser(id)
    return executive?.name || 'Unknown'
  }

  const getSiteName = (id) => {
    const site = dataService.getSite(id)
    return site?.name || 'Unknown'
  }

  return (
    <div className="leads-page">
      <div className="page-header">
        <h1>Lead Management</h1>
        {(user?.role === 'admin' || user?.role === 'executive') && (
          <button onClick={handleCreate} className="btn-primary">
            + New Lead
          </button>
        )}
      </div>

      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={filter === 'New' ? 'active' : ''}
          onClick={() => setFilter('New')}
        >
          New
        </button>
        <button
          className={filter === 'Visit Done' ? 'active' : ''}
          onClick={() => setFilter('Visit Done')}
        >
          Visit Done
        </button>
        <button
          className={filter === 'Follow-up' ? 'active' : ''}
          onClick={() => setFilter('Follow-up')}
        >
          Follow-up
        </button>
        <button
          className={filter === 'Booked' ? 'active' : ''}
          onClick={() => setFilter('Booked')}
        >
          Booked
        </button>
        <button
          className={filter === 'Lost' ? 'active' : ''}
          onClick={() => setFilter('Lost')}
        >
          Lost
        </button>
      </div>

      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Contact</th>
              <th>Source</th>
              <th>Site</th>
              <th>Executive</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td>{lead.clientName}</td>
                <td>
                  <div>{lead.phone}</div>
                  {lead.email && <div className="email">{lead.email}</div>}
                </td>
                <td>{lead.leadSource}</td>
                <td>{getSiteName(lead.siteId)}</td>
                <td>{getExecutiveName(lead.assignedExecutiveId)}</td>
                <td>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className={`status-select ${lead.status.toLowerCase().replace(' ', '-')}`}
                  >
                    <option value="New">New</option>
                    <option value="Visit Done">Visit Done</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Booked">Booked</option>
                    <option value="Lost">Lost</option>
                  </select>
                </td>
                <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleEdit(lead)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <LeadModal
          lead={editingLead}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {showBookingModal && (
        <BookingModal
          leadId={bookingLeadId}
          onClose={() => {
            setShowBookingModal(false)
            setBookingLeadId(null)
          }}
          onSave={handleBookingSave}
        />
      )}
    </div>
  )
}

function LeadModal({ lead, onClose, onSave }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    clientName: lead?.clientName || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    leadSource: lead?.leadSource || 'Walk-in',
    siteId: lead?.siteId || '',
    assignedExecutiveId: lead?.assignedExecutiveId || user.id,
    status: lead?.status || 'New'
  })

  const sites = dataService.getSites()
  const executives = dataService.getUsers().filter(u => u.role === 'executive')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{lead ? 'Edit Lead' : 'New Lead'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Client Name *</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Lead Source *</label>
            <select
              value={formData.leadSource}
              onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
              required
            >
              <option value="Walk-in">Walk-in</option>
              <option value="Campaign">Campaign</option>
              <option value="Referral">Referral</option>
            </select>
          </div>

          <div className="form-group">
            <label>Site *</label>
            <select
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: parseInt(e.target.value) })}
              required
            >
              <option value="">Select Site</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          {(user?.role === 'admin' || user?.role === 'manager') && (
            <div className="form-group">
              <label>Assigned Executive *</label>
              <select
                value={formData.assignedExecutiveId}
                onChange={(e) => setFormData({ ...formData, assignedExecutiveId: parseInt(e.target.value) })}
                required
              >
                <option value="">Select Executive</option>
                {executives.map(exec => (
                  <option key={exec.id} value={exec.id}>{exec.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="New">New</option>
              <option value="Visit Done">Visit Done</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Booked">Booked</option>
              <option value="Lost">Lost</option>
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

function BookingModal({ leadId, onClose, onSave }) {
  const [amount, setAmount] = useState('')
  const lead = dataService.getLead(leadId)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (amount && parseFloat(amount) > 0) {
      onSave(amount)
    } else {
      alert('Please enter a valid booking amount')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create Booking</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Lead: <strong>{lead?.clientName}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Booking Amount (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="Enter booking amount"
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
