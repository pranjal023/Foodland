import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { getOrderStatus } from '../services/payment.js'
import { useCart } from '../context/CartContext.jsx'

export default function Success(){
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const order_id = params.get('order_id')

  const [status, setStatus] = useState('CHECKING')
  const [data, setData] = useState(null)
  const { clear } = useCart()

  useEffect(()=>{
    let ignore = false
    async function run(){
      if (!order_id) return
      try{
        const res = await getOrderStatus(order_id)
        if (ignore) return
        setData(res)
        const st = (res?.order_status || res?.orderStatus || '').toUpperCase()
        setStatus(st)
        if (st === 'PAID' || st === 'SUCCESS') clear()
      }catch(e){
        console.error(e)
        setStatus('ERROR')
      }
    }
    run()
    return () => { ignore = true }
  }, [order_id])

  return (
    <div className="summary">
      <h2>Payment Status</h2>
      {!order_id && <p>Missing order_id.</p>}
      {order_id && status === 'CHECKING' && <p>Validating payment...</p>}
      {status === 'PAID' && (
        <div>
          <h3>🎉 Payment Successful</h3>
          <p>Your order <strong>{order_id}</strong> has been paid.</p>
          <Link to="/" className="btn">Back to Home</Link>
        </div>
      )}
      {status && status !== 'PAID' && status !== 'CHECKING' && status !== 'ERROR' && (
        <div>
          <h3>Status: {status}</h3>
          <p>If you were charged but status is pending, wait a minute and refresh.</p>
          <div style={{marginTop:12}}><Link className="btn" to="/">Home</Link></div>
        </div>
      )}
      {status === 'ERROR' && <p>Could not confirm order. Please contact support.</p>}

    </div>
  )
}
