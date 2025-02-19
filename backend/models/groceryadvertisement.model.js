const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
    image: {
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
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroceryUser'
    }
}, {
    timestamps: true
});

// Add pagination plugin
advertisementSchema.plugin(mongoosePaginate);

// Create indexes
advertisementSchema.index({ store: 1 });
advertisementSchema.index({ status: 1 });
advertisementSchema.index({ type: 1 });
advertisementSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('GroceryAdvertisement', advertisementSchema); 