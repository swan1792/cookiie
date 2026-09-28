const jwt = require('jsonwebtoken');
const { hashSession } = require('../utils/crypto');
const SessionModel = require('../models/session.model');

const COOKIE_NAME = process.env.COOKIE_NAME || 'admin_session';
const AUTH_MODE = process.env.AUTH_MODE || 'cookie';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

/**
 * Authentication middleware — supports both cookie and JWT modes
 *
 * Cookie mode: reads session from HttpOnly cookie, hashes it, looks up in DB
 * JWT mode: reads X-Session-Token header, verifies JWT
 */
async function authMiddleware(req, res, next) {
  try {
    if (AUTH_MODE === 'cookie') {
      return await handleCookieAuth(req, res, next);
    } else {
      return handleJwtAuth(req, res, next);
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Cookie-based authentication
 */
async function handleCookieAuth(req, res, next) {
  const sessionCookie = req.cookies[COOKIE_NAME];

  if (!sessionCookie) {
    return res.status(401).json({ error: 'No session cookie found' });
  }

  // Hash the cookie value and look up in DB
  const secretHash = hashSession(sessionCookie);
  const session = await SessionModel.findValidByHash(secretHash);

  if (!session) {
    // Clear invalid cookie
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  // Touch the session (update last_seen_at)
  await SessionModel.touch(secretHash);

  // Attach user to request
  req.user = {
    id: session.user_id,
    name: session.name,
    email: session.email,
    role: session.role,
  };
  req.sessionHash = secretHash;

  next();
}

/**
 * JWT-based authentication (legacy mode)
 */
function handleJwtAuth(req, res, next) {
  const token = req.headers['x-session-token'];

  if (!token) {
    return res.status(401).json({ error: 'No session token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
