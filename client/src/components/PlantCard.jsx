import { Link } from 'react-router-dom'

function PlantCard({ plant }) {
  const badgeClass = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' }

  return (
    <div className="plant-card fade-up">
      <div className="plant-card-img-wrap">
        {plant.image
          ? <img
              src={plant.image.startsWith('http') ? plant.image : `http://localhost:8000/media/${plant.image}`}
              alt={plant.name}
              className="plant-card-img"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            />
          : null
        }
        <div className="plant-card-no-img" style={{ display: plant.image ? 'none' : 'flex' }}>
          🌱
        </div>
      </div>

      <div className="plant-card-body">
        <div className="plant-card-cat">
          {plant.category?.name ?? 'Plant'}
        </div>
        <div className="plant-card-name">{plant.name}</div>
        <div className="plant-card-footer">
          <div className="plant-card-price">${plant.price}</div>
          <span className={`plant-card-badge ${badgeClass[plant.care_level] ?? 'badge-easy'}`}>
            {plant.care_level}
          </span>
        </div>
        <Link to={`/plants/${plant.slug}`} className="plant-card-link">
          View details →
        </Link>
      </div>
    </div>
  )
}

export default PlantCard