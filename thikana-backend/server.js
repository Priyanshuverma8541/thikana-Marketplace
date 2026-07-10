// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./src/config/db');
// const v1Routes = require('./src/routes/v1/index');
// const { apiLimiter } = require('./src/middleware/rateLimit');

// const app = express();

// connectDB();

// // CORS - explicit allowlist, not a wildcard
// const allowedOrigins = [
//   process.env.FRONTEND_URL || 'http://localhost:5173',
//   process.env.ADMIN_URL || 'http://localhost:5174', 
//   // Production (Vercel)
//   "https://thikana-marketplace.vercel.app",
//   "https://thikana-marketplace-vvqt.vercel.app",
// ];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
//       callback(new Error('Not allowed by CORS'));
//     },
//     credentials: true
//   })
// );

// app.use(express.json({ limit: '2mb' }));
// app.use('/api/v1', apiLimiter, v1Routes);

// app.get('/', (req, res) => {
//   res.json({ success: true, data: { message: 'Thikana API is running', version: 'v1' } });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
// });

// // Global error handler (catches anything unhandled)
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Thikana backend running on port ${PORT}`));


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const v1Routes = require('./src/routes/v1/index');
const { apiLimiter } = require('./src/middleware/rateLimit');

const app = express();

connectDB();

// Render sits behind a proxy - needed for correct IPs in rate limiting/logging
app.set('trust proxy', 1);

// Strip trailing slashes so an env var typo (or Vercel's own formatting) can never
// silently break an exact-match CORS check.
function normalizeOrigin(url) {
  return url ? url.replace(/\/+$/, '') : url;
}

const allowedOrigins = [
  normalizeOrigin(process.env.FRONTEND_URL) || 'http://localhost:5173',
  normalizeOrigin(process.env.ADMIN_URL) || 'http://localhost:5174',
  // Hardcoded fallbacks so a missing/misconfigured env var never locks you out entirely
  'https://thikana-marketplace.vercel.app',
  'https://thikana-marketplace-vvqt.vercel.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // no origin = server-to-server or curl/Postman - always allow
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(normalizeOrigin(origin))) return callback(null, true);
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '2mb' }));

// Render's health check + a quick way to confirm the API is actually up
app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'Thikana API is running', version: 'v1' } });
});
app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.use('/api/v1', apiLimiter, v1Routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, error: { code: 'CORS_BLOCKED', message: 'Origin not allowed' } });
  }
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Thikana backend running on port ${PORT}`));