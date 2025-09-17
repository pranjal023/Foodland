import { useCart } from '../context/CartContext.jsx'

export default function FoodCard({ item }) {
  const { add, inc, dec, items } = useCart()
  const qty = items.find(p => p.id === item.id)?.qty || 0

  return (
    <div className="card">
      <div style={{ position: 'relative' }}>
        <img src={item.img} alt={item.name} />
        {qty > 0 && (
          <span className="badge">{qty}</span>
        )}
      </div>

      <div className="title">{item.name}</div>
      <div className="muted">{item.dsc?.slice(0, 70) || '—'}</div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', marginTop: 2}}>
        <span className="price">₹{item.price}</span>
        <span className="rating">★ {item.rate || '4.3'}</span>
      </div>

      {qty === 0 ? (
        <button
          className="btn"
          onClick={() => add({ id: item.id, name: item.name, price: Number(item.price), img: item.img })}
        >
          Add to Cart
        </button>
      ) : (
        <div className="inline-qty">
          <button className="pill" onClick={() => dec(item.id)}>-</button>
          <strong>{qty}</strong>
          <button className="pill" onClick={() => inc(item.id)}>+</button>
        </div>
      )}
    </div>
  )
}

