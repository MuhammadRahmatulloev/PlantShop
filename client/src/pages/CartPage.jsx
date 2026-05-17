import { useEffect, useState } from 'react'
import { getCart, removeFromCart, clearCart } from '../api/cart'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

function CartPage() {
  const [cart, setCart] = useState(null)
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchCart = () => {
    setLoading(true)
    getCart().then(res => { setCart(res.data); setLoading(false) })
  }

  useEffect(() => { fetchCart() }, [])

  const handleRemove = async (id) => {
    await removeFromCart(id)
    fetchCart()
  }

  const handleClear = async () => {
    await clearCart()
    fetchCart()
  }

  const handleOrder = async () => {
    if (!address.trim()) return setMessage('Please enter a delivery address')
    try {
      await api.post('/orders/', { delivery_address: address })
      setMessage('✅ Order placed! Check your email for confirmation.')
      setAddress('')
      fetchCart()
    } catch {
      setMessage('❌ Error placing order. Try again.')
    }
  }

  if (loading) return (
    <div className="empty"><div className="empty-icon">🛒</div><p>Loading cart...</p></div>
  )

  return (
    <div className="page">
      <h1 className="section-title">My Cart</h1>
      <p className="section-sub">
        {cart?.items?.length > 0 ? `${cart.items.length} item(s) in your cart` : 'Your cart is empty'}
      </p>

      {message && (
        <div className={message.startsWith('✅') ? 'auth-success' : 'auth-error'}
          style={{ marginBottom: 24 }}>
          {message}
        </div>
      )}

      {!cart?.items?.length ? (
        <div className="empty">
          <div className="empty-icon">🌱</div>
          <h3>Your cart is empty</h3>
          <p style={{ marginBottom: 24 }}>Discover our beautiful plants collection</p>
          <Link to="/" className="btn-primary" style={{ padding: '12px 28px', display: 'inline-block' }}>
            Browse Plants
          </Link>
        </div>
      ) : (
        <div className="cart-wrap">
          {/* Items */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 20 }}>Items</h3>
              <button className="btn-danger" style={{ padding: '6px 14px', fontSize: 13 }} onClick={handleClear}>
                Clear all
              </button>
            </div>

            {cart.items.map(item => (
              <div key={item.id} className="cart-item fade-up">
                {item.plant.image
                  ? <img src={item.plant.image.startsWith('http') ? item.plant.image : `http://localhost:8000/media/${item.plant.image}`} alt={item.plant.name} className="cart-item-img" />
                  : <div className="cart-item-no-img">🌿</div>
                }
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.plant.name}</div>
                  <div className="cart-item-price">
                    {item.quantity} × ${item.plant.price} =&nbsp;
                    <span style={{ color: 'var(--forest)', fontWeight: 600 }}>${item.total_price}</span>
                  </div>
                </div>
                <button className="btn-danger" style={{ padding: '7px 14px', fontSize: 13 }}
                  onClick={() => handleRemove(item.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>

            {cart.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14, color: 'var(--text2)' }}>
                <span>{item.plant.name} × {item.quantity}</span>
                <span>${item.total_price}</span>
              </div>
            ))}

            <div className="cart-total-row">
              <span>Total</span>
              <span>${cart.total_price}</span>
            </div>

            <div style={{ marginTop: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
                Delivery Address
              </label>
              <textarea
                className="cart-address"
                placeholder="Enter your full delivery address..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>

            <button className="btn-gold cart-place-btn" onClick={handleOrder}>
              Place Order →
            </button>

            <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: 14, color: 'var(--text3)' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage