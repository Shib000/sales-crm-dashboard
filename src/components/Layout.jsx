import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const isExecutive = user?.role === 'executive'

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Sales CRM</h2>
        </div>
        <ul className="nav-menu">
          <li>
            <NavLink to="/" end>Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/leads">Leads</NavLink>
          </li>
          <li>
            <NavLink to="/visits">Visits</NavLink>
          </li>
          {(isAdmin || isManager) && (
            <li>
              <NavLink to="/sites">Sites</NavLink>
            </li>
          )}
          {(isAdmin || isManager) && (
            <li>
              <NavLink to="/employees">Employees</NavLink>
            </li>
          )}
          <li>
            <NavLink to="/analytics">Analytics</NavLink>
          </li>
          <li>
            <NavLink to="/profile">Profile</NavLink>
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
