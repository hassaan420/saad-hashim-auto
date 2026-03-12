/**
 * Admin Seeder — run once:  node seeder.js
 * Creates admin@gmail.com / pass1122 with isAdmin: true
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
const dotenv = require('dotenv');
dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);

    const User = require('./models/User');

    const email = 'admin@gmail.com';
    const plainPassword = 'pass1122';

    const existing = await User.findOne({ email });
    if (existing) {
        // If already exists, ensure isAdmin flag is set
        existing.isAdmin = true;
        await existing.save();
        console.log('✅ Existing user updated to admin:', email);
    } else {
        // Hash password using bcrypt (same rounds as User model)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        await User.create({
            name: 'Admin',
            email,
            password: hashedPassword,
            phone: '03000000000',
            isAdmin: true,
        });
        console.log('✅ Admin user created:', email);
    }

    await mongoose.disconnect();
    console.log('Done.');
}

seed().catch(err => {
    console.error('❌ Seeder error:', err.message);
    process.exit(1);
});
