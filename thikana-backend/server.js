require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const v1Routes = require('./src/routes/v1/index');
const { apiLimiter } = require('./src/middleware/rateLimit');

const app = express();

connectDB();

// CORS - explicit allowlist, not a wildcard
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:5174'
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '2mb' }));
app.use('/api/v1', apiLimiter, v1Routes);

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'Thikana API is running', version: 'v1' } });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Global error handler (catches anything unhandled)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Thikana backend running on port ${PORT}`));
