/**
 * Seed script — creates a test user with a known password
 * Run: node src/seed.js
 */
require('dotenv').config();

const UserModel = require('./models/user.model');
const { hashPassword } = require('./utils/crypto');

const TEST_USER = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'password123',
  role: 'admin',
};

const TEST_USER_2 = {
  name: 'Regular User',
  email: 'user@example.com',
  password: 'password123',
  role: 'user',
};

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create admin user
    const adminHash = await hashPassword(TEST_USER.password);
    const admin = await UserModel.create({
      name: TEST_USER.name,
      email: TEST_USER.email,
      passwordHash: adminHash,
      role: TEST_USER.role,
    });
    console.log(`✅ Admin created: ${admin.email} (id: ${admin.id})`);

    // Create regular user
    const userHash = await hashPassword(TEST_USER_2.password);
    const user = await UserModel.create({
      name: TEST_USER_2.name,
      email: TEST_USER_2.email,
      passwordHash: userHash,
      role: TEST_USER_2.role,
    });
    console.log(`✅ User created: ${user.email} (id: ${user.id})`);

    console.log('\n📋 Test credentials:');
    console.log(`   Admin: ${TEST_USER.email} / ${TEST_USER.password}`);
    console.log(`   User:  ${TEST_USER_2.email} / ${TEST_USER_2.password}`);
    console.log('\n🎉 Seed complete!');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('⚠️  Users already exist. Skipping seed.');
    } else {
      console.error('❌ Seed failed:', err.message);
      process.exit(1);
    }
  }

  process.exit(0);
}

seed();
