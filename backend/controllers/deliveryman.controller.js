const DeliveryMan = require('../models/deliveryman.model');
const VehicleCategory = require('../models/vehicleCategory');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const cloudinary = require("../utils/cloudinaryConfig.js");

/**
 * Create a new Delivery Man
 */
exports.createDeliveryMan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      deliverymanType,
      zone,
      vehicle,
      identityType,
      identityNumber
    } = req.body;

    // Validate vehicle type
    const validVehicle = await VehicleCategory.findOne({ vehicleType: vehicle });
    if (!validVehicle) {
      return res.status(400).json({ 
        success: false,
        message: 'Please select a valid vehicle type' 
      });
    }

    // Check if delivery man already exists
    let deliveryMan = await DeliveryMan.findOne({ 
      $or: [
        { email },
        { phone },
        { identityNumber }
      ]
    });
    
    if (deliveryMan) {
      return res.status(400).json({ 
        message: 'A delivery man with this email, phone, or identity number already exists' 
      });
    }

    // Log the received files for debugging
    console.log('Files received:', req.files);

    // Check for required files with detailed error message
    if (!req.files) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }
    if (!req.files.profileImage) {
      return res.status(400).json({ message: 'Profile image is required' });
    }
    if (!req.files.identityImages) {
      return res.status(400).json({ message: 'Identity images are required' });
    }

    // Ensure files array is not empty
    if (!req.files.profileImage[0]) {
      return res.status(400).json({ message: 'Profile image file is missing' });
    }
    if (req.files.identityImages.length === 0) {
      return res.status(400).json({ message: 'At least one identity image is required' });
    }

    // Upload profile image to Cloudinary
    const profileImageResult = await cloudinary.uploader.upload(
      req.files.profileImage[0].path,
      { folder: 'delivery-men/profile-images' }
    );

    // Upload identity images to Cloudinary
    const identityImagePromises = req.files.identityImages.map(file => 
      cloudinary.uploader.upload(file.path, { folder: 'delivery-men/identity-images' })
    );
    const identityImageResults = await Promise.all(identityImagePromises);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new delivery man
    deliveryMan = new DeliveryMan({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      deliverymanType,
      zone: zone || 'Unassigned',
      vehicle,
      identityType,
      identityNumber,
      profileImage: profileImageResult.secure_url,
      identityImages: identityImageResults.map(result => result.secure_url),
      status: 'active',
      isAvailable: true
    });

    await deliveryMan.save();

    res.status(201).json({
      success: true,
      message: 'Delivery man created successfully',
      data: {
        id: deliveryMan._id,
        firstName: deliveryMan.firstName,
        lastName: deliveryMan.lastName,
        email: deliveryMan.email,
        phone: deliveryMan.phone,
        deliverymanType: deliveryMan.deliverymanType,
        zone: deliveryMan.zone,
        vehicle: deliveryMan.vehicle,
        profileImage: deliveryMan.profileImage,
        status: deliveryMan.status,
        isAvailable: deliveryMan.isAvailable
      }
    });
  } catch (error) {
    console.error('Error in createDeliveryMan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating delivery man',
      error: error.message 
    });
  }
};

/**
 * Get all delivery men
 */
exports.getAllDeliveryMen = async (req, res) => {
  try {
    const deliveryMen = await DeliveryMan.find().select('-password');
    res.json({ 
      success: true, 
      data: deliveryMen 
    });
  } catch (error) {
    console.error('Error in getAllDeliveryMen:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching delivery men',
      error: error.message 
    });
  }
};

/**
 * Get a single delivery man by ID
 */
exports.getDeliveryMan = async (req, res) => {
  try {
    const deliveryMan = await DeliveryMan.findById(req.params.id).select('-password');
    if (!deliveryMan) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }
    res.json({ success: true, data: deliveryMan });
  } catch (error) {
    console.error('Error in getDeliveryMan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a delivery man
 */
exports.updateDeliveryMan = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.email; // Prevent email updates for security

    // Validate vehicle type if it's being updated
    if (updateData.vehicle) {
      const validVehicle = await VehicleCategory.findOne({ vehicleType: updateData.vehicle });
      if (!validVehicle) {
        return res.status(400).json({ 
          success: false,
          message: 'Please select a valid vehicle type' 
        });
      }
    }

    // Handle file updates if provided
    if (req.files) {
      if (req.files.profileImage) {
        const profileImageResult = await cloudinary.uploader.upload(
          req.files.profileImage[0].path,
          { folder: 'profile-images' }
        );
        updateData.profileImage = profileImageResult.secure_url;
      }

      if (req.files.identityImages) {
        const identityImagePromises = req.files.identityImages.map(file => 
          cloudinary.uploader.upload(file.path, { folder: 'identity-images' })
        );
        const identityImageResults = await Promise.all(identityImagePromises);
        updateData.identityImages = identityImageResults.map(result => result.secure_url);
      }
    }

    const deliveryMan = await DeliveryMan.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!deliveryMan) {
      return res.status(404).json({ 
        success: false,
        message: 'Delivery man not found' 
      });
    }

    res.json({
      success: true,
      message: 'Delivery man updated successfully',
      data: deliveryMan
    });
  } catch (error) {
    console.error('Error in updateDeliveryMan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * Delete a delivery man
 */
exports.deleteDeliveryMan = async (req, res) => {
  try {
    const deliveryMan = await DeliveryMan.findByIdAndDelete(req.params.id);
    if (!deliveryMan) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }

    res.json({ message: 'Delivery man deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDeliveryMan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};