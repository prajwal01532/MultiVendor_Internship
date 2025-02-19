const Product = require('../models/groceryproduct.model');
const Store = require('../models/grocerystore.model');
const Category = require('../models/grocerycategory.model');
const SubCategory = require('../models/grocerysubcategory.model');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cloudinary = require("../utils/cloudinaryConfig.js");

// Category Management
exports.createCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { name, priority } = req.body;

        // Convert name to Map before saving
        if (typeof name === "object" && name !== null) {
            name = new Map(Object.entries(name));
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid name format. Expected an object with language keys."
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ "name.en": name.get("en") });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "This category already exists.",
            });
        }

        // Ensure an image file is provided
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is required.",
            });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "categories", // Cloudinary folder name
            use_filename: true,
            unique_filename: false,
        });

        if (!result.secure_url) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload image.",
            });
        }

        // Delete the temporary uploaded file
        fs.unlinkSync(req.file.path);

        // Create category with Cloudinary image URL
        const category = new Category({
            name,
            image: result.secure_url, // Store Cloudinary URL
            priority,
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        console.error("Create category error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.listCategories = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;

        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { 'name.en': { $regex: search, $options: 'i' } },
                { 'name.ar': { $regex: search, $options: 'i' } }
            ];
        }

        const categories = await Category.paginate(query, {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { priority: -1, 'name.en': 1 }
        });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('List categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// SubCategory Management
exports.createSubCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }

        const { name, category, priority, status } = req.body;

        // Check if subcategory already exists under the same category
        const existingSubCategory = await SubCategory.findOne({
            "name.en": name.en,
            category
        });

        if (existingSubCategory) {
            return res.status(400).json({
                success: false,
                message: "This subcategory already exists in the selected category."
            });
        }

        const subCategory = new SubCategory({
            name,
            category,
            priority: priority || 1,
            status: status || 'active'
        });

        await subCategory.save();

        // Populate category details in the response
        const populatedSubCategory = await SubCategory.findById(subCategory._id)
            .populate('category', 'name');

        res.status(201).json({
            success: true,
            message: "Subcategory created successfully",
            data: populatedSubCategory
        });
    } catch (error) {
        console.error("Create subcategory error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.listSubCategories = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category, status } = req.query;

        const query = {};
        
        // Add category filter if provided
        if (category) {
            query.category = category;
        }
        
        // Add status filter if provided
        if (status) {
            query.status = status;
        }
        
        // Add search filter if provided
        if (search) {
            query.$or = [
                { 'name.en': { $regex: search, $options: 'i' } }
            ];
        }

        console.log('Query:', query); // Debug log

        // Use mongoose-paginate-v2 for pagination
        const subCategories = await SubCategory.paginate(query, {
            page: parseInt(page),
            limit: parseInt(limit),
            populate: {
                path: 'category',
                select: 'name'
            },
            sort: { priority: -1, createdAt: -1 }
        });

        console.log('Found subcategories:', subCategories); // Debug log

        // Send response
        res.json({
            success: true,
            data: {
                docs: subCategories.docs,
                totalDocs: subCategories.totalDocs,
                limit: subCategories.limit,
                totalPages: subCategories.totalPages,
                page: subCategories.page,
                pagingCounter: subCategories.pagingCounter,
                hasPrevPage: subCategories.hasPrevPage,
                hasNextPage: subCategories.hasNextPage,
                prevPage: subCategories.prevPage,
                nextPage: subCategories.nextPage
            },
            message: 'Sub-categories fetched successfully'
        });
    } catch (error) {
        console.error('List subcategories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Product Management
exports.createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        let productData = { ...req.body };

        // Convert name and description to Map format
        if (productData.name && typeof productData.name === "object") {
            productData.name = new Map([['en', productData.name.en]]);
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid name format. Expected an object with language key."
            });
        }

        if (productData.description && typeof productData.description === "object") {
            productData.description = new Map([['en', productData.description.en]]);
        }

        // Check if product already exists in the store
        const existingProduct = await Product.findOne({ 
            "name.en": productData.name.get("en"), 
            store: productData.store 
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: "This product already exists in this store."
            });
        }

        // Ensure images and thumbnail are provided
        if (!req.files?.images || !req.files?.thumbnail) {
            return res.status(400).json({
                success: false,
                message: "Product images and thumbnail are required."
            });
        }

        // Upload images to Cloudinary
        const uploadToCloudinary = async (file) => {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "products",
                use_filename: true,
                unique_filename: false
            });
            return result.secure_url;
        };

        // Upload all images and thumbnail
        const imageUrls = await Promise.all(req.files.images.map(file => uploadToCloudinary(file)));
        const thumbnailUrl = await uploadToCloudinary(req.files.thumbnail[0]);

        // Clean up local uploaded files
        req.files.images.forEach(file => fs.unlinkSync(file.path));
        fs.unlinkSync(req.files.thumbnail[0].path);

        // Assign Cloudinary URLs to product data
        productData.images = imageUrls;
        productData.thumbnail = thumbnailUrl;

        // Save product to database
        const product = new Product(productData);
        await product.save();

        // Update category and subcategory product counts
        await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });
        if (product.subCategory) {
            await SubCategory.findByIdAndUpdate(product.subCategory, { $inc: { productCount: 1 } });
        }

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.listProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            subCategory,
            store,
            status,
            minPrice,
            maxPrice,
            sortField = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};
        
        if (search) {
            query.$or = [
                { 'name.en': { $regex: search, $options: 'i' } },
                { 'description.en': { $regex: search, $options: 'i' } }
            ];
        }

        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;
        if (store) query.store = store;
        if (status) query.status = status;
        
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
            if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
        }

        const products = await Product.paginate(query, {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { [sortField]: sortOrder === 'desc' ? -1 : 1 },
            populate: ['category', 'subCategory', 'store'],
            select: 'name description store category subCategory unit images thumbnail price stock discount status'
        });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('List products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let productData = { ...req.body };

        // Convert name and description to Map format if provided
        if (productData.name && typeof productData.name === "object") {
            productData.name = new Map([['en', productData.name.en]]);
        }

        if (productData.description && typeof productData.description === "object") {
            productData.description = new Map([['en', productData.description.en]]);
        }

        // Handle file uploads if provided
        if (req.files) {
            // Upload images to Cloudinary
            const uploadToCloudinary = async (file) => {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "products",
                    use_filename: true,
                    unique_filename: false
                });
                return result.secure_url;
            };

            // Upload new images if provided
            if (req.files.images) {
                const imageUrls = await Promise.all(req.files.images.map(file => uploadToCloudinary(file)));
                productData.images = imageUrls;
                // Clean up local uploaded files
                req.files.images.forEach(file => fs.unlinkSync(file.path));
            }

            // Upload new thumbnail if provided
            if (req.files.thumbnail) {
                const thumbnailUrl = await uploadToCloudinary(req.files.thumbnail[0]);
                productData.thumbnail = thumbnailUrl;
                // Clean up local uploaded file
                fs.unlinkSync(req.files.thumbnail[0].path);
            }
        }

        // Update the product
        const product = await Product.findByIdAndUpdate(
            id,
            productData,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete the product
        await Product.findByIdAndDelete(id);

        // Update category and subcategory product counts
        await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
        if (product.subCategory) {
            await SubCategory.findByIdAndUpdate(product.subCategory, { $inc: { productCount: -1 } });
        }

        res.json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .populate('unit', 'name symbol')
            .populate('store', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            data: product,
            message: "Product fetched successfully"
        });
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Import/Export Products
exports.importProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a CSV file'
            });
        }

        const results = [];
        const errors = [];

        // Process CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', async (data) => {
                try {
                    // Transform CSV data to product data
                    const productData = {
                        name: {
                            en: data.name_en,
                            ar: data.name_ar
                        },
                        description: {
                            en: data.description_en,
                            ar: data.description_ar
                        },
                        store: data.store_id,
                        category: data.category_id,
                        subCategory: data.subcategory_id,
                        price: parseFloat(data.price),
                        stock: parseInt(data.stock),
                        status: data.status || 'active'
                    };

                    const product = new Product(productData);
                    await product.save();
                    results.push(product);
                } catch (error) {
                    errors.push({
                        row: data,
                        error: error.message
                    });
                }
            })
            .on('end', () => {
                // Delete temporary file
                fs.unlink(req.file.path);

                res.json({
                    success: true,
                    data: {
                        imported: results.length,
                        errors: errors
                    }
                });
            });
    } catch (error) {
        console.error('Import products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.exportProducts = async (req, res) => {
    try {
        const { format = 'csv' } = req.query;

        const products = await Product.find()
            .populate('store', 'name')
            .populate('category', 'name')
            .populate('subCategory', 'name');

        if (format === 'csv') {
            const csvWriter = createCsvWriter({
                path: 'products_export.csv',
                header: [
                    { id: 'name_en', title: 'Name (English)' },
                    { id: 'name_ar', title: 'Name (Arabic)' },
                    { id: 'store', title: 'Store' },
                    { id: 'category', title: 'Category' },
                    { id: 'subCategory', title: 'Sub Category' },
                    { id: 'price', title: 'Price' },
                    { id: 'stock', title: 'Stock' },
                    { id: 'status', title: 'Status' }
                ]
            });

            const records = products.map(product => ({
                name_en: product.name.get('en'),
                name_ar: product.name.get('ar'),
                store: product.store.name,
                category: product.category.name.get('en'),
                subCategory: product.subCategory?.name.get('en') || '',
                price: product.price,
                stock: product.stock,
                status: product.status
            }));

            await csvWriter.writeRecords(records);

            res.download('products_export.csv', () => {
                fs.unlink('products_export.csv');
            });
        } else {
            res.json({
                success: true,
                data: products
            });
        }
    } catch (error) {
        console.error('Export products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        let { name, priority, status } = req.body;

        // Convert name to Map if it's provided
        if (name && typeof name === "object") {
            name = new Map(Object.entries(name));
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (priority !== undefined) updateData.priority = priority;
        if (status) updateData.status = status;

        // Handle image update if provided
        if (req.file) {
            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "categories",
                use_filename: true,
                unique_filename: false,
            });

            if (!result.secure_url) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload image.",
                });
            }

            // Delete the temporary uploaded file
            fs.unlinkSync(req.file.path);
            
            updateData.image = result.secure_url;
        }

        const category = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({
            success: true,
            message: "Category updated successfully",
            data: category
        });
    } catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category has associated products
        const productsCount = await Product.countDocuments({ category: id });
        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with associated products"
            });
        }

        // Check if category has associated sub-categories
        const subCategoriesCount = await SubCategory.countDocuments({ category: id });
        if (subCategoriesCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with associated sub-categories"
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update sub-category
exports.updateSubCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        let { name, category, priority, status } = req.body;

        // Convert name to Map if it's provided
        if (name && typeof name === "object") {
            name = new Map(Object.entries(name));
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (category) updateData.category = category;
        if (priority !== undefined) updateData.priority = priority;
        if (status) updateData.status = status;

        const subCategory = await SubCategory.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub-category not found"
            });
        }

        res.json({
            success: true,
            message: "Sub-category updated successfully",
            data: subCategory
        });
    } catch (error) {
        console.error("Update sub-category error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete sub-category
exports.deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if sub-category has associated products
        const productsCount = await Product.countDocuments({ subCategory: id });
        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete sub-category with associated products"
            });
        }

        const subCategory = await SubCategory.findByIdAndDelete(id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub-category not found"
            });
        }

        res.json({
            success: true,
            message: "Sub-category deleted successfully"
        });
    } catch (error) {
        console.error("Delete sub-category error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get units
exports.getUnits = async (req, res) => {
    try {
        // Return a default list of common units
        const units = [
            { _id: 'piece', name: 'Piece', symbol: 'pc' },
            { _id: 'kg', name: 'Kilogram', symbol: 'kg' },
            { _id: 'g', name: 'Gram', symbol: 'g' },
            { _id: 'l', name: 'Liter', symbol: 'L' },
            { _id: 'ml', name: 'Milliliter', symbol: 'ml' },
            { _id: 'pack', name: 'Pack', symbol: 'pack' },
            { _id: 'box', name: 'Box', symbol: 'box' },
            { _id: 'dozen', name: 'Dozen', symbol: 'dz' }
        ];

        res.json({
            success: true,
            data: units
        });
    } catch (error) {
        console.error('Get units error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
