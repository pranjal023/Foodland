import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { customAlphabet } from 'nanoid';

const app = express();
app.use(express.json());

// CORS Setup 

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow tools like Postman
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
  })
);

const {
  CASHFREE_ENV = 'sandbox',
  CASHFREE_APP_ID,
  CASHFREE_SECRET,
  API_VERSION = '2025-01-01',
} = process.env;

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 24);

const CF_BASE =
  CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

// Create Order 
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', customer = {}, cart = [] } = req.body || {};

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET) {
      return res.status(500).json({ error: 'Cashfree credentials missing' });
    }

    const order_id = `order_${nanoid()}`;

    // Return url
    const clientUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
    const return_url = `${clientUrl}/success?order_id={order_id}`;

    const payload = {
      order_id,
      order_amount: Number(amount),
      order_currency: currency,
      customer_details: {
        customer_id: customer?.id || customer?.phone || nanoid(),
        customer_name: customer?.name || 'Guest',
        customer_email: customer?.email || 'guest@example.com',
        customer_phone: customer?.phone || '9999999999',
      },
      order_meta: { return_url },
      order_tags: { cart_count: String(cart?.length || 0) },
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET,
    };

    const { data } = await axios.post(`${CF_BASE}/orders`, payload, { headers });
    return res.json({
      order_id: data.order_id || order_id,
      payment_session_id: data.payment_session_id,
    });
  } catch (err) {
    console.error('Create order error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to create Cashfree order' });
  }
});

// health 
app.get('/', (_req, res) => res.json({ ok: true }));

// --- Port ---
const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 5001);
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
