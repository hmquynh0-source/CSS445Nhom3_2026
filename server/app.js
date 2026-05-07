// 1. Tải Biến Môi trường
require('dotenv').config(); 

// 2. Import Modules
const express = require('express');
const cors = require('cors'); // <--- QUAN TRỌNG: Để kết nối với React
const connectDB = require('./config/db.config'); 

// Import Routes
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const supplierRoutes = require('./routes/supplierRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes');
const aiRoutes = require('./routes/aiRoutes');

// 3. Khởi tạo Ứng dụng Express
const app = express();

// 4. Middleware
// CORS cho phép React (cổng 5173 hoặc 3000) truy cập API
app.use(cors()); 

// Tăng giới hạn dung lượng body để nhận được ảnh Base64 từ Frontend
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 5. Định tuyến (Routes)
app.use('/api/products', productRoutes);    
app.use('/api/transactions', transactionRoutes);  
app.use('/api/auth', authRoutes);           
app.use('/api/suppliers', supplierRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);

// Route kiểm tra trạng thái server
app.get('/', (req, res) => {
    res.send('🚀 RoastLogic Server is running...');
});

// 6. Cấu hình Port và Khởi chạy
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Kết nối cơ sở dữ liệu MongoDB
        await connectDB();  
        
        app.listen(PORT, () => {
            console.log(`=========================================`);
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`📱 API Endpoints sẵn sàng:`);
            console.log(`   - Auth:       /api/auth`);
            console.log(`   - Sản phẩm:   /api/products`);
            console.log(`   - Nhà CC:     /api/suppliers`);
            console.log(`   - Chủng loại: /api/categories`);
            console.log(`   - AI:         /api/ai`);
            console.log(`=========================================`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();