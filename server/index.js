require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const corsMiddleware = require('./src/middleware/cors.middleware');
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3001;
const AUTH_MODE = process.env.AUTH_MODE || 'cookie';

// ─── Middleware ────────────────────────────────────────────
app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

// ─── Request logging ──────────────────────────────────────
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    authMode: AUTH_MODE,
    timestamp: new Date().toISOString(),
  });
});

// ─── Start server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Auth mode: ${AUTH_MODE.toUpperCase()}`);
  console.log(`📋 API base: http://localhost:${PORT}/api\n`);
});
