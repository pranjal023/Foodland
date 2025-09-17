import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import CartPage from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Success from './pages/Success.jsx'
import { CartProvider } from './context/CartContext.jsx'

export default function App(){
  return (
    <CartProvider>
      <div className="app">
        <Header />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </div>
        <div className="footer">Built with  React + Cashfree</div>
      </div>
    </CartProvider>
  )
}
