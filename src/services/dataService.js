// Initialize sample data
const initializeData = () => {
  if (!localStorage.getItem('users')) {
    const users = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        assignedSiteId: null
      },
      {
        id: 2,
        name: 'Sales Manager',
        email: 'manager@example.com',
        password: 'manager123',
        role: 'manager',
        assignedSiteId: null
      },
      {
        id: 3,
        name: 'John Doe',
        email: 'executive@example.com',
        password: 'executive123',
        role: 'executive',
        assignedSiteId: 1
      },
      {
        id: 4,
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'executive123',
        role: 'executive',
        assignedSiteId: 2
      }
    ]
    localStorage.setItem('users', JSON.stringify(users))
  }

  if (!localStorage.getItem('sites')) {
    const sites = [
      {
        id: 1,
        name: 'Downtown Plaza',
        latitude: 28.6139,
        longitude: 77.2090,
        radius: 500, // meters
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Riverside Complex',
        latitude: 28.7041,
        longitude: 77.1025,
        radius: 300,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Metro Heights',
        latitude: 28.5355,
        longitude: 77.3910,
        radius: 400,
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('sites', JSON.stringify(sites))
  }

  if (!localStorage.getItem('leads')) {
    const leads = [
      {
        id: 1,
        clientName: 'Rajesh Kumar',
        phone: '+91 9876543210',
        email: 'rajesh@example.com',
        leadSource: 'Walk-in',
        assignedExecutiveId: 3,
        siteId: 1,
        status: 'Booked',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        clientName: 'Priya Sharma',
        phone: '+91 9876543211',
        email: 'priya@example.com',
        leadSource: 'Campaign',
        assignedExecutiveId: 3,
        siteId: 1,
        status: 'Follow-up',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        clientName: 'Amit Patel',
        phone: '+91 9876543212',
        email: 'amit@example.com',
        leadSource: 'Referral',
        assignedExecutiveId: 4,
        siteId: 2,
        status: 'Visit Done',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    localStorage.setItem('leads', JSON.stringify(leads))
  }

  if (!localStorage.getItem('visits')) {
    const visits = [
      {
        id: 1,
        leadId: 1,
        executiveId: 3,
        siteId: 1,
        checkinTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        checkoutTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        locationVerified: true,
        latitude: 28.6139,
        longitude: 77.2090
      },
      {
        id: 2,
        leadId: 2,
        executiveId: 3,
        siteId: 1,
        checkinTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        checkoutTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
        locationVerified: true,
        latitude: 28.6139,
        longitude: 77.2090
      },
      {
        id: 3,
        leadId: 3,
        executiveId: 4,
        siteId: 2,
        checkinTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        checkoutTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        locationVerified: true,
        latitude: 28.7041,
        longitude: 77.1025
      }
    ]
    localStorage.setItem('visits', JSON.stringify(visits))
  }

  if (!localStorage.getItem('bookings')) {
    const bookings = [
      {
        id: 1,
        leadId: 1,
        siteId: 1,
        executiveId: 3,
        amount: 5000000,
        bookingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    localStorage.setItem('bookings', JSON.stringify(bookings))
  }
}

// Initialize data on load
initializeData()

export const dataService = {
  // Users
  getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]')
  },

  getUser(id) {
    const users = this.getUsers()
    return users.find(u => u.id === id)
  },

  createUser(user) {
    const users = this.getUsers()
    const newUser = {
      ...user,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    return newUser
  },

  updateUser(id, updates) {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      localStorage.setItem('users', JSON.stringify(users))
      return users[index]
    }
    return null
  },

  // Sites
  getSites() {
    return JSON.parse(localStorage.getItem('sites') || '[]')
  },

  getSite(id) {
    const sites = this.getSites()
    return sites.find(s => s.id === id)
  },

  createSite(site) {
    const sites = this.getSites()
    const newSite = {
      ...site,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    sites.push(newSite)
    localStorage.setItem('sites', JSON.stringify(sites))
    return newSite
  },

  updateSite(id, updates) {
    const sites = this.getSites()
    const index = sites.findIndex(s => s.id === id)
    if (index !== -1) {
      sites[index] = { ...sites[index], ...updates }
      localStorage.setItem('sites', JSON.stringify(sites))
      return sites[index]
    }
    return null
  },

  // Leads
  getLeads() {
    return JSON.parse(localStorage.getItem('leads') || '[]')
  },

  getLead(id) {
    const leads = this.getLeads()
    return leads.find(l => l.id === id)
  },

  createLead(lead) {
    const leads = this.getLeads()
    const newLead = {
      ...lead,
      id: Date.now(),
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    leads.push(newLead)
    localStorage.setItem('leads', JSON.stringify(leads))
    return newLead
  },

  updateLead(id, updates) {
    const leads = this.getLeads()
    const index = leads.findIndex(l => l.id === id)
    if (index !== -1) {
      leads[index] = {
        ...leads[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('leads', JSON.stringify(leads))
      return leads[index]
    }
    return null
  },

  // Visits
  getVisits() {
    return JSON.parse(localStorage.getItem('visits') || '[]')
  },

  getVisit(id) {
    const visits = this.getVisits()
    return visits.find(v => v.id === id)
  },

  createVisit(visit) {
    const visits = this.getVisits()
    const newVisit = {
      ...visit,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    visits.push(newVisit)
    localStorage.setItem('visits', JSON.stringify(visits))
    return newVisit
  },

  updateVisit(id, updates) {
    const visits = this.getVisits()
    const index = visits.findIndex(v => v.id === id)
    if (index !== -1) {
      visits[index] = { ...visits[index], ...updates }
      localStorage.setItem('visits', JSON.stringify(visits))
      return visits[index]
    }
    return null
  },

  // Bookings
  getBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]')
  },

  getBooking(id) {
    const bookings = this.getBookings()
    return bookings.find(b => b.id === id)
  },

  createBooking(booking) {
    const bookings = this.getBookings()
    const newBooking = {
      ...booking,
      id: Date.now(),
      bookingDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    bookings.push(newBooking)
    localStorage.setItem('bookings', JSON.stringify(bookings))
    return newBooking
  }
}

