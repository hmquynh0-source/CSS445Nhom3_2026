const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db.config');
const app = require('./app'); // Import app từ file app.js

// --- 1. IMPORT MODELS (Dành cho Inline Routes & Socket) ---
const Product = require('./models/Product');
const Order = require('./models/Order'); 
const Customer = require('./models/Customer');
const User = require('./models/User'); 
const Transaction = require('./models/Transaction');

const server = http.createServer(app);

// --- 2. CẤU HÌNH SOCKET.IO ---
const io = new Server(server, {
    cors: { 
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

// --- 3. INLINE ROUTES (Những route chưa tách file) ---

// API Khách hàng
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi lấy data khách hàng" });
    }
});

// API Báo cáo Dashboard
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
        const totalStock = await Product.aggregate([{ $group: { _id: null, total: { $sum: "$stock" } } }]);
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

// --- 4. SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log('✅ Thiết bị kết nối Socket:', socket.id);
    socket.on('disconnect', () => { console.log('🔌 Thiết bị đã ngắt kết nối'); });
});

setInterval(async () => {
    try {
        const totalStock = await Product.aggregate([{ $group: { _id: null, total: { $sum: "$stock" } } }]);
        const stockVal = totalStock[0] ? `${(totalStock[0].total / 1000).toFixed(1)}K` : "0K";
        io.emit('report_update', { inventory: stockVal });
    } catch (err) { console.log("Socket update error:", err.message); }
}, 10000);

// --- 5. KHỞI CHẠY ---
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
            console.log(`✅ MongoDB đã kết nối thành công!`);
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động server:', error);
        process.exit(1);
    }
};
startServer();