import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import AddressForm from '../components/AddressForm.jsx'
import { createOrder } from '../services/payment.js'
const CF_MODE = (import.meta.env.VITE_CASHFREE_ENV || 'sandbox').toLowerCase(); // 'sandbox' or 'production'

async function payNow(total, customer, cart) {
  // 1) Create order on your server
  const { payment_session_id, order_id } = await createOrder({
    amount: total,
    customer, cart
  });

  if (!payment_session_id) {
    alert('Failed to create Cashfree order');
    return;
  }

  // 2) Start Cashfree checkout using JS SDK (do NOT open Cashfree URL directly)
  const cashfree = new window.Cashfree({ mode: CF_MODE }); // <-- uses sandbox in Vercel now
  cashfree.checkout({
    paymentSessionId: payment_session_id,
    redirectTarget: "_self"     // returns to /success?order_id={order_id}
  });
}
export default function Checkout(){
  const { items, total } = useCart()
  const [addr, setAddr] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const saved = localStorage.getItem('address')
    if (saved) setAddr(JSON.parse(saved))
  },[])
  useEffect(()=>{
    localStorage.setItem('address', JSON.stringify(addr))
  },[addr])

  const toPay = Number((total + (total>0 ? 29 : 0)).toFixed(2))

  const handlePay = async () => {
    if (items.length === 0) return alert('Cart empty')
    if (!addr?.phone || String(addr.phone).length < 10) return alert('Enter a valid phone')
    setLoading(true)
    try {
      const { payment_session_id } = await createOrder({
        amount: toPay,
        customer: {
          id: addr.phone,
          name: addr.name || 'Guest User',
          email: addr.email || 'guest@example.com',
          phone: addr.phone
        },
        cart: items.map(i => ({ id:i.id, name:i.name, price:i.price, qty:i.qty }))
      })

      
      const cashfree = window.Cashfree?.({ mode: import.meta.env.PROD ? 'production':'sandbox' })
      if (!cashfree) return alert('Cashfree SDK not loaded')
      await cashfree.checkout({ paymentSessionId: payment_session_id, redirectTarget: '_self' })
    } catch (e){
      console.error(e)
      alert(e?.response?.data?.error || 'Failed to start payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row" style={{gridTemplateColumns: '2fr 1fr'}}>
      <div className="cart-panel">
        <h2>Delivery Address</h2>
        <AddressForm value={addr} onChange={setAddr} />
        <h2 style={{marginTop:24}}>Order Summary</h2>
        <div className="list">
          {items.map(it => (
            <div key={it.id} className="item">
              <img src={it.img} alt={it.name} />
              <div className="grow">
                <div style={{fontWeight:700}}>{it.name}</div>
                <div className="muted">x{it.qty}</div>
              </div>
              <div className="price">₹{(it.price * it.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="summary">
        <h3>Payment</h3>
        <div style={{display:'grid', gap:6, marginBottom:12}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span>Items total</span><span>₹{total.toFixed(2)}</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span>Delivery</span><span>₹{(total>0? 29:0).toFixed(2)}</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontWeight:800}}>
            <span>To Pay</span><span>₹{toPay.toFixed(2)}</span>
          </div>
        </div>
        <button className="btn" onClick={handlePay} disabled={loading}>
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
        <div className="muted" style={{marginTop:8, fontSize:12}}>
          You will be redirected to secure Cashfree Checkout.
        </div>
      </div>
    </div>
  )
}

