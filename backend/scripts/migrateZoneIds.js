const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Store = require('../models/foodstore.model');
const Order = require('../models/foodorder.model');
const Coupon = require('../models/foodcoupon.model');
const { Banner, Advertisement } = require('../models/foodbannerandad.model');

async function migrateCollection(Model, name, zoneField = 'zone') {
    const items = await Model.find({});
    let migrated = 0;

    for (const item of items) {
        try {
            const field = zoneField.includes('.') ? 
                zoneField.split('.').reduce((obj, key) => obj[key], item) :
                item[zoneField];

            if (field && field instanceof mongoose.Types.ObjectId) {
                if (zoneField.includes('.')) {
                    // Handle nested fields (e.g., targetAudience.zones)
                    const [parent, child] = zoneField.split('.');
                    item[parent][child] = field.toString();
                } else {
                    item[zoneField] = field.toString();
                }
                await item.save();
                migrated++;
            }
        } catch (error) {
            console.error(`Error migrating ${name} ${item._id}:`, error);
        }
    }

    console.log(`Migrated ${migrated}/${items.length} ${name} zone IDs`);
    return migrated;
}

async function migrateZoneIds() {
    try {
        // Connect to MongoDB with proper options
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        console.log('Connected to MongoDB');

        // Migrate all collections
        const migrations = await Promise.all([
            migrateCollection(Store, 'Store'),
            migrateCollection(Order, 'Order'),
            migrateCollection(Coupon, 'Coupon'),
            migrateCollection(Banner, 'Banner'),
            migrateCollection(Advertisement, 'Advertisement', 'targetAudience.zones')
        ]);

        const totalMigrated = migrations.reduce((sum, count) => sum + count, 0);
        console.log(`Migration completed successfully. Total migrated: ${totalMigrated}`);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        try {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
        }
        process.exit(0);
    }
}

// Handle process errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run migration
migrateZoneIds(); 