import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function CreatePlantPage() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '',
    stock: '', care_level: 'easy', category_id: '', is_available: true
  })
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories/').then(res => setCategories(res.data.results ?? res.data))
  }, [])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      if (image) data.append('image', image)
      await api.post('/plants/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSuccess('Plant created successfully!')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'object' ? Object.values(d).flat().join(' ') : 'Error creating plant')
    }
  }

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <h1 className="section-title">Add New Plant</h1>
      <p className="section-sub">List your plant for sale</p>

      <div style={{ background: 'var(--white)', borderRadius: 20, padding: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        {error   && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Name + auto slug */}
          <label className="auth-label">Plant Name</label>
          <input className="auth-field" name="name" placeholder="e.g. Monstera Deliciosa"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })} />

          <label className="auth-label">Slug (auto-filled)</label>
          <input className="auth-field" name="slug" placeholder="monstera-deliciosa"
            value={form.slug} onChange={handleChange} />

          <label className="auth-label">Description</label>
          <textarea name="description" placeholder="Describe your plant..."
            value={form.description} onChange={handleChange} rows={4}
            style={{ display: 'block', width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 10, border: '1.5px solid var(--border)', resize: 'vertical', fontFamily: 'Outfit, sans-serif', fontSize: 14 }} />

          {/* Price + Stock in row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="auth-label">Price ($)</label>
              <input className="auth-field" name="price" type="number" step="0.01"
                placeholder="19.99" value={form.price} onChange={handleChange} />
            </div>
            <div>
              <label className="auth-label">Stock</label>
              <input className="auth-field" name="stock" type="number"
                placeholder="100" value={form.stock} onChange={handleChange} />
            </div>
          </div>

          {/* Category + Care level in row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="auth-label">Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange}
                className="auth-field" style={{ display: 'block', width: '100%', marginBottom: 14 }}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="auth-label">Care Level</label>
              <select name="care_level" value={form.care_level} onChange={handleChange}
                className="auth-field" style={{ display: 'block', width: '100%', marginBottom: 14 }}>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>
          </div>

          {/* Image upload */}
          <label className="auth-label">Plant Photo</label>
          <div style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 14, cursor: 'pointer', background: 'var(--cream)' }}
            onClick={() => document.getElementById('img-input').click()}>
            {image
              ? <div>
                  <img src={URL.createObjectURL(image)} alt="preview"
                    style={{ maxHeight: 160, borderRadius: 8, marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: 'var(--text3)' }}>{image.name}</p>
                </div>
              : <div>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                  <p style={{ color: 'var(--text3)', fontSize: 14 }}>Click to upload photo</p>
                </div>
            }
            <input id="img-input" type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => setImage(e.target.files[0])} />
          </div>

          {/* Available toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
            <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange}
              style={{ width: 18, height: 18, accentColor: 'var(--forest)' }} />
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>Available for sale</span>
          </label>

          <button type="submit" className="btn-gold auth-btn" style={{ fontSize: 16 }}>
            🌿 Publish Plant
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreatePlantPage