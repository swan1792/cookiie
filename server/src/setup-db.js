/**
 * Database setup script — creates the database and tables
 * Run: node src/setup-db.js
 */
require('dotenv').config();

const mysql = require('mysql2/promise');

async function setupDatabase() {
  // Connect without specifying a database first
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

  console.log('✅ Connected to MySQL');

  // Create database
  await connection.query('CREATE DATABASE IF NOT EXISTS cookie_auth_test');
  console.log('✅ Database "cookie_auth_test" created');

  await connection.query('USE cookie_auth_test');

  // Create users table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Table "users" created');

  // Create admin_sessions table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      secret_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME NULL,
      created_at DATETIME NOT NULL,
      last_seen_at DATETIME NOT NULL,
      ip VARCHAR(45) NULL,
      user_agent TEXT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Table "admin_sessions" created');

  await connection.end();
  console.log('\n🎉 Database setup complete!');
}

setupDatabase().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
