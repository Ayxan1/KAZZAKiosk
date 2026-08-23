require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {
    sequelize
} = require('./config/database');
const {
    ActivityLog,
    Shift
} = require('./models');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/kiosks', require('./routes/kioskRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/activity-logs', require('./routes/activityRoutes'));
app.use('/api/shifts', require('./routes/shiftRoutes'));
app.use('/api/seed', require('./routes/seed')); // Seed endpoint

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack
        })
    });
});

const PORT = process.env.PORT || 3000;

// Database connection and server start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Sync models (use migrations in production)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({
                alter: false
            });
            console.log('✅ Database models synchronized');
        }

        // Always ensure the activity_logs table exists and has the latest
        // columns (targeted single-model alter: only touches this table,
        // never the rest of the schema, so it's safe to run unconditionally).
        await ActivityLog.sync({
            alter: true
        });

        // Same for the new shifts table (təhvil al/ver tracking).
        await Shift.sync({
            alter: true
        });

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;