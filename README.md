# 🛒 TechCart — Full-Stack E-Commerce Web Application

A full-stack e-commerce web application built using **React, Node.js, Express.js, and MySQL**. TechCart provides a responsive shopping experience with product search, category filtering, cart state management via React Context, secure user authentication with JWT, checkout validation, and database-backed order processing.

---

## 🏗️ Architecture

```
React (Vite) Frontend
       ↓  (HTTP / JSON via fetch)
REST API (Express.js)
       ↓  (mysql2 connection pool)
MySQL Database (techcart)
```

- **Frontend**: React 19, Vite, React Router v7, React Context API, Vanilla CSS.
- **Backend**: Node.js, Express.js, CORS, Dotenv.
- **Database**: MySQL / MariaDB (`techcart`), relational schema with foreign key constraints.
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing.

---

## ✨ Features

- **Product Catalog**: Live browsing of cutting-edge tech gadgets with images, prices, categories, and ratings.
- **Live Search & Filter**: Instant search by product title and category filter pills (`Smartphones`, `Laptops`, `Audio`, `Smart Watches`, `Gaming`).
- **Product Details Page**: Dynamic route `/products/:id` with quantity selector, price discounts, and breadcrumbs.
- **Shopping Cart**:
  - Global state managed via React Context (`CartContext`).
  - Add to cart with duplicate prevention (increments quantity if already in cart).
  - Quantity controls (`+` / `-` with minimum limit of 1).
  - Item removal and clear cart option.
  - Cart totals and item counts calculated dynamically.
  - Cart persistence via `localStorage`.
- **User Authentication**:
  - Secure registration and login with bcrypt-hashed passwords.
  - JWT issued upon authentication and saved in browser storage.
  - Protected API routes and protected checkout/orders.
- **Order Processing**:
  - Checkout form with client-side field validation.
  - **Tamper-Proof Price Calculation**: Order totals are calculated on the backend from verified database prices, rather than trusting client inputs.
  - Database transactions to ensure atomic creation of orders and line items.
- **Order History**:
  - Dedicated `/orders` page displaying past orders, line items, timestamps, and order status pills.
  - Isolated access: users can only view their own orders.

---

## 📂 Project Structure

```
techcart/
├── src/
│   ├── assets/              # Static logos and visuals
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Responsive header with dynamic auth & cart badge
│   │   ├── Hero.jsx         # Hero banner
│   │   ├── CategoryCard.jsx # Category tile component
│   │   ├── ProductCard.jsx  # Product listing card
│   │   ├── CartItem.jsx     # Cart item row component
│   │   └── Footer.jsx       # 4-column footer
│   ├── context/             # Global React Context providers
│   │   ├── AuthContext.jsx  # User authentication & token state
│   │   └── CartContext.jsx  # Shopping cart state & actions
│   ├── data/                # Mock data & offline fallback
│   │   └── products.js
│   ├── pages/               # Page views
│   │   ├── Home.jsx         # Landing page
│   │   ├── Products.jsx     # Catalog with search & category filters
│   │   ├── ProductDetails.jsx # Detailed product view (/products/:id)
│   │   ├── Cart.jsx         # Shopping cart view (/cart)
│   │   ├── Checkout.jsx     # Checkout & shipping form (/checkout)
│   │   ├── Login.jsx        # Login page (/login)
│   │   ├── Register.jsx     # Registration page (/register)
│   │   ├── Orders.jsx       # User order history (/orders)
│   │   └── NotFound.jsx     # 404 page
│   ├── services/
│   │   └── api.js           # Centralized API service with offline fallback
│   ├── App.jsx              # Main App entry with routing
│   ├── App.css              # Custom styling
│   └── main.jsx
│
├── public/
│   └── products/            # High-resolution product image assets
│
├── backend/
│   ├── config/
│   │   ├── db.js            # MySQL connection pool
│   │   └── initDb.js        # Automatic DB creation & seed script
│   ├── controllers/
│   │   ├── authController.js    # User registration & login handlers
│   │   ├── productController.js # Product CRUD handlers
│   │   └── orderController.js   # Order creation & history handlers
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── schema.sql           # SQL schema export
│   ├── server.js            # Express server entrypoint
│   ├── test-api.js          # Automated backend test suite
│   ├── verify-full-stack.js # Comprehensive 14-point test suite
│   ├── package.json
│   └── .env
│
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram (ERD)

```
users (1) ──< orders (M) ──< order_items (M) >── (1) products
```

- **`users`**: Stores user credentials with bcrypt password hashes.
- **`products`**: Stores product details, pricing, categories, and image paths.
- **`orders`**: Stores order metadata, user reference (`user_id`), total amount, and shipping details.
- **`order_items`**: Stores junction records connecting an order with multiple products, including ordered quantity and snapshot price.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server (via XAMPP, standalone, or Docker)

### 1. Database Setup
Ensure MySQL is running on port 3306 (default root user, no password or configure in `backend/.env`).
Run the initialization script to automatically create the `techcart` database, tables, and seed initial products:

```bash
cd backend
npm install
npm run init-db
```

### 2. Start Backend Server
```bash
# inside backend/
npm start
# Server starts on http://localhost:5000
```

### 3. Start Frontend Client
In a separate terminal window:
```bash
# from root directory
npm install
npm run dev
# Client starts on http://localhost:5173 (or 5174)
```

---

## 📡 API Endpoints

### Products
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/products` | Retrieve all products (supports `?category=` and `?search=`) | Public |
| `GET` | `/api/products/:id` | Retrieve product details by ID | Public |
| `POST` | `/api/products` | Create a product | Admin |
| `PUT` | `/api/products/:id` | Update a product | Admin |
| `DELETE` | `/api/products/:id` | Delete a product | Admin |

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user, returns JWT | Public |
| `POST` | `/api/auth/login` | Authenticate user, returns JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |

### Orders
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/orders` | Place order (recalculates total on server) | Private |
| `GET` | `/api/orders` | Retrieve authenticated user's orders | Private |
| `GET` | `/api/orders/:id` | Retrieve single order details | Private |

---

## 🧪 Testing the Project

Run the automated 14-point test suite:
```bash
cd backend
node verify-full-stack.js
```

All 14 tests verify:
1. Health check
2. Products retrieval from MySQL
3. Category filtering
4. Search filtering
5. Product details
6. 404 on invalid product
7. User registration & JWT generation
8. Duplicate registration rejection
9. Password comparison on login
10. Rejection of bad credentials
11. Server-side price calculation & order placement
12. Relational order history fetching
13. Unauthorized order creation blockage (401)
14. Unauthorized order history blockage (401)

---

## 💡 Interview Concepts & Explanations

1. **Why React Context instead of Prop Drilling?**
   - In a complex application with multiple pages (`Navbar`, `Products`, `ProductDetails`, `Cart`, `Checkout`), passing cart state down 3 levels through props causes unnecessary re-renders and tightly couples parent components to child requirements. React Context provides a centralized state accessible anywhere via `useCart()`.
2. **Why calculate the order total on the backend?**
   - In client applications, JavaScript execution and network payloads can be tampered with by malicious actors using DevTools. Recalculating the total on the backend by querying the true database price prevents price tampering.
3. **How does JWT Authentication work?**
   - When a user logs in, the server verifies their bcrypt-hashed password. Upon success, the server signs a JSON Web Token containing the user's ID using a secret key. The client attaches this token in the `Authorization: Bearer <token>` header for private requests. The server validates the signature on each request without requiring a server-side session store.
4. **Why use Database Transactions when creating orders?**
   - Creating an order involves inserting into the `orders` table and multiple rows in `order_items`. Using `connection.beginTransaction()`, `commit()`, and `rollback()` ensures ACID compliance: either the complete order and all its items are saved together, or nothing is saved if an error occurs.
