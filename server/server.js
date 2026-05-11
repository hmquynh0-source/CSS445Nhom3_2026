require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db.config');

// --- 1. IMPORT MODELS ---
const Product = require('./models/Product');
const Order = require('./models/Order'); 
const Customer = require('./models/Customer');
const User = require('./models/User'); 
const Transaction = require('./models/Transaction'); // Đã thêm để fix lỗi thiếu model

// --- 2. IMPORT ROUTES ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes'); // Route xử lý đơn hàng (Mới)
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);

// --- 3. CẤU HÌNH SOCKET.IO ---
const io = new Server(server, {
    cors: { 
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

// --- 4. MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 5. API ROUTES ---

// Sử dụng các route đã tách biệt
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // API kết nối cho trang Lịch sử đơn hàng
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);

// API QUẢN LÝ KHÁCH HÀNG (Inline Route)
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi lấy data khách hàng" });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const newCustomer = new Customer(req.body);
        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (err) {
        res.status(400).json({ success: false, message: "Không thể lưu khách hàng" });
    }
});

// API CẬP NHẬT THÔNG TIN USER
app.put('/api/auth/update-profile', async (req, res) => {
    try {
        const { email, name, phone, position } = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { email: email }, 
            { name, phone, position },
            { new: true }
        );
        if (updatedUser) {
            res.json({ success: true, data: updatedUser });
        } else {
            res.status(404).json({ success: false, message: "Không tìm thấy User" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API BÁO CÁO DỰ LIỆU (Dùng cho Dashboard)
app.get('/api/reports/dynamic', async (req, res) => {
    const { range } = req.query; 
    let startDate = new Date();

    if (range === 'day') startDate.setHours(0, 0, 0, 0);
    else if (range === 'month') startDate.setDate(1);
    else if (range === 'year') startDate.setMonth(0, 1);

    try {
        const revenueData = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const totalStock = await Product.aggregate([
            { $group: { _id: null, total: { $sum: "$stock" } } }
        ]);

        const chartValues = range === 'day' ? [10, 30, 25, 45, 60, 20] : [40, 55, 70, 65, 90, 150, 110, 130];

        res.json({
            success: true,
            kpis: {
                revenue: (revenueData[0]?.total || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
                inventory: `${((totalStock[0]?.total || 0) / 1000).toFixed(1)}K kg`,
                opCost: range === 'day' ? "1.2Mđ" : "320Mđ",
                compRate: "98.4%"
            },
            chartData: chartValues
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API QUẢN LÝ YÊU CẦU NHẬP HÀNG (SUPPLIER)
app.get('/api/supplier-requests', async (req, res) => {
    try {
        const requests = await Transaction.find({ type: 'IMPORT' }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.patch('/api/supplier-requests/:id/approve', async (req, res) => {
    try {
        const updated = await Transaction.findByIdAndUpdate(
            req.params.id,
            { status: 'APPROVED' },
            { new: true }
        );
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 6. SOCKET.IO REAL-TIME ---
io.on('connection', (socket) => {
    console.log('✅ Thiết bị kết nối Socket:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('🔌 Thiết bị đã ngắt kết nối');
    });
});

// Cập nhật tồn kho real-time gửi lên Frontend mỗi 10 giây
setInterval(async () => {
    try {
        const totalStock = await Product.aggregate([{ $group: { _id: null, total: { $sum: "$stock" } } }]);
        const stockVal = totalStock[0] ? `${(totalStock[0].total / 1000).toFixed(1)}K` : "0K";
        io.emit('report_update', { inventory: stockVal });
    } catch (err) {
        console.log("Socket update error:", err.message);
    }
}, 10000);

// --- 7. KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`=========================================`);
            console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
            console.log(`✅ MongoDB đã kết nối thành công!`);
            console.log(`✅ Socket.IO đã sẵn sàng!`);
            console.log(`=========================================`);
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động server:', error);
        process.exit(1);
    }
};

startServer();