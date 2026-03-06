# 🚌 QBus — Sri Lanka's Bus Ticket Booking Platform

A full-stack web application for searching, booking, and managing bus tickets across Sri Lanka. Built with React on the frontend and Node.js/Express on the backend, backed by MongoDB.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Seeder](#-running-the-seeder)
- [Available Scripts](#-available-scripts)
- [API Endpoints](#-api-endpoints)
- [User Roles](#-user-roles)
- [Default Credentials](#-default-credentials)
- [Popular Routes Covered](#-popular-routes-covered)

---

## 🌟 Overview

QBus is a bus ticket booking webapp designed for Sri Lankan intercity travel. Users can search available bus trips between cities, choose individual seats on a visual seat map, and pay securely. Admins manage the entire fleet, trip schedules, and bookings through a dedicated control panel.

---

## ✨ Features

### For Passengers
- 🔍 **Search trips** by source city, destination city, and travel date
- 💺 **Interactive seat map** — see available vs. occupied seats and pick yours
- 🔐 **Secure authentication** — register/login with JWT-based sessions
- 💳 **Online payment** via Stripe Checkout
- 📧 **Email confirmation** sent automatically after every booking
- 📊 **User dashboard** — view all past and upcoming bookings, download tickets as PDF
- ❌ **Cancel bookings** directly from the dashboard

### For Admins
- 🚌 **Fleet Management** — add, edit, and remove buses; each bus has a fixed source/destination route
- 📅 **Trip Scheduling** — schedule single trips or create recurring weekly schedules; direction can be swapped (A→B or B→A); overnight trips are handled automatically
- 📋 **Booking Overview** — view all bookings with customer details, route, seats, and payment status
- 👥 **User Management** — browse all registered users
- ⚙️ **Settings** — change admin account password

---

## 🛠 Tech Stack

| Layer        | Technology |
|--------------|-----------|
| Frontend     | React 18, Vite, Tailwind CSS |
| Routing      | React Router v7 |
| Icons        | React Icons |
| PDF export   | jsPDF + jspdf-autotable |
| Backend      | Node.js, Express 4 |
| Database     | MongoDB (via Mongoose) |
| Auth         | JWT (jsonwebtoken) + bcryptjs |
| Payments     | Stripe Checkout |
| Email        | Nodemailer |
| Security     | Helmet, CORS, express-rate-limit |
| Dev tools    | Nodemon, ESLint |

---

## 📁 Project Structure

```
bus-ticket-webapp/
│
├── backend/                        # Express API server
│   ├── server.js                   # App entry point
│   ├── .env                        # Environment variables (not committed)
│   ├── .env.example                # Template for .env
│   ├── config/
│   │   └── db.js                   # MongoDB connection + auto seed admin
│   ├── controllers/
│   │   ├── adminController.js      # Fleet, schedules, bookings, users, settings
│   │   ├── authController.js       # Register & login
│   │   ├── bookingController.js    # Create & cancel bookings
│   │   ├── busController.js        # Public bus/schedule search
│   │   ├── paymentController.js    # Stripe checkout session
│   │   └── scheduleController.js   # Public schedule lookup
│   ├── middlewares/
│   │   └── authMiddleware.js       # JWT protect + adminProtect guards
│   ├── models/
│   │   ├── Booking.js              # Booking schema
│   │   ├── Bus.js                  # (legacy) Bus schema
│   │   ├── Fleet.js                # Fleet vehicle schema
│   │   ├── Schedule.js             # Trip schedule schema
│   │   └── User.js                 # User schema
│   ├── routes/
│   │   ├── adminRoutes.js          # /api/admin/*
│   │   ├── authRoutes.js           # /api/auth/*
│   │   ├── bookingRoutes.js        # /api/bookings/*
│   │   ├── busRoutes.js            # /api/buses/*
│   │   ├── paymentRoutes.js        # /api/payment/*
│   │   └── scheduleRoutes.js       # /api/schedules/*
│   └── utils/
│       ├── emailService.js         # Nodemailer booking confirmation
│       ├── seedAdmin.js            # Auto-seeds default admin on first run
│       └── seedData.js             # Full dev data seeder (10 buses + schedules)
│
└── frontend/                       # React + Vite SPA
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                 # Route definitions
        ├── main.jsx                # React DOM entry
        ├── context/
        │   └── AuthContext.jsx     # Global auth state (token, user, login/logout)
        ├── Components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProtectedRoute.jsx  # Redirects unauthenticated users
        │   └── AdminRoute.jsx      # Redirects non-admin users
        └── pages/
            ├── HomePage.jsx        # Landing page with search & popular routes
            ├── Login.jsx           # Login form
            ├── RegisterForm.jsx    # Registration form
            ├── SearchResultsPage.jsx  # Trip search results
            ├── BusSeats.jsx        # Seat selection page
            ├── BusSeat.jsx         # Individual seat map component
            ├── BookingSuccess.jsx  # Post-payment confirmation page
            ├── UserDashboard.jsx   # Passenger booking history
            └── admin/
                └── AdminDashboard.jsx  # Full admin control panel
```

---

## ✅ Prerequisites

Make sure the following are installed before setting up the project:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9+ (comes with Node.js)
- **MongoDB** — either a local installation or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A **Stripe** account (free) for payment processing — [stripe.com](https://stripe.com)
- An email account or SMTP service for Nodemailer (e.g. Gmail App Password)

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/bus-ticket-webapp.git
cd bus-ticket-webapp
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

```bash
cd ../backend
cp .env.example .env
```

Open `backend/.env` and fill in your values (see [Environment Variables](#-environment-variables) below).

### 5. Run the development servers

**Backend** (in one terminal):
```bash
cd backend
npm run dev
# Starts on http://localhost:5000
```

**Frontend** (in another terminal):
```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
```

### 6. Seed demo data (optional but recommended)

```bash
cd backend
npm run seed
```

This creates 10 buses, ~50 schedules for the next 5 days, and a test user account. See [Running the Seeder](#-running-the-seeder) for details.

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` folder. All variables listed below are required:

```env
# ── MongoDB ──────────────────────────────────────────────────────────────────
# Local:  mongodb://localhost:27017
# Atlas:  mongodb+srv://<user>:<password>@cluster.mongodb.net
MONGO_URI="mongodb+srv://your-user:your-password@cluster.mongodb.net"

# ── JWT ───────────────────────────────────────────────────────────────────────
# Generate a strong random string (e.g. openssl rand -hex 32)
JWT_SECRET="your-super-secret-jwt-key"

# ── Stripe ────────────────────────────────────────────────────────────────────
# Get from https://dashboard.stripe.com/apikeys  (use sk_test_... for dev)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# ── Email (Nodemailer) ────────────────────────────────────────────────────────
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"

# ── Frontend origin (for CORS) ────────────────────────────────────────────────
FRONTEND_URL="http://localhost:5173"

# ── Admin seed credentials (optional — defaults shown) ────────────────────────
ADMIN_EMAIL="admin@qbus.com"
ADMIN_PASSWORD="Admin@123"
```

> **Gmail tip:** App Passwords must be enabled via Google Account → Security → 2-Step Verification → App Passwords.

---

## 🌱 Running the Seeder

The seeder populates your database with realistic demo data so you can explore all features immediately.

```bash
cd backend

# Seed (skips anything already existing — safe to rerun)
npm run seed

# Wipe seed data and re-seed from scratch
npm run seed:wipe
```

### What gets created

| Type | Count | Details |
|------|-------|---------|
| Test user | 1 | `test@qbus.com` / `Test@123` |
| Fleet buses | 10 | 6 popular Sri Lankan routes, various bus types |
| Schedules | ~50 | Each bus scheduled for the **next 5 days** from today |

### Routes covered by the seeder

| Route | Bus Type | Depart | Arrive | Price |
|-------|----------|--------|--------|-------|
| Colombo → Jaffna | Luxury | 06:00 | 13:30 | Rs. 2,000 |
| Colombo → Jaffna | AC | 14:00 | 21:30 | Rs. 1,500 |
| Colombo → Kandy | AC | 07:00 & 15:30 | +2h45 | Rs. 700 |
| Colombo → Kandy | Non-AC | 10:00 & 17:00 | +2h45 | Rs. 400 |
| Colombo → Galle | AC | 08:00 & 16:00 | +2h30 | Rs. 650 |
| Colombo → Galle | Non-AC | 09:30 & 18:00 | +2h30 | Rs. 350 |
| Colombo → Nuwara Eliya | Semi-Luxury | 07:30 & 14:00 | +4h00 | Rs. 950 |
| Kandy → Anuradhapura | Non-AC | 09:00 & 14:00 | +3h30 | Rs. 750 |
| Colombo → Trincomalee | Luxury | 07:00 | 13:00 | Rs. 1,500 |
| Colombo → Trincomalee | AC (night) | 21:00 | 03:00+1d | Rs. 1,200 |

> All buses operate in **both directions** — admins can schedule return trips using the Swap button in the Trip Scheduling panel.

---

## 📜 Available Scripts

### Backend (`backend/`)

| Script | Command | Description |
|--------|---------|-------------|
| Start (production) | `npm start` | Runs `node server.js` |
| Start (dev) | `npm run dev` | Runs with nodemon (auto-restart on changes) |
| Seed data | `npm run seed` | Seeds 10 buses + schedules + test user |
| Wipe & re-seed | `npm run seed:wipe` | Wipes seed data then re-seeds |

### Frontend (`frontend/`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Vite dev server at `http://localhost:5173` |
| Build | `npm run build` | Production build into `dist/` |
| Preview | `npm run preview` | Preview production build locally |
| Lint | `npm run lint` | ESLint check |

---

## 📡 API Endpoints

### Auth  — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Create a new user account |
| POST | `/login` | Public | Login and receive JWT token |

### Schedules — `/api/schedules`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search` | Public | Search trips by source, destination, date |
| GET | `/:id` | Public | Get a single schedule's details |

### Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create a booking |
| GET | `/my` | User | Get the logged-in user's bookings |
| PUT | `/:id/cancel` | User | Cancel a booking |

### Payment — `/api/payment`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create-checkout-session` | User | Create a Stripe Checkout session |
| POST | `/verify` | User | Verify payment and confirm booking |

### Admin — `/api/admin` *(admin JWT required)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | All bookings |
| GET | `/fleet` | All fleet vehicles |
| POST | `/fleet` | Add a new vehicle |
| PUT | `/fleet/:id` | Edit a vehicle |
| DELETE | `/fleet/:id` | Remove a vehicle |
| GET | `/schedules` | All schedules |
| POST | `/schedules` | Create schedule (single or recurring) |
| DELETE | `/schedules/:id` | Delete a schedule |
| GET | `/users` | All registered users |
| PUT | `/settings/password` | Change admin password |

---

## 👤 User Roles

| Role | Access |
|------|--------|
| **Guest** | Browse homepage, view popular routes |
| **User** | All of guest + search trips, book seats, pay, manage own bookings |
| **Admin** | All of user + full admin control panel (fleet, schedules, bookings, users, settings) |

> The first admin account is auto-created when the backend starts for the first time (credentials set via `.env`).

---

## 🔑 Default Credentials

| Account | Email | Password |
|---------|-------|----------|
| Admin | `admin@qbus.com` | `Admin@123` |
| Test User | `test@qbus.com` | `Test@123` *(after running seed)* |

> **Important:** Change the admin password immediately after the first login in any non-local environment. Use the **Settings** panel in the Admin Dashboard.

---

## 🗺 Popular Routes Covered

These are the routes shown on the homepage quick-search cards. After seeding, all of them return real results:

| From | To | Duration | Freq |
|------|----|----------|------|
| Colombo | Jaffna | ~7h 30m | 2× Daily |
| Colombo | Kandy | ~2h 45m | 4× Daily |
| Colombo | Galle | ~2h 30m | 4× Daily |
| Colombo | Nuwara Eliya | ~4h 00m | 2× Daily |
| Kandy | Anuradhapura | ~3h 30m | 2× Daily |
| Colombo | Trincomalee | ~6h 00m | 2× Daily |

---

## 🔒 Security Notes

- Passwords are hashed with **bcryptjs** (never stored as plain text)
- All admin routes are protected by a **JWT + role check** middleware
- **Helmet** sets secure HTTP headers on every response
- Login endpoint is **rate-limited** (10 attempts per 15 minutes per IP)
- **CORS** is restricted to the configured `FRONTEND_URL` only
- Stripe payments use **Checkout Sessions** (card data never touches the server)

---

## 📄 License

This project is for educational/portfolio purposes. Feel free to use and adapt it.
