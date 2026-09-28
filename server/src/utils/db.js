const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway exposes DB vars with different names depending on how the service is linked.
// DATABASE_URL  — set when MySQL is linked as a service variable
// MYSQL_URL     — alternative Railway variable name
// MYSQLHOST etc — individual Railway MySQL vars
const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
const dbHost = process.env.MYSQLHOST || process.env.DB_HOST;
const dbUser = process.env.MYSQLUSER || process.env.DB_USER;
const dbPass = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME;
const dbPort = process.env.MYSQLPORT || process.env.DB_PORT;

console.log('🔧 DB env check:', {
  hasDATABASE_URL: !!process.env.DATABASE_URL,
  hasMYSQL_URL: !!process.env.MYSQL_URL,
  hasMYSQLHOST: !!process.env.MYSQLHOST,
  dbHost,
  dbUser,
  dbName,
  dbPort,
});

let poolConfig;

if (dbUrl) {
  // Parse connection URL
  const url = new URL(dbUrl);
  poolConfig = {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    port: parseInt(url.port) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
} else if (dbHost) {
  // Individual variables (Railway or local)
  poolConfig = {
    host: dbHost,
    user: dbUser || 'root',
    password: dbPass || '',
    database: dbName || 'railway',
    port: parseInt(dbPort) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
} else {
  // Local development fallback
  poolConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cookie_auth_test',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

console.log('🔧 DB connecting to:', poolConfig.host + ':' + poolConfig.port + '/' + poolConfig.database);

const pool = mysql.createPool(poolConfig);

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
