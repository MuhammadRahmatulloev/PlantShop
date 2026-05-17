import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { resetPassword } from '../api/auth'

function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const uid   = params.get('uid')
  const token = params.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return setError('Passwords do not match')
    if (password.length < 8)  return setError('Password must be at least 8 characters')
    setError('')
    try {
      await resetPassword(uid, token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Invalid or expired link')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-logo">🔐</div>
        <h2 className="auth-title">New password</h2>
        <p className="auth-sub">Choose a strong password for your account</p>

        {success ? (
          <div className="auth-success">
            ✅ Password changed! Redirecting to login...
          </div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <label className="auth-label">New Password</label>
              <input className="auth-field" type="password" placeholder="Min 8 characters"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <label className="auth-label">Confirm Password</label>
              <input className="auth-field" type="password" placeholder="Repeat password"
                value={confirm} onChange={e => setConfirm(e.target.value)} required />
              <button type="submit" className="btn-primary auth-btn">
                Reset Password →
              </button>
            </form>
            <p className="auth-link"><Link to="/login">← Back to Login</Link></p>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage