const User = require('../models/User');

const DEFAULT_ADMIN = {
  name: 'Admin',
  email: process.env.ADMIN_EMAIL || 'admin@qbus.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  role: 'admin',
};

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return; // Already have an admin — nothing to do

    // The User model's pre-save hook hashes the password automatically
    await User.create(DEFAULT_ADMIN);

    console.log('\n' + '═'.repeat(52));
    console.log('  ✅  Default Admin account created');
    console.log('═'.repeat(52));
    console.log(`  Email    : ${DEFAULT_ADMIN.email}`);
    console.log(`  Password : ${DEFAULT_ADMIN.password}`);
    console.log('  ⚠️  Change these credentials in production!');
    console.log('  Override via ADMIN_EMAIL / ADMIN_PASSWORD in .env');
    console.log('═'.repeat(52) + '\n');
  } catch (err) {
    console.error('[seedAdmin] Failed to seed admin user:', err.message);
  }
};

module.exports = seedAdmin;
