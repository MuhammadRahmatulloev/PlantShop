import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPlant, addReview } from '../api/plants'
import { addToCart } from '../api/cart'
import { useAuth } from '../context/AuthContext'

function PlantDetailPage() {
  const { slug } = useParams()
  const { token } = useAuth()
  const [plant, setPlant] = useState(null)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')
  const [cartMsg, setCartMsg] = useState('')

  useEffect(() => {
    getPlant(slug).then(res => setPlant(res.data))
  }, [slug])

  const handleAddToCart = async () => {
    try {
      await addToCart(plant.id)
      setCartMsg('✅ Added to cart!')
      setTimeout(() => setCartMsg(''), 3000)
    } catch {
      setCartMsg('❌ Please login first')
      setTimeout(() => setCartMsg(''), 3000)
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    try {
      await addReview(slug, { rating, text })
      setMessage('✅ Review submitted!')
      setText('')
      getPlant(slug).then(res => setPlant(res.data))
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('❌ You already reviewed this plant')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (!plant) return (
    <div className="empty">
      <div className="empty-icon">🌿</div>
      <p>Loading plant...</p>
    </div>
  )

  const careColors = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' }
  const stars = '★'.repeat(Math.round(plant.average_rating || 0)) + '☆'.repeat(5 - Math.round(plant.average_rating || 0))

  return (
    <div className="page">

      {/* Back link */}
      <Link to="/" style={{ color: 'var(--text3)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← Back to Plants
      </Link>

      {/* Main grid */}
      <div className="detail-grid">

        {/* Left — Image */}
        {/* Left — Image */}
        <div>
          <div className="detail-img-wrap">
            {plant.image
              ? <img
                  src={plant.image.startsWith('http') ? plant.image : `http://localhost:8000/media/${plant.image}`}
                  alt={plant.name}
                  className="detail-img"
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.parentNode.innerHTML = '<div style="font-size:80px;color:var(--text3)">🌱</div>'
                  }}
                />
              : <div style={{ fontSize: 80 }}>🌱</div>
            }
          </div>
          
          {plant.average_rating && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--gold)', fontSize: 22, letterSpacing: 3 }}>{stars}</span>
              <span style={{ color: 'var(--text3)', fontSize: 14 }}>
                {plant.average_rating} / 5 ({plant.reviews?.length} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Right — Info */}
        <div>
          {plant.category && (
            <span className="detail-tag">{plant.category.name}</span>
          )}

          <h1 className="detail-title">{plant.name}</h1>
          <div className="detail-price">${plant.price}</div>

          {/* Meta badges */}
          <div className="detail-meta">
            <div className="detail-meta-item">
              <strong>{plant.stock}</strong>
              in stock
            </div>
            <div className="detail-meta-item">
              <strong className={`plant-card-badge ${careColors[plant.care_level]}`}>
                {plant.care_level}
              </strong>
              care level
            </div>
            {plant.average_rating && (
              <div className="detail-meta-item">
                <strong>⭐ {plant.average_rating}</strong>
                rating
              </div>
            )}
          </div>

          {plant.description && (
            <p className="detail-desc">{plant.description}</p>
          )}

          {/* Cart message */}
          {cartMsg && (
            <div className={cartMsg.startsWith('✅') ? 'detail-msg' : 'auth-error'}>
              {cartMsg}
            </div>
          )}

          {/* Add to cart button */}
          <button onClick={handleAddToCart} className="btn-gold add-cart-btn">
            🛒 Add to Cart
          </button>

          {/* Availability */}
          <p style={{ marginTop: 14, fontSize: 13, color: plant.is_available ? '#15803d' : '#dc2626' }}>
            {plant.is_available ? '✓ In stock & available' : '✗ Currently unavailable'}
          </p>
        </div>
      </div>

      {/* Reviews section */}
      <div className="reviews-section">
        <h2 style={{ fontSize: 32, marginBottom: 24 }}>
          Reviews
          <span style={{ fontSize: 18, color: 'var(--text3)', fontWeight: 400, marginLeft: 12 }}>
            ({plant.reviews?.length ?? 0})
          </span>
        </h2>

        {!plant.reviews?.length ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <p>No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          plant.reviews.map(r => (
            <div key={r.id} className="review-card fade-up">
              <div className="review-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--cream2)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, color: 'var(--forest)'
                  }}>
                    {r.user?.[0]?.toUpperCase()}
                  </div>
                  <span className="review-author">{r.user}</span>
                </div>
                <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              {r.text && <p className="review-text">{r.text}</p>}
              <p className="review-date">
                {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          ))
        )}

        {/* Review form */}
        {token ? (
          <div className="review-form">
            <h4>Leave a Review</h4>

            {message && (
              <div className={message.startsWith('✅') ? 'auth-success' : 'auth-error'}>
                {message}
              </div>
            )}

            <form onSubmit={handleReview}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
                Your Rating
              </label>
              <select value={rating} onChange={e => setRating(Number(e.target.value))}
                style={{ padding: '10px 14px', marginBottom: 16, minWidth: 180, borderRadius: 10 }}>
                {[5,4,3,2,1].map(n => (
                  <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5-n)} — {['','Poor','Fair','Good','Very Good','Excellent'][n]}</option>
                ))}
              </select>

              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
                Your Review
              </label>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Share your experience with this plant..."
                rows={4} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, resize: 'none', marginBottom: 14 }} />

              <button type="submit" className="btn-primary" style={{ padding: '11px 28px', borderRadius: 10 }}>
                Submit Review
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px', background: 'var(--cream)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text3)', marginBottom: 14 }}>Login to leave a review</p>
            <Link to="/login" className="btn-primary" style={{ padding: '10px 24px', display: 'inline-block' }}>
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlantDetailPage