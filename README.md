# CampusMart — AI-Enhanced College Peer-to-Peer Marketplace

**CampusMart** is a full-stack, AI-powered campus marketplace built exclusively for verified college students (such as `@vitbhopal.ac.in`). Students can buy, sell, negotiate, and trade textbooks, electronics, hostel essentials, cycles, and more within their own campus community with zero platform commission.

---

## ✨ Key Features

### 🎓 1. Verified Campus Authentication & Security
- **Institutional Email Verification**: Restricts registration to verified student email domains (`@vitbhopal.ac.in`) with 6-digit OTP verification powered by Brevo Email API.
- **JWT Session Management**: Secure token-based authentication with role-based access control (`buyer`, `seller`, `admin`).
- **Password Recovery**: Self-service forgot-password flow using time-bound email OTPs.

### 🤖 2. Google Gemini AI Integration
- **AI Auto-Fill Listing Generator**: Upload a photo of any item on the **Create Listing** page and Gemini Vision automatically generates an accurate **Title**, **Category**, **Condition**, **Suggested Campus Price (₹)**, **Description**, and **Search Tags**.
- **AI Smart Search**: Understands natural-language queries (e.g., *"cheap engineering physics book under 400 in good condition"*) and converts them into structured category, condition, and price filters.

### 💬 3. Real-Time Student Chat (`Socket.IO`)
- **Instant Messaging**: Dedicated two-pane messaging interface with real-time message delivery, typing indicators, unread badges, and product context headers.
- **Email & In-App Alerts**: Notifies offline peers when they receive a new chat message or trade offer.

### 🤝 4. Peer-to-Peer Offer, Negotiation & UPI QR Payment System
- **Make an Offer**: Buyers can propose custom offers or use quick discount presets (`-10%`, `-15%`, `-20%`) on negotiable listings.
- **Accept / Reject / Counter**: Sellers manage incoming offers from the **Offers** dashboard and can accept, reject, or send a counter-offer.
- **Verified UPI QR Checkout**: Sellers can upload their UPI QR code (`jsQR` validates that the image contains a genuine `upi://pay` QR payload), allowing buyers to scan and pay directly once an offer is accepted.

### ⭐ 5. Trust, Ratings & Community Safety
- **Peer Reviews & Star Ratings**: Students can rate and review sellers after campus transactions, visible on seller profiles.
- **Community Reporting**: Flag suspicious or policy-violating listings (`scam`, `fake`, `inappropriate`, `wrong-info`) directly from the product page.

### 🛡️ 6. Admin Moderation Dashboard
- **Live Marketplace Analytics**: Real-time counters for Registered Students, Active Campus Listings, Student Peer Trades, and Pending Safety Reports.
- **Paginated Directories**: Browse and moderate **Registered Students** (4 per page), **Community Reports** (1 per page with Resolve/Dismiss actions), and **Campus Marketplace Listings** (with instant search and one-click listing removal).
- **Direct Listing Moderation**: Admins see a **Delete this listing** button alongside **Report this listing** on every product detail page.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI & State** | React 18 (`.jsx` Components & Custom Hooks), Tailwind CSS v3 (Dark/Light Mode), FontAwesome 6, `esbuild` |
| **Client Integrations** | Socket.IO Client (Real-Time Chat), `jsQR` + `QuickChart` (UPI QR decoding & dynamic amount QR generation) |
| **Backend Runtime** | Node.js, Express.js (`^4.18.2`) |
| **Database** | MongoDB, Mongoose ODM (`^7.6.3`) |
| **Real-Time Engine** | Socket.IO (`^4.7.2`) |
| **AI Service** | Google Generative AI SDK (`@google/generative-ai` — Gemini Flash) |
| **Media Storage** | Multer (Memory Storage) + Cloudinary v2 |
| **Transactional Email** | Brevo HTTP Email API + Nodemailer fallback |

---

## 📂 Project Architecture

```text
CampusMart/
├── public/                        # Compiled production build output served by Express
│   ├── index.html                 # Single-Page Application (SPA) entry shell (<div id="root">)
│   ├── css/
│   │   └── tailwind.css           # Compiled & minified Tailwind CSS bundle
│   └── js/
│       └── bundle/
│           └── react-bundle.js    # Compiled & minified React 18 application bundle
├── src/                           # React 18 + Tailwind CSS source code
│   ├── main.jsx                   # React 18 root entry point & synchronous SPA mounter
│   ├── App.jsx                    # Application router & component registry
│   ├── styles/
│   │   └── tailwind.css           # Tailwind directives & Light/Dark theme CSS variables
│   ├── components/                # Reusable React UI components
│   │   ├── layout/
│   │   │   ├── Navbar.jsx         # Responsive glassmorphic navbar with Dark/Light mode toggle
│   │   │   └── Footer.jsx         # Campus marketplace footer
│   │   ├── marketplace/
│   │   │   └── ProductCard.jsx    # Reusable product listing card
│   │   └── ui/
│   │       └── PaginationSlider.jsx
│   ├── hooks/                     # Custom React hooks for page state & side-effects
│   │   ├── useProductDetail.js    # Product gallery, offers, reviews & reporting logic
│   │   ├── useChat.js             # Socket.IO real-time messaging & conversation state
│   │   ├── useOffers.js           # Buyer/seller offer negotiation & dynamic UPI QR modal
│   │   ├── useProfile.js          # Profile management, UPI QR decoder & peer ratings
│   │   └── useAdminDashboard.js   # Admin analytics, user moderation & report resolution
│   ├── utils/                     # Shared React utilities & helpers
│   │   ├── common.js              # Theme manager, JWT helpers, favorites & UPI QR parser
│   │   └── authHelper.js          # Login, 4-campus VIT registration & 6-digit OTP modal
│   └── pages/                     # Modular React .jsx page views
│       ├── admin/
│       │   └── AdminDashboardPage.jsx
│       ├── auth/
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── marketplace/
│       │   ├── HomePage.jsx
│       │   ├── ProductsPage.jsx
│       │   ├── ProductDetailPage.jsx
│       │   ├── CreateListingPage.jsx
│       │   ├── MyListingsPage.jsx
│       │   └── FavoritesPage.jsx
│       └── user/
│           ├── ProfilePage.jsx
│           ├── OffersPage.jsx
│           └── ChatPage.jsx
├── server/                        # Node.js + Express Backend
│   ├── server.js                  # Express app, API routes, Socket.IO & SPA catch-all
│   ├── config/
│   │   ├── db.js                  # MongoDB connection setup
│   │   └── cloudinary.js          # Cloudinary configuration
│   ├── controllers/               # Route business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── offerController.js
│   │   ├── favoriteController.js
│   │   ├── reviewController.js
│   │   ├── reportController.js
│   │   ├── chatController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & adminOnly guard
│   │   ├── upload.js              # Multer + Cloudinary image uploader
│   │   └── errorHandler.js        # Centralized error response middleware
│   ├── models/                    # Mongoose Schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Offer.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── Review.js
│   │   ├── Report.js
│   │   ├── Favorite.js
│   │   └── Otp.js
│   ├── routes/                    # Express REST API routers
│   ├── services/
│   │   └── aiService.js           # Gemini AI image analysis & smart search service
│   ├── socket/
│   │   └── socketHandler.js       # Real-time Socket.IO room & messaging events
│   └── utils/
│       ├── sendEmail.js           # Brevo email notification & OTP sender
│       └── seedCategories.js      # Default campus marketplace categories
├── tailwind.config.js             # Tailwind CSS theme & content configuration
├── package.json                   # Project scripts and dependencies
└── .env.example                   # Environment variable template
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** `v18+` and **npm**
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Cloudinary Account** (for product image uploads)
- **Google Gemini API Key** (for AI Auto-Fill & Smart Search)
- **Brevo API Key** *(optional in development — falls back to console OTP logging if omitted)*

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on [`.env.example`](file:///a:/Local%20Marketplace%20Project/.env.example):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campusmart
JWT_SECRET=your_jwt_secret_here

# Cloudinary Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Email Notifications & OTP via Brevo (Optional in local dev)
BREVO_API_KEY=your_brevo_api_key_here
EMAIL_FROM=your_verified_sender_email@gmail.com
APP_URL=http://localhost:5000
```

### 4. Build & Run
Build the React `.jsx` and Tailwind CSS bundles and start the server:

```bash
# Build JSX + Tailwind CSS and start the server
npm run dev
```

Or run individual build steps:
```bash
npm run build:jsx   # Bundles src/main.jsx -> public/js/bundle/react-bundle.js
npm run build:css   # Compiles src/styles/tailwind.css -> public/css/tailwind.css
npm run build       # Runs both build:jsx and build:css
npm start           # Builds assets and starts server/server.js
```

Open **`http://localhost:5000`** in your browser.

---

## 🔌 REST API Overview

| Group | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/send-otp` | `POST` | Send 6-digit registration OTP to college email |
| | `/api/auth/register` | `POST` | Verify OTP and register student account |
| | `/api/auth/login` | `POST` | Authenticate student/admin and return JWT |
| | `/api/auth/me` | `GET` | Get current logged-in user profile |
| | `/api/auth/profile` | `PUT` | Update profile details or UPI Payment QR |
| **Products** | `/api/products` | `GET` | List products with category, price, condition, search & sort filters |
| | `/api/products/:id` | `GET` | Get single product details & increment view count |
| | `/api/products` | `POST` | Create a new campus listing (supports up to 5 images) |
| | `/api/products/:id` | `PUT / DELETE` | Update listing status/details or delete listing |
| | `/api/products/ai-autofill` | `POST` | Generate listing details from uploaded photo via Gemini AI |
| | `/api/products/smart-search` | `POST` | Parse natural language query into structured filters |
| **Offers** | `/api/offers` | `POST` | Submit a price offer on a listing |
| | `/api/offers/my` | `GET` | Get buyer's sent offers & seller's received offers |
| | `/api/offers/:id/respond` | `PUT` | Accept, reject, or counter an offer |
| **Chat** | `/api/chat/conversations` | `GET / POST` | List or start a conversation about a product |
| | `/api/chat/messages/:conversationId` | `GET` | Fetch message history for a conversation |
| | `/api/chat/messages` | `POST` | Send a message and trigger real-time/email notification |
| **Reviews** | `/api/reviews` | `POST` | Submit a star rating and review for a seller |
| | `/api/reviews/user/:userId` | `GET` | Get all reviews for a specific user |
| **Reports** | `/api/reports` | `POST` | Report a listing or user to campus moderators |
| **Admin** | `/api/admin/stats` | `GET` | Get platform counts, recent listings, and reports |
| | `/api/admin/users` | `GET` | List all registered students |
| | `/api/admin/users/:id` | `DELETE` | Remove a user and their listings |
| | `/api/admin/reports/:id` | `PUT` | Update report status (`resolved`, `dismissed`, `investigating`) |
| **Health** | `/api/health` | `GET` | Health check endpoint (`200 OK` with server uptime) |

---

## 🌐 Deployment (Render / Cloud)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **24/7 Keep-Alive**: [`server/server.js`](file:///a:/Local%20Marketplace%20Project/server/server.js#L79-L86) includes an automatic 14-minute self-ping to `/api/health` when `RENDER_EXTERNAL_URL` or `APP_URL` is configured, preventing cold starts on free hosting tiers.
