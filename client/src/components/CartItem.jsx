function CartItem({ item, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 12 }}>
      {item.plant.image && (
        <img src={`http://localhost:8000${item.plant.image}`} alt={item.plant.name}
          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
      )}
      <div style={{ flex: 1 }}>
        <strong>{item.plant.name}</strong>
        <p style={{ margin: 0, color: '#888' }}>
          {item.quantity} × ${item.plant.price} = <strong>${item.total_price}</strong>
        </p>
      </div>
      <button onClick={() => onRemove(item.id)}
        style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}>
        Remove
      </button>
    </div>
  )
}
export default CartItem