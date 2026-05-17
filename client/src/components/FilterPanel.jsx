function FilterPanel({ filters, onChange, onApply, onReset }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
      <select name="care_level" value={filters.care_level} onChange={onChange}
        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}>
        <option value="">All care levels</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <input name="price_min" value={filters.price_min} onChange={onChange}
        placeholder="Min price" type="number"
        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', width: 120 }} />
      <input name="price_max" value={filters.price_max} onChange={onChange}
        placeholder="Max price" type="number"
        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', width: 120 }} />
      <button onClick={onApply}
        style={{ padding: '8px 16px', background: '#2d8a4e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        Apply
      </button>
      <button onClick={onReset}
        style={{ padding: '8px 16px', background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        Reset
      </button>
    </div>
  )
}
export default FilterPanel