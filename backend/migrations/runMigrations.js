const {
    sequelize
} = require('../config/database');
const models = require('../models');

async function runMigrations() {
    try {
        console.log('🔄 Running database migrations...');

        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Sync all models
        await sequelize.sync({
            force: false,
            alter: true
        });
        console.log('✅ Database models synchronized');

        console.log('🎉 Migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();