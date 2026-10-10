const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = require('./config/db');
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Parse JSON payloads (up to 10mb for QR images)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public folder if present
app.use(express.static(path.join(__dirname, '../public')));

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const offerRoutes = require('./routes/offerRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Health Check Endpoint (used by Render & Uptime monitors to keep server awake 24/7)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: Math.round(process.uptime()) });
});

// React SPA Catch-All Route: serve public/index.html for all frontend routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global Error Handler Middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Setup Server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development. Should be restricted in production.
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

// Initialize socket handlers
const socketHandler = require('./socket/socketHandler');
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

  // Automatic 14-minute self-ping on Render so free tier stays awake 24/7
  const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;
  if (externalUrl && externalUrl.startsWith('http')) {
    const https = require('https');
    setInterval(() => {
      https.get(`${externalUrl.replace(/\/$/, '')}/api/health`, () => {}).on('error', () => {});
    }, 14 * 60 * 1000);
  }
});
