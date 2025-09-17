export default function CategoryFilter({ categories, active, onChange }){
  return (
    <div className="toolbar">
      {categories.map(c => (
        <button
          key={c}
          onClick={()=>onChange(c)}
          className={`pill ${c===active?'active':''}`}>
          {c.toLowerCase()}
        </button>
      ))}
    </div>
  )
}
