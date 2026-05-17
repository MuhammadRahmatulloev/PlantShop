import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await login(username, password)
      loginUser(res.data.access)
      navigate('/')
    } catch {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-logo">🌿</div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to your PlantShop account</p>
        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--text3)' }}>
            Forgot your password?
          </Link>
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Username</label>
          <input
            className="auth-field"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <label className="auth-label">Password</label>
          <input
            className="auth-field"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="btn-primary auth-btn">
            Sign In →
          </button>
        </form>

        <p className="auth-link">
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage