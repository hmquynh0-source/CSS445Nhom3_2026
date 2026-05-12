const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db.config');
const app = require('./app'); // Import app từ file app.js

// --- 1. IMPORT MODELS ---
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

// --- 3. INLINE ROUTES ---

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

// --- API TRỢ LÝ AI (Đã sửa Logic Doanh thu & Query) ---
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const lowerMessage = message.toLowerCase();
        let reply = "Hạt Cà Phê đang phân tích dữ liệu kho thực tế cho bạn...";
        let data = [];

        // 1. XỬ LÝ TỒN KHO THẤP
        if (lowerMessage.includes('tồn') || lowerMessage.includes('hết hàng') || lowerMessage.includes('sắp hết')) {
            // Lấy sản phẩm có stock < 50
            const lowStockProducts = await Product.find({ stock: { $lt: 50 } }).limit(5); 
            
            if (lowStockProducts.length > 0) {
                reply = `⚠️ Cảnh báo: Hiện có ${lowStockProducts.length} mặt hàng sắp hết hàng (dưới 50kg). Bạn xem danh sách nhé:`;
                data = lowStockProducts.map(p => ({
                    name: p.name,
                    stockQuantity: p.stock,
                    unit: p.unit || 'kg',
                    sku: p.sku || 'N/A'
                }));
            } else {
                reply = "✅ Tuyệt vời! Hiện tại không có mặt hàng nào dưới mức báo động (50kg).";
            }
        } 
        
        // 2. XỬ LÝ NHÀ CUNG CẤP (Tìm theo role 'Supplier' không phân biệt hoa thường)
        else if (lowerMessage.includes('nhà cung cấp') || lowerMessage.includes('tìm đối tác')) {
            const suppliers = await Customer.find({ 
                role: { $regex: /supplier/i } 
            }).limit(5);

            if (suppliers.length > 0) {
                reply = "Đây là danh sách các nhà cung cấp (Suppliers) mình tìm thấy trong hệ thống:";
                data = suppliers.map(s => ({
                    name: s.name,
                    stockQuantity: s.phone || 'Chưa có SĐT',
                    unit: '(Liên hệ)',
                    sku: s.email || 'N/A'
                }));
            } else {
                reply = "Bé chưa thấy nhà cung cấp nào có thuộc tính 'Supplier' trong danh sách Khách hàng cả.";
            }
        }

        // 3. XỬ LÝ DOANH THU (Lấy chuẩn ngày hôm nay)
        else if (lowerMessage.includes('doanh thu') || lowerMessage.includes('tiền')) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const revenueData = await Order.aggregate([
                { 
                    $match: { 
                        status: 'COMPLETED', 
                        createdAt: { $gte: today } 
                    } 
                },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ]);

            const total = revenueData[0]?.total || 0;
            if (total > 0) {
                reply = `Báo cáo doanh thu: Tổng tiền thu về từ các đơn hoàn thành hôm nay là **${total.toLocaleString('vi-VN')} VNĐ**.`;
            } else {
                reply = "Hôm nay chưa ghi nhận doanh thu từ đơn hàng hoàn thành (COMPLETED). Bạn cố gắng nhé!";
            }
        }

        res.json({ success: true, reply, data });
    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ success: false, message: "Lỗi xử lý AI" });
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