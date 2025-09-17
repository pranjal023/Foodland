# 🍔 Food Ordering App (React + Cashfree) — TheMealDB edition

Swiggy/Zomato‑style frontend with cart, delivery address, order summary, and **Cashfree Checkout** payment.  
Data comes from **TheMealDB** API and prices are randomly generated **₹120–₹399**.

- Frontend: React + Vite, plain CSS
- Backend: Express + Axios (creates Cashfree order and verifies status)
- Payment: Cashfree PG, using JS SDK v3 (Checkout)

## Quickstart

### 1) Backend (Cashfree)
```bash
cd server
npm i
cp .env.example .env   # put your Cashfree sandbox keys
npm run dev
```

### 2) Frontend
```bash
cd client
npm i
npm run dev
```

- Backend: http://localhost:5001
- Frontend: http://localhost:5173

> Set `CASHFREE_ENV=mock` in `server/.env` if you want to simulate a successful payment without keys.

## TheMealDB Endpoints Used
- `GET https://www.themealdb.com/api/json/v1/1/categories.php`
- `GET https://www.themealdb.com/api/json/v1/1/filter.php?c=<Category>`
- `GET https://www.themealdb.com/api/json/v1/1/search.php?s=<term>`
