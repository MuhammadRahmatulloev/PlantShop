import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const { logoutUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/profile/').then(res => {
      setProfile(res.data)
      setForm({ username: res.data.username, phone: res.data.phone, role: res.data.role })
    })
  }, [])

  const handleLogout = () => { logoutUser(); navigate('/login') }

  const handleSave = async () => {
    try {
      const res = await api.patch('/profile/', { phone: form.phone, role: form.role })
      setProfile(res.data)
      setEditMode(false)
      setSaveMsg('✅ Profile updated!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveMsg('❌ Error saving changes')
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm)
      return setPwMsg('❌ Passwords do not match')
    if (pwForm.new_password.length < 8)
      return setPwMsg('❌ Password must be at least 8 characters')
    try {
      await api.post('/change-password/', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password
      })
      setPwMsg('✅ Password changed successfully!')
      setPwForm({ old_password: '', new_password: '', confirm: '' })
      setTimeout(() => setPwMsg(''), 4000)
    } catch (err) {
      setPwMsg('❌ ' + (err.response?.data?.detail ?? 'Wrong current password'))
      setTimeout(() => setPwMsg(''), 4000)
    }
  }

  if (!profile) return (
    <div className="empty"><div className="empty-icon">👤</div><p>Loading profile...</p></div>
  )

  const roleColors = {
    client: { bg: '#dcfce7', color: '#15803d' },
    seller: { bg: '#dbeafe', color: '#1d4ed8' },
    admin:  { bg: '#fef9c3', color: '#a16207' },
  }
  const roleStyle = roleColors[profile.role] || roleColors.client

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <h1 className="section-title">My Profile</h1>
      <p className="section-sub">Manage your account details</p>

      {/* Header */}
      <div className="profile-header fade-up">
        <div className="profile-avatar">
          {profile.username?.[0]?.toUpperCase() ?? '👤'}
        </div>
        <div>
          <div className="profile-name">{profile.username}</div>
          <span className="profile-role">{profile.role}</span>
        </div>
        <button onClick={() => setEditMode(!editMode)}
          style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 13, fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}
          onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={e => e.target.style.background = 'transparent'}>
          {editMode ? 'Cancel' : '✏️ Edit'}
        </button>
      </div>

      {saveMsg && <div className={saveMsg.startsWith('✅') ? 'auth-success' : 'auth-error'} style={{ marginBottom: 16 }}>{saveMsg}</div>}

      {/* Info card */}
      <div className="profile-card fade-up" style={{ marginBottom: 20 }}>
        <div className="profile-row">
          <span className="profile-label">👤 Username</span>
          <span className="profile-val">{profile.username}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">✉️ Email</span>
          <span className="profile-val">{profile.email}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">📞 Phone</span>
          {editMode
            ? <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, width: 200 }} />
            : <span className="profile-val">{profile.phone || '—'}</span>
          }
        </div>
        <div className="profile-row">
          <span className="profile-label">🎖️ Role</span>
          {editMode ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {['client', 'seller'].map(r => (
                <div key={r} onClick={() => setForm({ ...form, role: r })}
                  style={{
                    padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                    border: form.role === r ? '2px solid var(--forest)' : '2px solid var(--border)',
                    background: form.role === r ? '#dcfce7' : 'var(--white)',
                    color: form.role === r ? '#15803d' : 'var(--text3)',
                    transition: 'all 0.2s'
                  }}>
                  {r === 'client' ? '🛍️ Customer' : '🌿 Seller'}
                </div>
              ))}
            </div>
          ) : (
            <span style={{ ...roleStyle, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              {profile.role}
            </span>
          )}
        </div>
      </div>

      {/* Save button */}
      {editMode && (
        <button onClick={handleSave} className="btn-gold"
          style={{ padding: '12px 28px', fontSize: 15, borderRadius: 10, marginBottom: 28 }}>
          Save Changes →
        </button>
      )}

      {/* Change Password */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 22, marginBottom: 4 }}>Change Password</h3>
        <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 20 }}>Update your account password</p>

        {pwMsg && <div className={pwMsg.startsWith('✅') ? 'auth-success' : 'auth-error'}>{pwMsg}</div>}

        <form onSubmit={handleChangePassword}>
          <label className="auth-label">Current Password</label>
          <input type="password" className="auth-field" placeholder="Enter current password"
            value={pwForm.old_password}
            onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })} />

          <label className="auth-label">New Password</label>
          <input type="password" className="auth-field" placeholder="Min 8 characters"
            value={pwForm.new_password}
            onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} />

          <label className="auth-label">Confirm New Password</label>
          <input type="password" className="auth-field" placeholder="Repeat new password"
            value={pwForm.confirm}
            onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />

          <button type="submit" className="btn-primary"
            style={{ padding: '11px 24px', borderRadius: 10, marginTop: 4 }}>
            Update Password →
          </button>
        </form>
      </div>

      {/* Sign out */}
      <button onClick={handleLogout}
        style={{ padding: '12px 28px', borderRadius: 10, background: 'transparent', border: '1.5px solid #fecaca', color: '#dc2626', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 14, transition: 'all 0.2s' }}
        onMouseOver={e => e.target.style.background = '#fef2f2'}
        onMouseOut={e => e.target.style.background = 'transparent'}>
        Sign Out
      </button>
    </div>
  )
}

export default ProfilePage