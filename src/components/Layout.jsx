import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const isExecutive = user?.role === 'executive'

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="layout">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      <nav className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Sales CRM</h2>
          <button className="mobile-close-btn" onClick={closeMobileMenu}>×</button>
        </div>
        <ul className="nav-menu">
          <li>
            <NavLink to="/" end onClick={closeMobileMenu}>Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/leads" onClick={closeMobileMenu}>Leads</NavLink>
          </li>
          <li>
            <NavLink to="/visits" onClick={closeMobileMenu}>Visits</NavLink>
          </li>
          {(isAdmin || isManager) && (
            <li>
              <NavLink to="/sites" onClick={closeMobileMenu}>Sites</NavLink>
            </li>
          )}
          {(isAdmin || isManager) && (
            <li>
              <NavLink to="/employees" onClick={closeMobileMenu}>Employees</NavLink>
            </li>
          )}
          <li>
            <NavLink to="/analytics" onClick={closeMobileMenu}>Analytics</NavLink>
          </li>
          <li>
            <NavLink to="/profile" onClick={closeMobileMenu}>Profile</NavLink>
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <span>{user?.name}</span>
            <span className="role-badge">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
