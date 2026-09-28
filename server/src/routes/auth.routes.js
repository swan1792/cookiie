const express = require('express');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const SessionModel = require('../models/session.model');
const authMiddleware = require('../middleware/auth.middleware');
const {
  generateSessionId,
  hashSession,
  hashPassword,
  comparePassword,
} = require('../utils/crypto');

const router = express.Router();

const COOKIE_NAME = process.env.COOKIE_NAME || 'admin_session';
const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE) || 28800000; // 8 hours
const AUTH_MODE = process.env.AUTH_MODE || 'cookie';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await comparePassword(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (AUTH_MODE === 'cookie') {
      // === COOKIE MODE ===
      // Generate session ID and store hash in DB
      const sessionId = generateSessionId();
      const secretHash = hashSession(sessionId);
      const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE);

      await SessionModel.create({
        userId: user.id,
        secretHash,
        expiresAt,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Set HttpOnly cookie
      res.cookie(COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: false,       // Set true in production with HTTPS
        sameSite: 'Strict',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      // Return user data WITHOUT any token
      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // === JWT MODE (legacy) ===
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        XSessionToken: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Revoke session and clear cookie
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    if (AUTH_MODE === 'cookie' && req.sessionHash) {
      // Revoke session in DB
      await SessionModel.revoke(req.sessionHash);

      // Clear cookie
      res.cookie(COOKIE_NAME, '', {
        maxAge: 0,
        path: '/',
      });
    }

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user from session (validates session is still active)
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is already populated by authMiddleware
    return res.json({ user: req.user });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
