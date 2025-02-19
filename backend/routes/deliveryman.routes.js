const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const deliverymanController = require('../controllers/deliveryman.controller');
const auth = require('../middleware/auth');

// Configure multer for disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const uploadMulter = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const uploadFields = uploadMulter.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'identityImages', maxCount: 5 }
]);

// All routes require authentication
router.use(auth);

// Create deliveryman
router.post('/',
    uploadFields,
    [
        check('firstName', 'First name is required').not().isEmpty(),
        check('lastName', 'Last name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('phone', 'Phone number is required').not().isEmpty(),
        check('deliverymanType', 'Deliveryman type is required').not().isEmpty(),
        check('zone', 'Zone is required').not().isEmpty(),
        check('vehicle', 'Vehicle type is required').not().isEmpty(),
        check('identityType', 'Identity type is required').not().isEmpty(),
        check('identityNumber', 'Identity number is required').not().isEmpty(),
        check('password', 'Password must be at least 8 characters').isLength({ min: 8 })
    ],
    deliverymanController.createDeliveryMan
);

// Get all deliverymen
router.get('/', deliverymanController.getAllDeliveryMen);

// Get single deliveryman
router.get('/:id', deliverymanController.getDeliveryMan);

// Update deliveryman
router.put('/:id',
    uploadFields,
    deliverymanController.updateDeliveryMan
);

// Delete deliveryman
router.delete('/:id', deliverymanController.deleteDeliveryMan);

module.exports = router;