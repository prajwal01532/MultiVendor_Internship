const mongoose = require('mongoose');

const vehicleCategorySchema = new mongoose.Schema({
    vehicleType: {
        type: String,
        required: [true, 'Vehicle type is required'],
        unique: true,
        trim: true,
        index: true
    },
    extraCharges: {
        type: Number,
        default: 0,
        min: [0, 'Extra charges cannot be negative']
    },
    startingCoverage: {
        type: Number,
        default: 0,
        min: [0, 'Starting coverage cannot be negative']
    },
    maxCoverage: {
        type: Number,
        default: 0,
        min: [0, 'Maximum coverage cannot be negative'],
        validate: {
            validator: function(value) {
                // Ensure both values are parsed as numbers and handle potential undefined/null values
                const maxCoverage = parseFloat(value);
                const startingCoverage = parseFloat(this.startingCoverage) || 0;
                
                // Add debug logging
                console.log('Validation values:', {
                    maxCoverage,
                    startingCoverage,
                    comparison: maxCoverage >= startingCoverage
                });
                
                return !isNaN(maxCoverage) && !isNaN(startingCoverage) && maxCoverage >= startingCoverage;
            },
            message: 'Maximum coverage must be greater than or equal to starting coverage'
        }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

// Create compound index for coverage range
vehicleCategorySchema.index({ startingCoverage: 1, maxCoverage: 1 });

// Pre-save middleware to ensure proper number conversion
vehicleCategorySchema.pre('save', function(next) {
    if (this.isModified('startingCoverage') || this.isModified('maxCoverage')) {
        this.startingCoverage = parseFloat(this.startingCoverage) || 0;
        this.maxCoverage = parseFloat(this.maxCoverage) || 0;
    }
    next();
});

module.exports = mongoose.model('VehicleCategory', vehicleCategorySchema); 