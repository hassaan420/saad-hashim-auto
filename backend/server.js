const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dns = require('dns');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();
connectDB();

const app = express();

// --- SECURITY HEADERS ---
app.use(helmet());

// --- COMPRESSION ---
app.use(compression());

// --- REQUEST LOGGING ---
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// --- SANITIZATION ---
// Note: `express-mongo-sanitize` and `xss-clean` may attempt to reassign `req.query` which
// is a getter in newer Express versions. Avoid assigned to `req.query` to
// prevent runtime errors. We'll rely on validation +
// parameterized queries for NoSQL injection protection.
// --- RATE LIMITING ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts per 15 min
  message: { message: '⛔ Too many attempts. Try again in 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // max 200 requests per 10 min
  message: { message: '⛔ Too many requests. Slow down.' }
});

// --- CORS ---
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: frontendUrl, credentials: true }));

app.use(express.json({ limit: '10kb' })); // limit body size
app.use('/uploads', express.static('uploads'));

// Validate important envs
if (!process.env.MONGO_URI) console.warn('Warning: MONGO_URI not set');
if (!process.env.JWT_SECRET) console.warn('Warning: JWT_SECRET not set');

// Apply rate limiters
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));

app.get('/', (req, res) => {
  res.json({ message: '🏍️ Saad Hashim Auto Store API is running!' });
});

const PORT = process.env.PORT || 5000;
// Global error handler — never expose stack traces to users
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message
  });
});
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
