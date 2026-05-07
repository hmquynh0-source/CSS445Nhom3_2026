// server/seed.js - Database management script
// Use this to clear all data if needed

const mongoose = require('mongoose');
const connectDB = require('./config/db.config');
const Product = require('./models/Product');
const Transaction = require('./models/Transaction');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const User = require('./models/User');

const clearData = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // Clear all existing data
        await Transaction.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await Supplier.deleteMany();
        await User.deleteMany();

        console.log('All data cleared successfully - Database is now empty');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

// Uncomment the line below if you want to clear all data
// clearData();

const seedData = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // Create sample users with different roles
        const users = [
            {
                name: 'Admin User',
                email: 'admin@estate.supply',
                password: 'password123',
                role: 'admin'
            },
            {
                name: 'Supplier User',
                email: 'supplier@estate.supply',
                password: 'password123',
                role: 'supplier'
            },
            {
                name: 'Customer User',
                email: 'customer@estate.supply',
                password: 'password123',
                role: 'customer'
            }
        ];

        for (const userData of users) {
            const userExists = await User.findOne({ email: userData.email });
            if (!userExists) {
                await User.create(userData);
                console.log(`Created user: ${userData.email} with role: ${userData.role}`);
            } else {
                console.log(`User ${userData.email} already exists`);
            }
        }

        console.log('Database seeded with sample users');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();