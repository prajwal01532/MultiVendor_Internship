const VehicleCategory = require('../models/vehicleCategory');
const { validationResult } = require('express-validator');

// Create new vehicle category
exports.createVehicleCategory = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: errors.array()
            });
        }

        const { vehicleType, extraCharges, startingCoverage, maxCoverage } = req.body;

        // Check if vehicle type already exists
        const existingCategory = await VehicleCategory.findOne({ vehicleType });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle type already exists'
            });
        }

        const newVehicleCategory = await VehicleCategory.create({
            vehicleType,
            extraCharges,
            startingCoverage,
            maxCoverage
        });

        res.status(201).json({
            success: true,
            data: newVehicleCategory,
            message: 'Vehicle category created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all vehicle categories
exports.getAllVehicleCategories = async (req, res) => {
    try {
        const vehicleCategories = await VehicleCategory.find();
        
        res.status(200).json({
            success: true,
            count: vehicleCategories.length,
            data: vehicleCategories
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get single vehicle category
exports.getVehicleCategory = async (req, res) => {
    try {
        const vehicleCategory = await VehicleCategory.findById(req.params.id);
        
        if (!vehicleCategory) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: vehicleCategory
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update vehicle category
exports.updateVehicleCategory = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: errors.array()
            });
        }

        // Check if vehicle type exists and is not the same category
        if (req.body.vehicleType) {
            const existingCategory = await VehicleCategory.findOne({
                vehicleType: req.body.vehicleType,
                _id: { $ne: req.params.id }
            });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Vehicle type already exists'
                });
            }
        }

        const vehicleCategory = await VehicleCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!vehicleCategory) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: vehicleCategory,
            message: 'Vehicle category updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete vehicle category
exports.deleteVehicleCategory = async (req, res) => {
    try {
        const vehicleCategory = await VehicleCategory.findByIdAndDelete(req.params.id);

        if (!vehicleCategory) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle category deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}; 