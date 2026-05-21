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
const customerRoutes = require('./routes/customerRoutes');
const outboundRoutes = require('./routes/outboundRoutes');
const locationRoutes = require('./routes/locationRoutes');
const supplierStockRoutes = require('./routes/supplierStockRoutes');
const processingRoutes = require('./routes/processingRoutes');
const staffRoutes = require('./routes/staffRoutes');

const app = express();

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 3. API ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/auth', authRoutes);

// Đồng bộ định tuyến: Cả phân hệ giao dịch gốc và phân hệ /inbound của Admin đều chung một file xử lý
app.use('/api/transactions', transactionRoutes);
app.use('/api/inbound', transactionRoutes); 

app.use('/api/supplier-stocks', supplierStockRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/processing', processingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/outbounds', outboundRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/locations', locationRoutes);
// --- 4. CẤU HÌNH BẮT LỖI LẠC ĐƯỜNG DỰ PHÒNG ---
// app.use((req, res, next) => {
//     console.log(`⚠️ Tuyến API chưa khai báo: ${req.method} ${req.originalUrl}`);
//     res.status(404).json({
//         success: false,
//         message: `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`
//     });
// });

module.exports = app;
