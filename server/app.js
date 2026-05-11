require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- 1. IMPORT ROUTES ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 3. API ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);

// Export app để server.js sử dụng
module.exports = app;