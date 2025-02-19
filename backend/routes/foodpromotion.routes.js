const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const promotionController = require('../controllers/foodpromotion.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(auth);

// Coupon routes
router.post('/coupons', [
    check('code', 'Coupon code is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date is required').isISO8601(),
    check('type', 'Invalid coupon type').isIn(['general', 'store', 'product', 'category', 'first_order']),
    check('discountType', 'Invalid discount type').isIn(['percentage', 'fixed']),
    check('discountValue', 'Discount value must be a positive number').isFloat({ min: 0 }),
    check('minimumPurchase', 'Minimum purchase must be a non-negative number').optional().isFloat({ min: 0 }),
    check('maximumDiscount', 'Maximum discount must be a positive number').optional().isFloat({ min: 0 }),
    check('usageLimit.perUser', 'Per user limit must be a positive integer').optional().isInt({ min: 1 }),
    check('usageLimit.total', 'Total usage limit must be a positive integer').optional().isInt({ min: 1 })
], promotionController.createCoupon);

router.get('/coupons', promotionController.listCoupons);

// Update coupon status route
router.patch('/coupons/:id/status', promotionController.updateCouponStatus);

router.post('/coupons/validate', [
    check('code', 'Coupon code is required').not().isEmpty(),
    check('userId', 'User ID is required').not().isEmpty(),
    check('storeId', 'Store ID is required').not().isEmpty(),
    check('products', 'Products array is required').isArray(),
    check('totalAmount', 'Total amount must be a positive number').isFloat({ min: 0 })
], promotionController.validateCoupon);

// Delete coupon route
router.delete('/coupons/:id', promotionController.deleteCoupon);

module.exports = router;
