// Usage: node scripts/createAdmin.js "Your Name" your@email.com yourPassword123
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function run() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.log('Usage: node scripts/createAdmin.js "Your Name" your@email.com yourPassword123');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    if (!existing.role.includes('admin')) existing.role.push('admin');
    await existing.save();
    console.log(`Existing user "${email}" upgraded to admin.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name, email, passwordHash, role: ['admin'] });
    console.log(`Admin account created: ${email}`);
  }
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
