import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../api/axios'

function Navbar() {
  const { token, logoutUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState(null)

  const isActive = (path) => location.pathname === path ? 'nav-link nav-link-active' : 'nav-link'
  const handleLogout = () => { logoutUser(); navigate('/login') }

  useEffect(() => {
    if (token) {
      api.get('/profile/').then(r => setRole(r.data.role))
    } else {
      setRole(null)
    }
  }, [token])

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🌿 PlantShop</Link>
      <div className="navbar-links">
        {token ? (
          <>
            {/* Кнопка Add Plant — только для seller и admin */}
            {(role === 'seller' || role === 'admin') && (
              <Link
                to="/plants/create"
                className={isActive('/plants/create')}
                style={{
                  background: 'rgba(200,169,110,0.15)',
                  color: 'var(--gold)',
                  border: '1px solid rgba(200,169,110,0.3)',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                + Add Plant
              </Link>
            )}
            <Link to="/cart"    className={isActive('/cart')}>🛒 Cart</Link>
            <Link to="/orders"  className={isActive('/orders')}>📦 Orders</Link>
            <Link to="/profile" className={isActive('/profile')}>👤 Profile</Link>
            <button onClick={handleLogout} className="nav-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"    className={isActive('/login')}>Login</Link>
            <Link to="/register" className={isActive('/register')}>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar