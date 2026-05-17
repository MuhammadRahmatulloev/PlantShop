import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Try again.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-logo">🔑</div>
        <h2 className="auth-title">Forgot password?</h2>
        <p className="auth-sub">Enter your email and we'll send a reset link</p>

        {sent ? (
          <div className="auth-success">
            ✅ Reset link sent! Check your email inbox.
            <br /><br />
            <Link to="/login" style={{ color: 'var(--forest)', fontWeight: 600 }}>
              ← Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <label className="auth-label">Email address</label>
              <input className="auth-field" type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" className="btn-primary auth-btn">
                Send Reset Link →
              </button>
            </form>
            <p className="auth-link"><Link to="/login">← Back to Login</Link></p>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage