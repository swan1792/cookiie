const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Generate a cryptographically random 32-byte session ID (64 hex chars)
 */
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * SHA-256 hash of the session ID for storage in DB
 */
function hashSession(sessionId) {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

/**
 * Hash a password with bcrypt
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password against a bcrypt hash
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  generateSessionId,
  hashSession,
  hashPassword,
  comparePassword,
};
