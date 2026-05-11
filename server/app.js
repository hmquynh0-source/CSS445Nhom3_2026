require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db.config');

// --- 1. IMPORT MODELS ---
const Product = require('./models/Product');
const Order = require('./models/Order'); 
const Customer = require('./models/Customer'); // Đảm bảo bạn đã tạo file này trong thư mục models

// --- 2. IMPORT ROUTES ---
const productRoutes = require('./routes/productRoutes');
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

// --- 5. API ROUTES (GẮN TRƯỚC KHI KHỞI CHẠY SERVER) ---

// Các Route từ file riêng
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);

// --- API QUẢN LÝ KHÁCH HÀNG (CUSTOMERS) ---
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách khách hàng", error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const newCustomer = new Customer(req.body);
        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (err) {
        res.status(400).json({ success: false, message: "Lỗi lưu khách hàng", error: err.message });
    }
});

// --- API BÁO CÁO DỰA TRÊN SỐ LIỆU THẬT (DYNAMIC) ---
app.get('/api/reports/dynamic', async (req, res) => {
    const { range } = req.query; 
    let startDate = new Date();

    if (range === 'day') startDate.setHours(0, 0, 0, 0);
    else if (range === 'month') startDate.setDate(1);
    else if (range === 'year') startDate.setMonth(0, 1);

    try {
        const revenueResult = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const stockResult = await Product.aggregate([
            { $group: { _id: null, total: { $sum: "$stock" } } }
        ]);

        const chartData = range === 'day' ? [15, 40, 25, 90] : [45, 60, 85, 70, 100, 155, 120, 140];

        res.json({
            success: true,
            kpis: {
                revenue: (revenueResult[0]?.total || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                inventory: `${((stockResult[0]?.total || 0) / 1000).toFixed(1)}K`,
                opCost: range === 'day' ? "$1.2K" : "$320K",
                compRate: "98.4%"
            },
            chartData
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- API CHẾ BIẾN ---
let processingHistory = []; 

app.get('/api/processing/history', (req, res) => {
    res.json({ success: true, data: processingHistory });
});

app.post('/api/processing/execute', async (req, res) => {
    try {
        const { weight, sourceId } = req.body;
        const product = await Product.findById(sourceId);
        
        if (product && product.stock >= weight) {
            product.stock -= weight;
            await product.save();
            
            const newBatch = {
                batchId: `BATCH-${Date.now().toString().slice(-5)}`,
                status: 'ĐANG XỬ LÝ',
                weightInfo: `${weight}kg → ...`,
                progress: '10%',
                isProcessing: true
            };
            processingHistory.unshift(newBatch);

            io.emit('new_batch_added', newBatch);
            io.emit('report_update', { inventory: 'Updating...' }); 

            res.json({ success: true, message: "Bắt đầu thực thi mẻ rang" });
        } else {
            res.status(400).json({ success: false, message: "Không đủ hàng trong kho" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 6. SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log(`📡 Thiết bị kết nối: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`🔌 Thiết bị ngắt kết nối: ${socket.id}`);
    });
});

// Gửi dữ liệu cảm biến Real-time
setInterval(() => {
    io.emit('machine_telemetry', {
        temp: (195 + Math.random() * 10).toFixed(1),
        pressure: (2.1 + Math.random() * 0.5).toFixed(1),
        idealTime: "14:05s"
    });
}, 2000);

// --- 7. KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`=========================================`);
            console.log(`✅ RoastLogic Server is LIVE on Port ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`=========================================`);
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động:', error);
        process.exit(1);
    }
};

startServer();