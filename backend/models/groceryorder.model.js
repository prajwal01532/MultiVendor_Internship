const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroceryCustomer',
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroceryStore',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GroceryProduct',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            default: 0
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'wallet'],
        required: true
    },
    zone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroceryZone'  // Reference to the Zone model
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'accepted', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'scheduled'],
        default: 'pending'
    },
    // statusHistory: [{
    //     status: {
    //         type: String,
    //         required: true
    //     }}],

    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    deliveryPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroceryDeliveryPerson'
    },
    scheduledDelivery: {
        isScheduled: {
            type: Boolean,
            default: false
        },
        scheduledTime: Date
    },
    notes: String,
    cancelReason: String,
    refundReason: String
}, {
    timestamps: true
});

// Add pagination plugin
orderSchema.plugin(mongoosePaginate);

// Create indexes for frequently queried fields
orderSchema.index({ orderId: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ store: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GroceryOrder', orderSchema);
