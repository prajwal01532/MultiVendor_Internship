require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/admin.model');

async function createAdminUser() {
    try {
        // Connect to MongoDB using environment variable
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get admin credentials from environment variables
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
        const adminLastName = process.env.ADMIN_LAST_NAME || 'User';
        const adminPhone = process.env.ADMIN_PHONE;

        // Validate required environment variables
        if (!adminEmail || !adminPassword || !adminPhone) {
            console.error('Missing required environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE');
            process.exit(1);
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user with environment variables
        const admin = new Admin({
            firstName: adminFirstName,
            lastName: adminLastName,
            email: adminEmail,
            password: adminPassword,
            phone: adminPhone,
            isActive: true
        });

        await admin.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

// Run the script
createAdminUser(); 