const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Banner Schema
const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroceryStore',
        required: true
    },
    zone: {
        type: String,  // Changed from ObjectId to String
        required: true
    },
    type: {
        type: String,
        enum: ['main', 'popup', 'sidebar'],
        default: 'main'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    priority: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Advertisement Schema
const advertisementSchema = new mongoose.Schema({
    title: {
        type: Map,
        of: String,
        required: true
    },
    description: {
        type: Map,
        of: String,
        default: () => new Map()
    },
    media: {
        type: String,
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroceryStore',
        required: true
    },
    type: {
        type: String,
        enum: ['banner', 'popup', 'sidebar'],
        required: true
    },
    targetAudience: {
        zones: [{
            type: String,  // Changed from ObjectId to String
            required: true
        }],
        demographics: {
            ageRange: {
                min: Number,
                max: Number
            },
            gender: {
                type: String,
                enum: ['male', 'female', 'all'],
                default: 'all'
            }
        }
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    },
    clicks: {
        type: Number,
        default: 0
    },
    impressions: {
        type: Number,
        default: 0
    },
    priority: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    }
}, {
    timestamps: true
});

// Add pagination plugin to both schemas
bannerSchema.plugin(mongoosePaginate);
advertisementSchema.plugin(mongoosePaginate);

// Create indexes for Banner
bannerSchema.index({ store: 1 });
bannerSchema.index({ zone: 1 });
bannerSchema.index({ status: 1 });
bannerSchema.index({ type: 1 });

// Create indexes for Advertisement
advertisementSchema.index({ store: 1 });
advertisementSchema.index({ status: 1 });
advertisementSchema.index({ type: 1 });
advertisementSchema.index({ startDate: 1, endDate: 1 });

const Banner = mongoose.model('GroceryBanner', bannerSchema);
const Advertisement = mongoose.model('GroceryAdvertisement', advertisementSchema);

module.exports = { Banner, Advertisement }; 