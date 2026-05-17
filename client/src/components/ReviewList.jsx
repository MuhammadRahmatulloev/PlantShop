function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0)
    return <p style={{ color: '#888' }}>No reviews yet</p>

  return (
    <div>
      {reviews.map(r => (
        <div key={r.id} style={{ background: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 10 }}>
          <strong>{r.user}</strong> — {'⭐'.repeat(r.rating)}
          <p style={{ margin: '4px 0', color: '#555' }}>{r.text}</p>
          <small style={{ color: '#aaa' }}>{new Date(r.created_at).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  )
}
export default ReviewList