# 🎁 Giftworld – Customized 3D-Printed Gifts E-Commerce Platform

A full-stack e-commerce web app for ordering personalized, photo-based 3D-printed gifts such as deity statues, couple and single figurines, and ready-made "Vault" items. Customers pick a print size, upload a reference photo, pay online through Razorpay and track their order. Admins manage products and fulfilment from a protected panel.

> B.Tech 7th Semester Major Project – Parul Institute of Technology, Parul University

---

## ✨ Features

**Customer**
- Browse four collections: Divine Statues, Customized Couples, Customized Singles and Vault
- Customize an item: choose a size (4" / 6" / 8", each with its own price) and upload a reference photo
- Cart drawer with delivery details (name, mobile, address)
- Secure online payment via Razorpay
- "My Orders" page with live order and payment status
- Ratings and reviews for products
- Sign up / sign in with Supabase Auth
- FAQ / support section

**Admin**
- Role-protected Admin Panel
- Add, edit and delete products with size-wise pricing and images
- View all orders and update status (`pending → processing → shipped → delivered`, or `cancelled`)

**Security**
- JWT verification on the backend for protected routes
- Role check (`requireAdmin`) on admin endpoints
- Razorpay payment verified server-side with HMAC-SHA256 signature check, plus a webhook as fallback

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, custom CSS, lucide-react, Lenis |
| Backend | Node.js, Express.js (REST API) |
| Database / Auth / Storage | Supabase (PostgreSQL, Auth, Storage) |
| Payments | Razorpay (Orders API, signature verification, webhooks) |
| Deployment | Cloudflare Pages (frontend), Render (backend) |

---

## 🏗️ Architecture

```
React + TypeScript SPA  ──HTTPS/JSON──►  Express REST API  ──►  Supabase (DB, Auth, Storage)
        │                                       │
        └──── Supabase Auth / photo upload ─────┘──►  Razorpay (create order, verify signature)
```

---

## 📁 Project Structure

```
printed-precious-gifts/
├── backend/            # Express REST API
│   └── index.js
├── frontend/           # React + TypeScript (Vite)
│   └── src/
│       ├── components/ # Header, Hero, MostPopular, OurCollection, CollectionView,
│       │               # CustomizeModal, CartDrawer, AuthModal, MyOrders, Reviews,
│       │               # Support, WhyChooseUs, AdminPanel
│       └── lib/        # Supabase client
└── package.json        # Root scripts (runs both apps together)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project
- A [Razorpay](https://razorpay.com) account (test keys are fine)

### 1. Clone and install
```bash
git clone https://github.com/KriXsh-09/printed-precious-gifts.git
cd printed-precious-gifts
npm run install-all
```

### 2. Configure environment variables

Create `backend/.env`:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
ADMIN_EMAIL=your_admin_email
```

Create `frontend/.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_ADMIN_EMAIL=your_admin_email
VITE_API_BASE_URL=http://localhost:5000
```

> ⚠️ Never commit `.env` files or the Supabase service-role key / Razorpay secret.

### 3. Set up Supabase
- Create the tables used by the app: `products`, `orders`, `reviews` and `user_roles`.
- Create a public Storage bucket named `user-customizations` for customer reference photos.
- Enable email/password sign-in under Authentication.

### 4. Run the app
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🔌 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/hero` | Public | Hero section content |
| GET | `/api/auth/role` | User | Get the signed-in user's role |
| GET | `/api/orders` | User | Own orders (all orders for admin) |
| POST | `/api/orders/initiate` | User | Create pending order and Razorpay order |
| POST | `/api/orders/verify` | User | Verify Razorpay signature, mark order paid |
| POST | `/api/orders/webhook` | Razorpay | Async payment event fallback |
| POST | `/api/orders` | User | Create an order |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/products` | Admin | Add a product |
| PUT | `/api/products/:id` | Admin | Edit a product |
| DELETE | `/api/products/:id` | Admin | Delete a product |

---

## 🖼️ Screenshots

_Add screenshots here: Home, Collection view, Customize modal, Cart, Razorpay checkout, My Orders, Admin Panel._

```md
![Home](screenshots/home.png)
```

---

## 🔮 Future Scope
- E-mail / SMS / WhatsApp notifications on order status change
- 3D-model preview for customer approval before production
- Supabase Row Level Security policies as an extra security layer
- Admin analytics dashboard
- More payment gateways and currencies
- Automated API and end-to-end tests

---

## 👤 Author

**Krishna Raj Prince** (2303051050385)
Supervisor: Sinal Patel
Parul Institute of Technology, Parul University
