import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dataService } from '../services/dataService'
import { getCurrentLocation, isWithinGeoFence } from '../utils/geoFence'
import './Visits.css'

export default function Visits() {
  const { user } = useAuth()
  const [visits, setVisits] = useState([])
  const [showCheckinModal, setShowCheckinModal] = useState(false)
  const [checkingLocation, setCheckingLocation] = useState(false)

  useEffect(() => {
    loadVisits()
  }, [user])

  const loadVisits = () => {
    let allVisits = dataService.getVisits()
    
    if (user?.role === 'executive') {
      allVisits = allVisits.filter(v => v.executiveId === user.id)
    }

    setVisits(allVisits.sort((a, b) => new Date(b.checkinTime) - new Date(a.checkinTime)))
  }

  const handleCheckin = async () => {
    if (user?.role !== 'executive') {
      alert('Only sales executives can check in')
      return
    }

    const assignedSiteId = user.assignedSiteId
    if (!assignedSiteId) {
      alert('No site assigned to you')
      return
    }

    setCheckingLocation(true)
    setShowCheckinModal(true)

    try {
      const location = await getCurrentLocation()
      const site = dataService.getSite(assignedSiteId)
      
      if (!site) {
        alert('Site not found')
        return
      }

      const withinFence = isWithinGeoFence(
        location.latitude,
        location.longitude,
        site.latitude,
        site.longitude,
        site.radius
      )

      if (!withinFence) {
        alert(`You are not within the geo-fence for ${site.name}. Please move to the site location.`)
        setCheckingLocation(false)
        return
      }

      // Find active lead or create visit
      const leads = dataService.getLeads().filter(
        l => l.assignedExecutiveId === user.id && l.siteId === assignedSiteId
      )

      if (leads.length === 0) {
        alert('No leads found for this site. Please create a lead first.')
        setCheckingLocation(false)
        return
      }

      // Create visit
      const visit = dataService.createVisit({
        leadId: leads[0].id,
        executiveId: user.id,
        siteId: assignedSiteId,
        checkinTime: new Date().toISOString(),
        locationVerified: true,
        latitude: location.latitude,
        longitude: location.longitude
      })

      // Update lead status
      dataService.updateLead(leads[0].id, { status: 'Visit Done' })

      alert('Check-in successful!')
      setShowCheckinModal(false)
      loadVisits()
    } catch (error) {
      alert(`Error getting location: ${error.message}`)
    } finally {
      setCheckingLocation(false)
    }
  }

  const handleCheckout = (visitId) => {
    const visit = dataService.getVisit(visitId)
    if (visit && !visit.checkoutTime) {
      dataService.updateVisit(visitId, {
        checkoutTime: new Date().toISOString()
      })
      loadVisits()
    }
  }

  const getSiteName = (siteId) => {
    const site = dataService.getSite(siteId)
    return site?.name || 'Unknown'
  }

  const getLeadName = (leadId) => {
    const lead = dataService.getLead(leadId)
    return lead?.clientName || 'Unknown'
  }

  const getDuration = (visit) => {
    if (!visit.checkoutTime) return 'Ongoing'
    const minutes = Math.round(
      (new Date(visit.checkoutTime) - new Date(visit.checkinTime)) / 60000
    )
    return `${minutes} min`
  }

  return (
    <div className="visits-page">
      <div className="page-header">
        <h1>Visit Tracking</h1>
        {user?.role === 'executive' && (
          <button
            onClick={handleCheckin}
            className="btn-primary"
            disabled={checkingLocation}
          >
            {checkingLocation ? 'Checking Location...' : 'Check In'}
          </button>
        )}
      </div>

      <div className="visits-table-container">
        <table className="visits-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Site</th>
              <th>Check-in Time</th>
              <th>Check-out Time</th>
              <th>Duration</th>
              <th>Location Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(visit => (
              <tr key={visit.id}>
                <td>{getLeadName(visit.leadId)}</td>
                <td>{getSiteName(visit.siteId)}</td>
                <td>{new Date(visit.checkinTime).toLocaleString()}</td>
                <td>
                  {visit.checkoutTime
                    ? new Date(visit.checkoutTime).toLocaleString()
                    : 'Not checked out'}
                </td>
                <td>{getDuration(visit)}</td>
                <td>
                  <span className={visit.locationVerified ? 'verified' : 'not-verified'}>
                    {visit.locationVerified ? '✓ Verified' : '✗ Not Verified'}
                  </span>
                </td>
                <td>
                  {!visit.checkoutTime && user?.role === 'executive' && (
                    <button
                      onClick={() => handleCheckout(visit.id)}
                      className="btn-checkout"
                    >
                      Check Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

