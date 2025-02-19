require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// auth routes
const authRoutes = require('./routes/auth.routes');

// Food Routes
const fooddashboardRoutes = require('./routes/fooddashboard.routes');
const foodposRoutes = require('./routes/foodpos.routes');
const foodorderRoutes = require('./routes/foodorder.routes');
const foodstoreRoutes = require('./routes/foodstore.routes');
const foodproductRoutes = require('./routes/foodproduct.routes');
const foodpromotionRoutes = require('./routes/foodpromotion.routes');
const foodnotificationRoutes = require('./routes/foodnotification.routes');
const foodbannerAndAdRoutes = require('./routes/foodbannerandad.routes');


// Pharmacy Routes
const pharmacydashboardRoutes = require('./routes/pharmacydashboard.routes');
const pharmacyposRoutes = require('./routes/pharmacypos.routes');
const pharmacyorderRoutes = require('./routes/pharmacyorder.routes');
const pharmacystoreRoutes = require('./routes/pharmacystore.routes');
const pharmacyproductRoutes = require('./routes/pharmacyproduct.routes');
const pharmacypromotionRoutes = require('./routes/pharmacypromotion.routes');
const pharmacynotificationRoutes = require('./routes/pharmacynotification.routes');
const pharmacybannerAndAdRoutes = require('./routes/pharmacybannerandad.routes');


// Grocery Routes
const grocerydashboardRoutes = require('./routes/grocerydashboard.routes');
const groceryposRoutes = require('./routes/grocerypos.routes');
const groceryorderRoutes = require('./routes/groceryorder.routes');
const grocerystoreRoutes = require('./routes/grocerystore.routes');
const groceryproductRoutes = require('./routes/groceryproduct.routes');
const grocerypromotionRoutes = require('./routes/grocerypromotion.routes');
const grocerynotificationRoutes = require('./routes/grocerynotification.routes');
const grocerybannerAndAdRoutes = require('./routes/grocerybannerandad.routes');


// Other Routes
const deliverymanRoutes = require('./routes/deliveryman.routes');
const vehicleCategoryRoutes = require('./routes/vehicleCategoryRoutes');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'x-auth-token'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority',
    retryReads: true,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Add connection event handlers
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Food Routes
app.use('/api/fooddashboard', fooddashboardRoutes);
app.use('/api/foodpos', foodposRoutes);
app.use('/api/foodorders', foodorderRoutes);
app.use('/api/foodstores', foodstoreRoutes);
app.use('/api/foodproducts', foodproductRoutes);
app.use('/api/foodpromotions', foodpromotionRoutes);
app.use('/api/foodnotifications', foodnotificationRoutes);
app.use('/api/foodbannerandad', foodbannerAndAdRoutes);

// Pharmacy Routes
app.use('/api/pharmacydashboard', pharmacydashboardRoutes);
app.use('/api/pharmacypos', pharmacyposRoutes);
app.use('/api/pharmacyorders', pharmacyorderRoutes);
app.use('/api/pharmacystores', pharmacystoreRoutes);
app.use('/api/pharmacyproducts', pharmacyproductRoutes);
app.use('/api/pharmacypromotions', pharmacypromotionRoutes);
app.use('/api/pharmacynotifications', pharmacynotificationRoutes);
app.use('/api/pharmacybannerandad', pharmacybannerAndAdRoutes);

// Grocery Routes
app.use('/api/grocerydashboard', grocerydashboardRoutes);
app.use('/api/grocerypos', groceryposRoutes);
app.use('/api/groceryorders', groceryorderRoutes);
app.use('/api/grocerystores', grocerystoreRoutes);
app.use('/api/groceryproducts', groceryproductRoutes);
app.use('/api/grocerypromotions', grocerypromotionRoutes);
app.use('/api/grocerynotifications', grocerynotificationRoutes);
app.use('/api/grocerybannerandad', grocerybannerAndAdRoutes);

// Other Routes
app.use('/api/deliveryman', deliverymanRoutes);
app.use('/api/vehicle-categories', vehicleCategoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    // Log error details for debugging
    console.error('Error details:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    // Determine status code
    const statusCode = err.statusCode || 500;

    // Send error response
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal server error' : err.message,
        errors: err.errors || undefined,
        code: err.code || undefined,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Perform any cleanup if needed
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Perform any cleanup if needed
    process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
