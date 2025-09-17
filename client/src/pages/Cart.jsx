import { useCart } from '../context/CartContext.jsx'
import { Link } from 'react-router-dom'

export default function CartPage(){
  const { items, inc, dec, remove, total, clear } = useCart()
  return (
    <div className="row" style={{gridTemplateColumns: '2fr 1fr'}}>
      <div className="cart-panel">
        <h2>Your Cart</h2>
        <div className="list">
          {items.length === 0 && <p>No items yet.</p>}
          {items.map(it => (
            <div key={it.id} className="item">
              <img src={it.img} alt={it.name} />
              <div className="grow">
                <div style={{fontWeight:700}}>{it.name}</div>
                <div className="muted">₹{it.price}</div>
              </div>
              <div className="qty">
                <button className="pill" onClick={()=>dec(it.id)}>-</button>
                <strong>{it.qty}</strong>
                <button className="pill" onClick={()=>inc(it.id)}>+</button>
              </div>
              <div className="price">₹{(it.price * it.qty).toFixed(2)}</div>
              <button className="pill" onClick={()=>remove(it.id)}>Remove</button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{display:'flex',gap:8,marginTop:16}}>
            <button className="btn secondary" onClick={clear}>Clear</button>
            <Link to="/checkout" className="btn">Checkout</Link>
          </div>
        )}
      </div>
      <div className="summary">
        <h3>Summary</h3>
        <div style={{display:'grid', gap:6}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span>Items total</span><span>₹{total.toFixed(2)}</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span>Delivery</span><span>₹{(total>0? 29:0).toFixed(2)}</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontWeight:800}}>
            <span>To Pay</span><span>₹{(total + (total>0?29:0)).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
