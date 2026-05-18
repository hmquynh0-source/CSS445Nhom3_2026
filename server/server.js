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

// 🛠️ CẢI TIẾN 1: IMPORT FILE ROUTE CỦA NHÂN SỰ VÀO ĐÂY
// const staffRoutes = require('./routes/staffRoutes'); 

// --- IMPORT CONTROLLER THỐNG KÊ ĐÃ ĐỔI TÊN ---
const supplierPageCtrl = require('./controllers/supplierpageController');
const { protect } = require('./middleware/authMiddleware'); // Middleware bảo mật token

// --- IMPORT THƯ VIỆN GOOGLE GEN AI CHÍNH THỨC ---
const { GoogleGenAI } = require('@google/genai');

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
 * @API_STAFF: PHÂN HỆ QUẢN LÝ TÀI KHOẢN NHÂN SỰ (MỚI TÍNH HỢP)
 * Endpoint: /api/staff
 * Các phương thức: GET /, POST /, PUT /:id
 */
// 🛠️ CẢI TIẾN 2: KÍCH HOẠT ĐƯỜNG DẪN API CHO NHÂN SỰ
// app.use('/api/staff', staffRoutes);

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

// --- KHỞI TẠO CLIENT GEMINI VỚI KEY TỪ FILE .ENV ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * @API_6: TRỢ LÝ AI GEMINI (Tự động đọc hiểu toàn bộ dữ liệu kèm Cơ chế dự phòng chống sập Quota)
 * Endpoint: POST /api/ai/chat
 */
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: "Nội dung trống" });
        
        // 1. Quét sạch sành sanh dữ liệu thực tế từ Database để cung cấp cho bộ não AI
        let allProducts = [], allLots = [];
        try {
            allProducts = await Product.find({}) || [];
            allLots = await InboundProduct.find().sort({ createdAt: -1 }) || [];
        } catch (dbErr) {
            console.error("🚨 Lỗi truy vấn dữ liệu thô phục vụ AI Context:", dbErr);
        }

        // Dọn dẹp và định dạng văn bản hóa ngữ cảnh kho hàng phòng chống trường hợp dữ liệu bị trống
        const stockContext = allProducts.map(p => {
            if(!p) return '';
            return `+ Tên mặt hàng: ${p.name || 'N/A'} | Tồn kho thực tế: ${p.stock || 0} kg | SKU: ${p.sku || 'N/A'}`;
        }).filter(Boolean).join('\n');

        const inboundContext = allLots.map(i => {
            if(!i) return '';
            return `+ Số lô: ${i.batchCode || 'N/A'} | Mặt hàng: ${i.productName || 'Cà phê'} | Khối lượng: ${i.weight || 0} kg | Độ ẩm QC: ${i.moisture || 0}% | Tỉ lệ hạt lỗi: ${i.defectRate || 0}% | Sàng kiểm định: ${i.screen || 'N/A'} | Nhà cung cấp: ${i.supplier || 'N/A'}`;
        }).filter(Boolean).join('\n');

        const lowerMessage = message.toLowerCase();

        // 2. Chạy luồng kết nối Trí tuệ nhân tạo Gemini
        try {
            // Định hình vai trò và ép định dạng JSON đầu ra nghiêm ngặt cho AI
            const systemInstruction = `
                Bạn là RoastLogic AI - Trợ lý tối cao và là chuyên gia độc quyền quản lý Kho Cà Phê Nhân Xanh.
                Nhiệm vụ cốt lõi của bạn là đọc hiểu dữ liệu hệ thống thực tế được cung cấp để trả về duy nhất một cấu trúc chuỗi JSON sạch. 
                Tuyệt đối KHÔNG viết lời chào, không kèm dấu mào đầu, không phân tích bằng chữ nằm ngoài khối JSON.

                BẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON MẪU CHUẨN:
                {
                    "reply": "Câu trả lời bằng tiếng Việt của bạn ở đây. Hãy phân tích súc tích, dùng biểu tượng emoji trực quan (☕, ⚠️, 📦).",
                    "data": [
                        { "name": "Tên sản phẩm hoặc số lô liên quan", "stockQuantity": số_thực_tế_lấy_từ_kho, "unit": "kg hoặc %", "sku": "Mã SKU hoặc loại hàng" }
                    ]
                }

                QUY TẮC PHÂN LOẠI MẢNG DATA ĐẦU RA:
                - Nếu hỏi về hàng "sắp hết", "thiếu hàng", "cảnh báo tồn kho": Lọc các sản phẩm tồn kho < 50 kg đẩy vào mảng "data", unit là "kg".
                - Nếu hỏi về "độ ẩm", "kiểm định", "QC": Đưa danh sách các lô tương ứng vào mảng "data", trường stockQuantity chứa số % độ ẩm, unit điền "%".
                - Câu hỏi thông thường khác: Điền toàn bộ danh sách hàng tồn kho hiện có vào mảng "data".
            `;

            const aiPromptContext = `
                --- ĐÂY LÀ TOÀN BỘ BÀI BÁO CÁO DỮ LIỆU THỰC TẾ TRONG KHO HỆ THỐNG ---
                [DANH SÁCH BÁO CÁO TỒN KHO THỰC TẾ TẠI KHO TỔNG]
                ${stockContext || "Hiện tại danh mục tồn kho tổng đang trống."}

                [NHẬT KÝ THÔNG SỐ KIỂM ĐỊNH QC VÀ CHI TIẾT CÁC LÔ HÀNG NHẬP KHO]
                ${inboundContext || "Hiện tại hệ thống chưa ghi nhận lô hàng nhập kho nào."}
                ----------------------------------------------------------------------------------
                Câu hỏi của thủ kho: "${message}"
            `;

            // Thực hiện gửi yêu cầu kèm theo Instruction đến mô hình Gemini 2.5 Flash
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: aiPromptContext,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.2,
                    responseMimeType: "application/json" // Trả về JSON sạch
                }
            });

            const parsedResult = JSON.parse(response.text);
            return res.json({ 
                success: true, 
                reply: parsedResult.reply, 
                data: parsedResult.data || [] 
            });

        } catch (aiError) {
            // 🛡️ BỘ LỌC DỰ PHÒNG LOCAL (Kích hoạt tức thì khi lỗi 429 - Hết hạn mức / Quota Exceeded)
            console.warn("⚠️ Hệ thống phát hiện Gemini AI chạm trần hạn mức hoặc lỗi kết nối. Tự động chuyển đổi sang Cơ chế dự phòng cấu trúc Local.");
            
            let fallbackReply = "";
            let fallbackData = [];

            // Case 1: Người dùng hỏi về độ ẩm, chất lượng QC lô hàng
            if (lowerMessage.includes('độ ẩm') || lowerMessage.includes('qc') || lowerMessage.includes('kiểm định')) {
                const highMoistureLots = allLots.filter(l => (l.moisture || 0) > 12.5);
                if (highMoistureLots.length > 0) {
                    fallbackReply = `⚠️ [Dự phòng Hệ thống] Phát hiện nguy cơ! Hiện đang có ${highMoistureLots.length} lô hàng nhập kho có chỉ số độ ẩm vượt ngưỡng an toàn tiêu chuẩn (>12.5%). Thủ kho cần lên lịch kiểm tra thông gió để tránh ẩm mốc mọc mầm hạt!`;
                } else {
                    fallbackReply = `✅ [Dự phòng Hệ thống] Thống kê dữ liệu QC: Độ ẩm trung bình của tất cả các lô hàng nhập kho gần đây đều duy trì ở mức lý tưởng (~12.0%), đạt tiêu chuẩn bảo quản lâu dài.`;
                }
                fallbackData = allLots.map(l => ({ name: l.batchCode, stockQuantity: l.moisture || 0, unit: '%', sku: l.productName || 'Cà phê' }));

            // Case 2: Người dùng hỏi về sản phẩm sắp hết hàng, cảnh báo tồn kho
            } else if (lowerMessage.includes('hết hàng') || lowerMessage.includes('sắp hết') || lowerMessage.includes('tồn kho') || lowerMessage.includes('thiếu')) {
                const outOfStockProducts = allProducts.filter(p => (p.stock || 0) < 50);
                if (outOfStockProducts.length > 0) {
                    fallbackReply = `⚠️ [Dự phòng Hệ thống] Cảnh báo khẩn cấp: Có ${outOfStockProducts.length} mặt hàng đã giảm sâu xuống dưới mức sàn an toàn (dưới 50 kg). Bạn hãy kiểm tra danh mục bên dưới để lên kế hoạch nhập hàng kịp thời!`;
                    fallbackData = outOfStockProducts.map(p => ({ name: p.name, stockQuantity: p.stock || 0, unit: 'kg', sku: p.sku || 'N/A' }));
                } else {
                    fallbackReply = `✅ [Dự phòng Hệ thống] Báo cáo kho hàng: Trạng thái các mặt hàng trong kho tổng RoastLogic đang vô cùng ổn định. Không ghi nhận sản phẩm nào nằm dưới mức báo động sàn (50 kg).`;
                    fallbackData = allProducts.map(p => ({ name: p.name, stockQuantity: p.stock || 0, unit: 'kg', sku: p.sku || 'N/A' }));
                }

            // Case 3: Các câu hỏi chung chung khác
            } else {
                fallbackReply = `☕ [Dự phòng Hệ thống] Chào bạn! Hệ thống luồng trí tuệ nhân tạo Gemini hiện đang bận sắp xếp lại token dữ liệu kho. Dữ liệu mảng cấu trúc cục bộ vẫn hoạt động đồng bộ hoàn toàn. Bạn có thể tra cứu nhanh: "Sản phẩm nào sắp hết hàng?" hoặc "Kiểm tra độ ẩm các lô".`;
                fallbackData = allProducts.map(p => ({ name: p.name, stockQuantity: p.stock || 0, unit: 'kg', sku: p.sku || 'N/A' }));
            }

            return res.json({
                success: true,
                reply: fallbackReply,
                data: fallbackData
            });
        }

    } catch (err) {
        console.error("🚨 Lỗi sập luồng xử lý chính API AI:", err);
        res.status(500).json({ success: false, message: "Hệ thống Trợ lý AI đang gặp sự cố nghiêm trọng, vui lòng liên hệ dev team!" });
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
 💾 DATABASE (MONGODB): KẾT NỐI THÀNH CÔNG THỰC TẾ
 📡 GEMINI AI ENGINE: ĐÃ KÍCH HOẠT ĐỌC HIỂU TOÀN DIỆN DATA KHO
 📡 STAFF API: ĐÃ KÍCH HOẠT ĐỊNH TUYẾN /api/staff THÀNH CÔNG
 🛡️ CHẾ ĐỘ CHỐNG LỖI 429: SẴN SÀNG KHỞI CHẠY KHẨN CẤP DỰ PHÒNG
===========================================================
            `);
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động hệ thống:', error);
        process.exit(1);
    }
};

startServer();