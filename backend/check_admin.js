const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function checkAdmin() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (admin) {
        console.log('ADMIN_FOUND');
        console.log('IS_ADMIN:', admin.isAdmin);
    } else {
        console.log('ADMIN_NOT_FOUND');
    }
    await mongoose.disconnect();
}
checkAdmin();
