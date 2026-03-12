/**
 * Admin Seeder — run once:  node seeder.js
 * Creates admin@gmail.com / pass1122 with isAdmin: true
 */

const mongoose = require('mongoose');
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
        // Reset password as plain text — pre-save hook will hash it once
        existing.password = plainPassword;
        existing.isAdmin = true;
        await existing.save();
        console.log('✅ Existing user password reset and isAdmin set:', email);
    } else {
        // Pass plain password — the User pre-save hook will hash it
        await User.create({
            name: 'Admin',
            email,
            password: plainPassword,
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
