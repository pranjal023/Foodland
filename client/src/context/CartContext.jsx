import React, { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }){
  const [items, setItems] = useState([])

  const add = (product) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === product.id)
      if (idx !== -1){
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 }
        return copy
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const inc = (id) => setItems(prev => prev.map(p => p.id === id ? { ...p, qty: p.qty + 1 } : p))
  const dec = (id) => {
  setItems(prev =>
    prev.flatMap(item => {
      if (item.id !== id) return [item];
      if (item.qty > 1) return [{ ...item, qty: item.qty - 1 }];
      
      return [];
    })
  );
};
  const remove = (id) => setItems(prev => prev.filter(p => p.id !== id))
  const clear = () => setItems([])

  const total = useMemo(() => Number(items.reduce((s,p)=> s + p.price * p.qty, 0).toFixed(2)), [items])
  const count = useMemo(() => items.reduce((s,p)=> s + p.qty, 0), [items])

  const value = { items, add, inc, dec, remove, clear, total, count }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
