import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useState } from 'react'

export default function Header(){
  const { count } = useCart()
  const [q, setQ] = useState('')
  const nav = useNavigate()

  const onSearch = (e) => {
    e.preventDefault()
    nav(`/?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="header">
      <div className="container nav">
        <Link className="logo" to="/">Food Land</Link>
        <form className="searchbar" onSubmit={onSearch}>
          <input placeholder="Search dishes..." value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn">Search</button>
        </form>
        <Link to="/cart" className="cart-badge">
          🛒 Cart
          <span className="count">{count}</span>
        </Link>
      </div>
    </header>
  )
}
