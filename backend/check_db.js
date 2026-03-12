const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function checkDB() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const Product = require('./models/Product');

    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const adminUser = await User.findOne({ email: 'admin@gmail.com' });

    console.log('User Count:', userCount);
    console.log('Product Count:', productCount);
    console.log('Admin Exists:', !!adminUser);
    if (adminUser) {
        console.log('Admin isAdmin flag:', adminUser.isAdmin);
    }

    await mongoose.disconnect();
}

checkDB().catch(console.error);
