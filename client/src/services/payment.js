import axios from 'axios'


const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function createOrder({ amount, customer, cart }) {
  const { data } = await axios.post(`${API_BASE}/api/create-order`, { amount, customer, cart })
  return data
}
export async function getOrderStatus(order_id) {
  const { data } = await axios.get(`${API_BASE}/api/order-status`, { params: { order_id } })
  return data
}
