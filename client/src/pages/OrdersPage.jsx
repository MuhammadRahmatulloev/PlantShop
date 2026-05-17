import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/').then(res => {
      setOrders(res.data.results)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="empty"><div className="empty-icon">📦</div><p>Loading orders...</p></div>
  )

  return (
    <div className="page">
      <h1 className="section-title">My Orders</h1>
      <p className="section-sub">{orders.length} order(s) total</p>

      {orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p style={{ marginBottom: 24 }}>Start shopping to see your orders here</p>
          <Link to="/" className="btn-primary" style={{ padding: '12px 28px', display: 'inline-block' }}>
            Browse Plants
          </Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card fade-up">
            <div className="order-header">
              <div>
                <span className="order-id">Order #{order.id}</span>
                <div className="order-meta" style={{ marginTop: 4, marginBottom: 0 }}>
                  {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <span className={`order-status status-${order.status}`}>{order.status}</span>
            </div>

            <div className="order-meta">
              📍 {order.delivery_address}
            </div>

            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
              {order.items.map((item, i) => (
                <div key={item.id} className="order-item" style={{ padding: '10px 14px', background: i % 2 === 0 ? 'var(--cream)' : 'var(--white)' }}>
                  <span>🌿 {item.plant?.name ?? 'Deleted plant'} × {item.quantity}</span>
                  <span style={{ fontWeight: 500 }}>${item.total_price}</span>
                </div>
              ))}
            </div>

            <div className="order-total">Total: ${order.total_price}</div>
          </div>
        ))
      )}
    </div>
  )
}

export default OrdersPage