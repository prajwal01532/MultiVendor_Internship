const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createVehicleCategory,
    getAllVehicleCategories,
    getVehicleCategory,
    updateVehicleCategory,
    deleteVehicleCategory
} = require('../controllers/vehicleCategoryController');

// All routes require authentication
router.use(auth);

// Vehicle category routes
router.route('/')
    .post([
        check('vehicleType', 'Vehicle type is required').not().isEmpty(),
        check('extraCharges', 'Extra charges must be a non-negative number').optional().isFloat({ min: 0 }),
        check('startingCoverage', 'Starting coverage must be a non-negative number').optional().isFloat({ min: 0 }),
        check('maxCoverage', 'Maximum coverage must be a non-negative number').optional().isFloat({ min: 0 })
    ], createVehicleCategory)
    .get(getAllVehicleCategories);

router.route('/:id')
    .get(getVehicleCategory)
    .put([
        check('vehicleType', 'Vehicle type is required').optional().not().isEmpty(),
        check('extraCharges', 'Extra charges must be a non-negative number').optional().isFloat({ min: 0 }),
        check('startingCoverage', 'Starting coverage must be a non-negative number').optional().isFloat({ min: 0 }),
        check('maxCoverage', 'Maximum coverage must be a non-negative number').optional().isFloat({ min: 0 })
    ], updateVehicleCategory)
    .delete(deleteVehicleCategory);

module.exports = router; 