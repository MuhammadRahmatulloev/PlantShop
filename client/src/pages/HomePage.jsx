import { useEffect, useState } from 'react'
import { getPlants } from '../api/plants'
import PlantCard from '../components/PlantCard'

function HomePage() {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    care_level: '',
    price_min: '',
    price_max: '',
  })

  const fetchPlants = (params = {}) => {
    setLoading(true)
    getPlants(params).then(res => {
      setPlants(res.data.results)
      setLoading(false)
    })
  }

  useEffect(() => { fetchPlants() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPlants({ search, ...filters })
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleReset = () => {
    setSearch('')
    setFilters({ care_level: '', price_min: '', price_max: '' })
    fetchPlants()
  }

return (
  <div className="page">
    <h1 className="section-title">All Plants</h1>
    <p className="section-sub">Find your perfect green companion</p>

    <form onSubmit={handleSearch} className="search-wrap">
      <input className="search-input" value={search}
        onChange={e => setSearch(e.target.value)} placeholder="Search plants..." />
      <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>Search</button>
      <button type="button" className="btn-primary" onClick={handleReset}
        style={{ padding: '12px 20px', background: 'var(--green-dim)', color: 'var(--accent)' }}>Reset</button>
    </form>

    <div className="filter-wrap">
      <select name="care_level" value={filters.care_level} onChange={handleFilterChange} className="filter-select">
        <option value="">All care levels</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <input name="price_min" value={filters.price_min} onChange={handleFilterChange}
        placeholder="Min price" type="number" className="filter-input" />
      <input name="price_max" value={filters.price_max} onChange={handleFilterChange}
        placeholder="Max price" type="number" className="filter-input" />
      <button onClick={handleSearch} className="btn-primary" style={{ padding: '10px 20px' }}>Apply</button>
    </div>

    {loading ? (
      <div className="empty"><div className="empty-icon">🌿</div><p>Loading plants...</p></div>
    ) : plants.length === 0 ? (
      <div className="empty"><div className="empty-icon">🔍</div><p>No plants found</p></div>
    ) : (
      <>
        <p style={{ color: 'var(--muted)', marginBottom: 8 }}>{plants.length} plants found</p>
        <div className="plant-grid">
          {plants.map(plant => <PlantCard key={plant.id} plant={plant} />)}
        </div>
      </>
    )}
  </div>
)
}

export default HomePage