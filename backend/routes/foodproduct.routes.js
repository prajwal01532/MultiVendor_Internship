const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/foodproduct.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(auth);

// Category routes
router.post('/categories',
    upload.single('image'),
    [
        check('name.en', 'English name is required').not().isEmpty(),
        check('priority').optional().isInt({ min: 0 })
    ],
    productController.createCategory
);

router.get('/categories', productController.listCategories);

router.put('/categories/:id',
    upload.single('image'),
    [
        check('name.en', 'English name is required').optional().not().isEmpty(),
        check('priority').optional().isInt({ min: 0 }),
        check('status').optional().isIn(['active', 'inactive'])
    ],
    productController.updateCategory
);

router.delete('/categories/:id', productController.deleteCategory);

// SubCategory routes
router.post('/subcategories', [
    check('name.en', 'Name is required').not().isEmpty(),
    check('category', 'Category ID is required').not().isEmpty(),
    check('priority').optional().isInt({ min: 0 }),
    check('status').optional().isIn(['active', 'inactive'])
], productController.createSubCategory);

router.get('/subcategories', productController.listSubCategories);

router.put('/subcategories/:id', [
    check('name.en', 'Name is required').optional().not().isEmpty(),
    check('category', 'Category ID is required').optional().not().isEmpty(),
    check('priority').optional().isInt({ min: 0 }),
    check('status').optional().isIn(['active', 'inactive'])
], productController.updateSubCategory);

router.delete('/subcategories/:id', productController.deleteSubCategory);

// Product routes
router.post('/',
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    [
        check('name.en', 'Name is required').not().isEmpty(),
        check('store', 'Store ID is required').not().isEmpty(),
        check('category', 'Category ID is required').not().isEmpty(),
        check('price', 'Price must be a positive number').isFloat({ min: 0 }),
        check('stock', 'Stock must be a non-negative integer').isInt({ min: 0 })
    ],
    productController.createProduct
);

router.get('/', productController.listProducts);

// Import/Export routes
router.post('/import',
    upload.single('file'),
    productController.importProducts
);

router.get('/export', productController.exportProducts);

// Units route
router.get('/units', productController.getUnits);

// This should be the last route
router.get('/:id', productController.getProduct);

router.put('/:id',
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    [
        check('name.en', 'Name is required').optional().not().isEmpty(),
        check('store', 'Store ID is required').optional().not().isEmpty(),
        check('category', 'Category ID is required').optional().not().isEmpty(),
        check('price', 'Price must be a positive number').optional().isFloat({ min: 0 }),
        check('stock', 'Stock must be a non-negative integer').optional().isInt({ min: 0 })
    ],
    productController.updateProduct
);

router.delete('/:id', productController.deleteProduct);

module.exports = router;
