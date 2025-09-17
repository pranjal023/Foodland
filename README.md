# 🍔 Food Ordering App (React + Cashfree) — TheMealDB 

Swiggy/Zomato‑style frontend with cart, delivery address, order summary, and **Cashfree Checkout** payment.  
Data comes from **TheMealDB** API, and prices are randomly generated **₹120–₹399**.

- Frontend: React + Vite, plain CSS
- Backend: Express + Axios (creates Cashfree order and verifies status)
- Payment: Cashfree PG, using JS SDK v3 (Checkout)



## TheMealDB Endpoints Used
- `GET https://www.themealdb.com/api/json/v1/1/categories.php`
- `GET https://www.themealdb.com/api/json/v1/1/filter.php?c=<Category>`
- `GET https://www.themealdb.com/api/json/v1/1/search.php?s=<term>`
