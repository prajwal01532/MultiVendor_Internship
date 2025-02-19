const mongoose = require('mongoose');
const validator = require('validator');
const mongoosePaginate = require('mongoose-paginate-v2');

const deliverymanSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    deliverymanType: {
        type: String,
        required: [true, 'Deliveryman type is required'],
        enum: {
            values: ['full_time', 'part_time', 'contract'],
            message: 'Please select a valid deliveryman type'
        }
    },
    zone: {
        type: String,
        required: [true, 'Zone is required'],
        trim: true
    },
    vehicle: {
        type: String,
        required: [true, 'Vehicle type is required'],
        trim: true
    },
    identityType: {
        type: String,
        required: [true, 'Identity type is required'],
        enum: {
            values: ['passport', 'driving', 'nid'],
            message: 'Please select a valid identity type'
        }
    },
    identityNumber: {
        type: String,
        required: [true, 'Identity number is required'],
        unique: true
    },
    profileImage: {
        type: String,
        required: [true, 'Profile image is required']
    },
    identityImages: [{
        type: String,
        required: [true, 'Identity images are required']
    }],
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        validate: {
            validator: function(v) {
                return /^\+?[\d\s-]{10,}$/.test(v);
            },
            message: 'Please provide a valid phone number'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    currentLocation: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    }
}, {
    timestamps: true
});

// Indexes
deliverymanSchema.index({ currentLocation: '2dsphere' });
deliverymanSchema.index({ phone: 1 }, { unique: true });
deliverymanSchema.index({ email: 1 }, { unique: true });
deliverymanSchema.index({ identityNumber: 1 }, { unique: true });

// Virtual for full name
deliverymanSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Add pagination plugin
deliverymanSchema.plugin(mongoosePaginate);

const Deliveryman = mongoose.model('Deliveryman', deliverymanSchema);

module.exports = Deliveryman; 