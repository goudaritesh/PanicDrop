# PanicDrop: AI-Driven E-Commerce & Predictive Inventory Ecosystem 🚀

PanicDrop is a modern, high-performance, full-stack e-commerce platform and intelligent inventory management ecosystem designed for the Indian digital marketplace. The platform delivers a fast, seamless shopping experience for customers and provides administrators with real-time operations monitoring, order fulfillment workflows, and AI-driven predictive demand forecasting.

---

## 📌 Project Overview

- **Title**: PanicDrop: AI-Driven E-Commerce & Predictive Inventory Ecosystem
- **Target Marketplace**: Indian E-Commerce (INR `₹`, UPI/COD/NetBanking, 6-digit Indian PIN Code delivery estimator)
- **Catalog Scale**: 10,000+ realistic products aligned with the Flipkart Sales Dataset across 6 core departments
- **Live Tech Stack**:
  - **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts
  - **Backend**: Node.js, Express.js (REST API, JWT Auth, Route Guards)
  - **Database**: MongoDB (Mongoose with compound indexing & in-memory fallback)
  - **Deployment**: Vercel (Frontend) & Render (Backend API)

---

## 👥 Module & Team Responsibilities

### 🔹 Member 2: User Authentication + Admin Dashboard
- **Secure Authentication & Authorization**:
  - Full JWT-based auth lifecycle with bcrypt password encryption.
  - Role-based Route Protection (`ProtectedRoute`) separating Customer and Administrator access.
  - Pre-seeded 1-Click Demo accounts for rapid testing.
- **Centralized Admin Dashboard**:
  - **Sales & Revenue Overview**: Real-time KPI cards for Total Revenue (₹), Orders Count, Registered Users, and Catalog Volume.
  - **Analytics & Demand Insights**: Interactive Recharts visualizations with **Day-wise, Week-wise, and Month-wise** filters.
  - **Top-Selling Products**: Volume analytics identifying high-demand items.
  - **AI Demand Forecasting**: Automated alerts & replenishment recommendations based on sales velocity.
  - **Order Fulfillment Monitoring**: Filterable orders pipeline (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
  - **User Directory**: Customer list management with role clearance promotions/demotions.

---

### 🔹 Member 3: Product Browsing & Search + Product Details
- **High-Performance Catalog (`/catalog`)**:
  - 10,000+ products across Mobiles & Accessories, Electronics & Audio, Smart Wearables, Fashion & Lifestyle, Home & Kitchen, and Beauty & Sports.
  - Lightning-fast pagination across 417+ pages (<15ms response time).
- **Search, Filtering & Sorting**:
  - Real-time search by title, category, brand, and keywords.
  - Multi-faceted sidebar filters: Category, Brand, Price Range (₹), Rating (4★+), and In-Stock Only.
  - Sorting by Price (Low to High, High to Low), Customer Rating, and Newest Arrivals.
- **Product Details (`/product/:id`)**:
  - Multi-angle image gallery with thumbnail switcher.
  - Indian Pricing breakdown (Selling Price, MRP, Savings/Discount %).
  - Stock availability badges (`In Stock`, `Only X Left`, `Out of Stock`).
  - 6-digit Indian PIN Code delivery calculator.
  - Verified customer ratings and review submissions.
  - 1-Click `Add to Cart`, `Buy Now` (instant checkout), and `Wishlist` management.

---

### 🔹 Member 1: EDA, Feature Engineering & Machine Learning (Upcoming Phase)
- Integration with Flipkart Sales Dataset (`Sales.csv` & `products.csv`).
- Exploratory Data Analysis (EDA) and trend modeling using `procured_quantity`.
- Python-based short-term demand forecasting with Scikit-learn.

---

## 🛠️ Tech Stack & Architecture

```
PanicDrop/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB Connection & In-Memory Store
│   │   ├── controllers/     # Auth, Product, Order, Admin Controllers
│   │   ├── middleware/      # JWT Protect & Admin Authorization Guards
│   │   ├── models/          # User, Product, Order Schemas
│   │   ├── routes/          # RESTful Express Endpoints (/api/...)
│   │   ├── seed/            # 10,000 Item Dataset Generator
│   │   └── server.js        # Server Entrypoint (Port 5000)
│   └── package.json
│
├── src/
│   ├── components/          # Navbar, Footer, ProductCard, CartDrawer, ProtectedRoute
│   ├── context/             # AuthContext, CartContext, WishlistContext
│   ├── lib/                 # INR Formatters & Currency Utilities
│   ├── pages/               # Landing, Catalog, ProductDetail, Wishlist, Checkout, Orders, AdminDashboard, Login, Register, Profile
│   ├── services/            # Axios/Fetch API Bridge
│   ├── App.jsx              # React Router Navigation
│   └── main.jsx
├── vercel.json              # Vercel SPA Routing Configuration
├── tailwind.config.js
└── package.json
```

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/goudaritesh/PanicDrop.git
cd PanicDrop
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run start
# Backend runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
# In the root project directory:
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🌐 Cloud Deployment Guide

### Deploy Backend to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository: `https://github.com/goudaritesh/PanicDrop`.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add Environment Variables:
   - `PORT`: `5000`
   - `JWT_SECRET`: `your_secure_jwt_secret_key`
   - `MONGO_URI`: *(Optional: MongoDB Atlas Connection String)*

---

### Deploy Frontend to Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Framework Preset** to `Vite`.
3. Set **Root Directory** to `./`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://<your-render-backend-url>.onrender.com/api`
5. Click **Deploy**.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@panicdrop.com` | `admin123` |
| **Customer** | `customer@panicdrop.com` | `customer123` |

---

## 📄 License
This project is licensed under the MIT License.
