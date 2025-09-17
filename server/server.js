import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { customAlphabet } from 'nanoid';

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || '*'}));

const {
  CASHFREE_ENV = 'sandbox',
  CASHFREE_APP_ID,
  CASHFREE_SECRET,
  SERVER_PORT = 5001,
  API_VERSION = '2025-01-01'
} = process.env;

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 24);

const CF_BASE = CASHFREE_ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';


app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', customer = {}, cart = [] } = req.body || {};
    if (CASHFREE_ENV === 'mock') {
      const order_id = `order_${nanoid()}`;
      return res.json({ order_id, payment_session_id: `mock_session_${nanoid()}`, mock: true });
    }
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET) {
      return res.status(500).json({ error: 'Cashfree credentials not set in server/.env' });
    }
    if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const order_id = `order_${nanoid()}`;
    const return_url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/success?order_id={order_id}`;

    const payload = {
      order_id,
      order_amount: Number(amount),
      order_currency: currency,
      customer_details: {
        customer_id: customer?.id || customer?.phone || nanoid(),
        customer_name: customer?.name || 'Guest',
        customer_email: customer?.email || 'guest@example.com',
        customer_phone: customer?.phone || '9999999999'
      },
      order_meta: { return_url },
      order_tags: { cart_count: String(cart?.length || 0) }
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET
    };

    const { data } = await axios.post(`${CF_BASE}/orders`, payload, { headers });
    if (!data?.payment_session_id) {
      return res.status(502).json({ error: 'No payment_session_id received', raw: data });
    }
    return res.json({ order_id: data.order_id || order_id, payment_session_id: data.payment_session_id });
  } catch (err) {
    console.error('Create order error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to create Cashfree order', detail: err?.response?.data || err.message });
  }
});


app.get('/api/order-status', async (req, res) => {
  try {
    const { order_id } = req.query;
    if (!order_id) return res.status(400).json({ error: 'Missing order_id' });
    if (CASHFREE_ENV === 'mock') return res.json({ order_id, order_status: 'PAID', mock: true });

    const headers = {
      'x-api-version': API_VERSION,
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET
    };
    const { data } = await axios.get(`${CF_BASE}/orders/${order_id}`, { headers });
    return res.json(data);
  } catch (err) {
    console.error('Get order error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to fetch order', detail: err?.response?.data || err.message });
  }
});

app.get('/', (_req, res) => res.json({ ok: true }));

app.listen(Number(SERVER_PORT), () => {
  console.log(`Server listening on http://localhost:${SERVER_PORT}  (env: ${CASHFREE_ENV})`);
});
