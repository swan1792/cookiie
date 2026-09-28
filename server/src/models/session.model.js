const pool = require('../utils/db');

const SessionModel = {
  /**
   * Create a new session in the database
   * @param {object} params
   * @param {number} params.userId
   * @param {string} params.secretHash - SHA-256 hash of the session cookie value
   * @param {Date} params.expiresAt
   * @param {string} [params.ip]
   * @param {string} [params.userAgent]
   */
  async create({ userId, secretHash, expiresAt, ip, userAgent }) {
    const now = new Date();
    const [result] = await pool.execute(
      `INSERT INTO admin_sessions (user_id, secret_hash, expires_at, created_at, last_seen_at, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, secretHash, expiresAt, now, now, ip || null, userAgent || null]
    );
    return result.insertId;
  },

  /**
   * Find a valid session by its hash
   * Returns the session row if found and not expired/revoked, null otherwise
   */
  async findValidByHash(secretHash) {
    const [rows] = await pool.execute(
      `SELECT s.*, u.name, u.email, u.role
       FROM admin_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.secret_hash = ?
         AND s.expires_at > NOW()
         AND s.revoked_at IS NULL
       LIMIT 1`,
      [secretHash]
    );
    return rows[0] || null;
  },

  /**
   * Update last_seen_at for session activity tracking
   */
  async touch(secretHash) {
    await pool.execute(
      'UPDATE admin_sessions SET last_seen_at = NOW() WHERE secret_hash = ?',
      [secretHash]
    );
  },

  /**
   * Revoke a session (logout)
   */
  async revoke(secretHash) {
    await pool.execute(
      'UPDATE admin_sessions SET revoked_at = NOW() WHERE secret_hash = ? AND revoked_at IS NULL',
      [secretHash]
    );
  },

  /**
   * Delete expired sessions (cleanup)
   */
  async deleteExpired() {
    const [result] = await pool.execute(
      'DELETE FROM admin_sessions WHERE expires_at < NOW()'
    );
    return result.affectedRows;
  },

  /**
   * Get all active sessions for a user
   */
  async findActiveByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT id, created_at, last_seen_at, ip, user_agent
       FROM admin_sessions
       WHERE user_id = ? AND expires_at > NOW() AND revoked_at IS NULL
       ORDER BY last_seen_at DESC`,
      [userId]
    );
    return rows;
  },
};

module.exports = SessionModel;
