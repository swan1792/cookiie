const pool = require('../utils/db');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, passwordHash, role = 'user' }) {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );
    return { id: result.insertId, name, email, role };
  },
};

module.exports = UserModel;
