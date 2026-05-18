const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const connectDB = require('./config/db.config');
const app = require('./app'); // Giữ lại cấu hình Express gốc

// --- 1. IMPORT CÁC MÔ HÌNH DỮ LIỆU (MODELS) ---
const Product = require('./models/Product');
const Order = require('./models/Order');
const InboundProduct = require('./models/InboundProduct');
const Transaction = require('./models/Transaction');

// --- IMPORT CONTROLLER THỐNG KÊ ĐÃ ĐỔI TÊN ---
const supplierPageCtrl = require('./controllers/supplierpageController');
const { protect } = require('./middleware/authMiddleware'); // Middleware bảo mật token

const server = http.createServer(app);

// --- 2. CẤU HÌNH REAL-TIME SOCKET.IO ---
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "PATCH"]
    }
});

// Gắn cấu hình io vào context để sử dụng ở các nơi khác nếu cần
app.set('socketio', io);

// --- 3. ĐỊNH TUYẾN TẬP TRUNG (ROUTING) ---

/**
 * @🚨 API FIX 404: LẤY SỐ LIỆU ĐỒNG BỘ CHO SUPPLIER DASHBOARD
 * Endpoint: GET /api/transactions/supplier/dashboard-stats
 * (Đưa lên đầu danh mục định tuyến để tránh xung đột params)
 */
app.get('/api/transactions/supplier/dashboard-stats', protect, supplierPageCtrl.getSupplierStats);

/**
 * @API_1: LẤY DANH SÁCH LỊCH SỬ NHẬP KHO THỰC TẾ (Cho bảng Intake Ledger)
 * Endpoint: GET /api/inbound/products
 */
app.get('/api/inbound/products', async (req, res) => {
    try {
        const history = await InboundProduct.find().sort({ createdAt: -1 });
        res.json({ success: true, data: history }); 
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy data nhập kho: " + error.message });
    }
});

/**
 * @API_2: CẬP NHẬT THÔNG SỐ KIỂM ĐỊNH QC (Phục vụ nút Chỉnh sửa QC)
 * Endpoint: PUT /api/inbound/update-qc/:lotId
 */
app.put('/api/inbound/update-qc/:lotId', async (req, res) => {
    try {
        const { moisture, screen, defectRate } = req.body;
        
        const updatedLot = await InboundProduct.findOneAndUpdate(
            { batchCode: req.params.lotId },
            { 
                moisture: Number(moisture), 
                screen: screen, 
                defectRate: Number(defectRate),
                status: "QC PASSED" 
            },
            { new: true } 
        );

        if (!updatedLot) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lô hàng này" });
        }

        io.emit('report_update', { message: 'QC Updated' });
        res.json({ success: true, data: updatedLot });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật QC: " + error.message });
    }
});

/**
 * @API_3: TRUY XUẤT NỒNG GỐC HÀNH TRÌNH LÔ HÀNG (Phục vụ nút Truy xuất)
 * Endpoint: GET /api/inbound/trace/:lotId
 */
app.get('/api/inbound/trace/:lotId', async (req, res) => {
    try {
        const lot = await InboundProduct.findOne({ batchCode: req.params.lotId });
        
        if (!lot) {
            return res.status(404).json({ success: false, message: "Mã lô không tồn tại" });
        }
        
        res.json({ 
            success: true, 
            traceData: {
                batchCode: lot.batchCode,
                productName: lot.productName,
                weight: lot.weight,
                supplierName: lot.supplier || "Nhà Cung Cấp Đối Tác",
                importDate: lot.importDate || lot.createdAt,
                qcStatus: lot.status || "QC PASSED"
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống truy xuất: " + error.message });
    }
});

/**
 * @API_4: DUYỆT ĐƠN NHẬP KHO (Thủ kho kiểm duyệt đồng bộ -> Trừ kho NCC)
 * Endpoint: PUT /api/inbound/approve/:id
 */
app.put('/api/inbound/approve/:id', async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Transaction.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy lệnh yêu cầu nhập kho." });
        
        if (order.status === 'PENDING') {
            return res.status(403).json({ 
                success: false, 
                message: "Quyền hạn bị từ chối! Đơn hàng này đang ở trạng thái chờ Nhà cung cấp phê duyệt trước." 
            });
        }

        if (order.status === 'COMPLETED') return res.status(400).json({ success: false, message: "Đơn hàng đã được hoàn thành nhập kho từ trước." });

        // Cập nhật tình trạng lệnh
        order.status = 'COMPLETED';
        await order.save();

        // Khởi tạo lô hàng thực tế kiểm định chất lượng (QC)
        const newInboundEntry = new InboundProduct({
            batchCode: `LOT-${Date.now().toString().slice(-6)}`,
            productName: order.productName || "Cà phê nhân xanh",
            weight: order.quantity,
            price: order.price || 65000, 
            supplier: order.supplierName || "Đối tác hệ thống",
            status: "QC PASSED",
            moisture: 12.0, 
            screen: "Sàng 18",
            defectRate: 0,
            importDate: new Date()
        });
        await newInboundEntry.save();

        // 1. Cộng dồn số lượng vào kho tổng RoastLogic
        const product = await Product.findOne({ name: order.productName });
        if (product) {
            product.stock += order.quantity;
            // 2. Đồng thời trừ lượng 'availableWeight' (Khối lượng sẵn có) của Nhà cung cấp vì hàng đã giao xong
            if (product.availableWeight !== undefined) {
                product.availableWeight = Math.max(0, product.availableWeight - order.quantity);
            }
            await product.save();
        }

        // Bắn tín hiệu socket báo Front-end update dữ liệu ngay lập tức
        io.emit('update_order_status', order);
        io.emit('report_update', { message: 'New stock added and synchronized' });

        res.json({ success: true, message: "Đã xác nhận nhập kho và tạo số lô thành công!", data: newInboundEntry });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi phê duyệt nhập kho: " + err.message });
    }
});

/**
 * @API_5: BÁO CÁO DASHBOARD DYNAMIC
 * Endpoint: GET /api/reports/dynamic
 */
app.get('/api/reports/dynamic', async (req, res) => {
    const { range } = req.query;
    let startDate = new Date();
    if (range === 'day') startDate.setHours(0, 0, 0, 0);
    else if (range === 'month') { startDate.setDate(1); startDate.setHours(0,0,0,0); }

    try {
        const revenueData = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const totalStock = await Product.aggregate([{ $group: { _id: null, total: { $sum: "$stock" } } }]);
        const inboundCount = await InboundProduct.countDocuments({ createdAt: { $gte: startDate } });

        res.json({
            success: true,
            kpis: {
                revenue: (revenueData[0]?.total || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
                inventory: `${(totalStock[0]?.total || 0).toLocaleString()} kg`,
                inboundBatches: `${inboundCount} Lô mới`,
                compRate: "98.4%"
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @API_6: TRỢ LÝ AI (Coffee AI Assistant)
 * Endpoint: POST /api/ai/chat
 */
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: "Nội dung trống" });
        
        const lowerMessage = message.toLowerCase();
        let reply = "Hạt Cà Phê đang kiểm tra dữ liệu...";
        let data = [];

        // 1. TRUY XUẤT THÔNG TIN ĐỘ ẨM LÔ HÀNG
        if (lowerMessage.includes('độ ẩm') || lowerMessage.includes('qc') || lowerMessage.includes('kiểm định')) {
            const allLots = await InboundProduct.find().sort({ createdAt: -1 }).limit(5);
            
            if (allLots.length > 0) {
                const highMoisture = allLots.filter(lot => (lot.moisture || 0) > 12.5);
                
                if (highMoisture.length > 0) {
                    reply = `⚠️ Cảnh báo: Phát hiện có ${highMoisture.length} lô độ ẩm cao vượt chuẩn (>12.5%):`;
                    data = highMoisture.map(i => ({ name: i.batchCode, stockQuantity: i.moisture, unit: '%', sku: i.productName }));
                } else {
                    reply = `✅ Độ ẩm các lô hàng nhập kho gần đây đều đạt chuẩn an toàn lưu kho (<12.5%). Lô mới nhất (${allLots[0].batchCode}) đạt mức: ${allLots[0].moisture}%.`;
                    data = allLots.map(i => ({ name: i.batchCode, stockQuantity: i.moisture, unit: '%', sku: i.productName }));
                }
            } else {
                reply = "📋 Hiện tại hệ thống dữ liệu lô hàng nhập kho đang trống.";
            }

        // 2. TRUY XUẤT THÔNG TIN TỒN KHO TỔNG
        } else if (lowerMessage.includes('tồn') || lowerMessage.includes('kho') || lowerMessage.includes('số lượng')) {
            const allProducts = await Product.find().limit(5);
            
            if (allProducts.length > 0) {
                const lowStock = allProducts.filter(p => (p.stock || 0) < 50);
                
                if (lowStock.length > 0) {
                    reply = `⚠️ Cảnh báo: Hệ thống có ${lowStock.length} mặt hàng sắp hết hàng trong kho (<50kg). Bạn cần chuẩn bị kế hoạch nhập hàng thêm:`;
                    data = lowStock.map(p => ({ name: p.name, stockQuantity: p.stock, unit: 'kg', sku: p.sku || 'N/A' }));
                } else {
                    reply = `✅ Kho hàng hiện tại rất an toàn. Mặt hàng có khối lượng lưu trữ lớn nhất hiện nay là: ${allProducts[0].name} (${allProducts[0].stock} kg).`;
                    data = allProducts.map(p => ({ name: p.name, stockQuantity: p.stock, unit: 'kg', sku: p.sku || 'N/A' }));
                }
            } else {
                reply = "📦 Hiện tại hệ thống danh mục tồn kho chưa ghi nhận sản phẩm nào.";
            }
            
        // 3. PHẢN HỒI KHI KHÔNG KHỚP TỪ KHÓA TRUY XUẤT
        } else {
            reply = "🤖 Xin chào! Mình là Trợ lý Hệ thống Kho Cà Phê. Bạn có thể tra cứu thông tin nhanh bằng cách hỏi:\n- 'Kiểm tra độ ẩm các lô hàng'\n- 'Báo cáo tình hình hàng tồn kho thực tế'";
        }

        res.json({ success: true, reply, data });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi luồng xử lý dữ liệu AI" });
    }
});

// --- 4. CẤU HÌNH LẮNG NGHE ĐỒNG BỘ REAL-TIME VIA SOCKET ---
io.on('connection', (socket) => {
    console.log('✅ Thiết bị kết nối Socket:', socket.id);
    socket.on('disconnect', () => console.log('❌ Thiết bị ngắt kết nối'));
});

// Gửi cập nhật tồn kho định kỳ cho Dashboard (mỗi 10 giây)
setInterval(async () => {
    try {
        const totalStock = await Product.aggregate([{ $group: { _id: null, total: { $sum: "$stock" } } }]);
        const totalInbound = await InboundProduct.countDocuments();
        const stockVal = totalStock[0] ? `${totalStock[0].total.toLocaleString()} kg` : "0 kg";
        
        io.emit('report_update', { 
            inventory: stockVal,
            inboundBatches: `${totalInbound} Lô`
        });
    } catch (err) { /* Silent */ }
}, 10000);

// --- 5. KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await connectDB(); 
        server.listen(PORT, () => {
            console.log(`
===========================================================
 🚀 SERVER COFFEE SYSTEM ĐANG CHẠY TẠI: http://localhost:${PORT}
 💾 DATABASE (MONGODB): KẾT NỐI THÀNH CÔNG
 📡 SOCKET.IO REALTIME: SẴN SÀNG HOẠT ĐỘNG
===========================================================
            `);
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động hệ thống:', error);
        process.exit(1);
    }
};

startServer();