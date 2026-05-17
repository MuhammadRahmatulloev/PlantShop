import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, verifyEmail } from '../api/auth'

function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    username: '', email: '', phone: '',
    password: '', password_confirm: '', role: 'client'
  })
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      setStep(2)
    } catch (err) {
      const data = err.response?.data
      const msg = typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : 'Registration error'
      setError(msg)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await verifyEmail(form.email, code)
      navigate('/login')
    } catch {
      setError('Invalid verification code')
    }
  }

  const fields = [
    { key: 'username',         label: 'Username',        type: 'text',     placeholder: 'Choose a username' },
    { key: 'email',            label: 'Email',            type: 'email',    placeholder: 'your@email.com' },
    { key: 'phone',            label: 'Phone (optional)', type: 'text',     placeholder: '+1 234 567 8900' },
    { key: 'password',         label: 'Password',         type: 'password', placeholder: 'Min 8 characters' },
    { key: 'password_confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
  ]

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-logo">🌱</div>

        {step === 1 ? (
          <>
            <h2 className="auth-title">Create account</h2>
            <p className="auth-sub">Join PlantShop today</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleRegister}>

              {/* Role selector */}
              <label className="auth-label" style={{ marginBottom: 10 }}>I want to join as</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { value: 'client', icon: '🛍️', title: 'Customer', desc: 'Browse & buy plants' },
                  { value: 'seller', icon: '🌿', title: 'Seller',   desc: 'List & sell plants' },
                ].map(r => (
                  <div key={r.value} onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      padding: '14px 12px', borderRadius: 12, cursor: 'pointer',
                      textAlign: 'center', transition: 'all 0.2s',
                      border: form.role === r.value
                        ? '2px solid var(--forest)'
                        : '2px solid var(--border)',
                      background: form.role === r.value ? '#f0fdf4' : 'var(--white)',
                    }}>
                    <div style={{ fontSize: 26, marginBottom: 4 }}>{r.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: form.role === r.value ? 'var(--forest)' : 'var(--text)' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{r.desc}</div>
                  </div>
                ))}
              </div>

              {fields.map(f => (
                <div key={f.key}>
                  <label className="auth-label">{f.label}</label>
                  <input className="auth-field" type={f.type} placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}

              <button type="submit" className="btn-primary auth-btn">
                Create {form.role === 'seller' ? 'Seller' : 'Customer'} Account →
              </button>
            </form>

            <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
          </>
        ) : (
          <>
            <h2 className="auth-title">Check your email</h2>
            <p className="auth-sub">We sent a code to <strong>{form.email}</strong></p>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-success">✉️ Verification code sent!</div>
            <form onSubmit={handleVerify}>
              <label className="auth-label">6-digit Code</label>
              <input className="auth-field" placeholder="Enter code" value={code}
                onChange={e => setCode(e.target.value)} maxLength={6}
                style={{ fontSize: 22, letterSpacing: 8, textAlign: 'center' }} />
              <button type="submit" className="btn-primary auth-btn">Verify & Continue →</button>
            </form>
            <p className="auth-link">
              <span style={{ cursor: 'pointer', color: 'var(--forest)', fontWeight: 600 }}
                onClick={() => setStep(1)}>← Go back</span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default RegisterPage