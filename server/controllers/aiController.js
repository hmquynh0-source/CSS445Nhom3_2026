const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Supplier = require('../models/Supplier');

/**
 * @desc    Xử lý hội thoại chat thông minh với "Hạt Cà Phê AI"
 * @route   POST /api/ai/chat
 */
exports.handleAIChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, reply: "Bạn chưa nhập câu hỏi!" });

        const lowerMsg = message.toLowerCase();
        let reply = "";

        // TẬP TRUNG TẤT CẢ LOGIC VÀO TRONG MỘT KHỐI TRY/CATCH DUY NHẤT
        
        // 1. Kiểm tra Nhà cung cấp
        if (lowerMsg.includes('nhà cung cấp') || lowerMsg.includes('supplier')) {
            const supplierName = lowerMsg.replace(/.*(nhà cung cấp|supplier)\s+/g, '').trim();
            const supplier = await Supplier.findOne({ name: new RegExp(supplierName, 'i') }).lean();
            
            if (supplier) {
                reply = `Thông tin nhà cung cấp ${supplier.name}:\n- Người liên hệ: ${supplier.contactName}\n- SĐT: ${supplier.phone}\n- Email: ${supplier.email}`;
            } else {
                const total = await Supplier.countDocuments();
                reply = `RoastLogic hiện đang hợp tác với ${total} nhà cung cấp. Bạn muốn tìm thông tin đơn vị nào cụ thể không?`;
            }
        }
        // 2. Kiểm tra sản phẩm (SKU)
        else if (lowerMsg.includes('kiểm tra mã') || lowerMsg.includes('sku')) {
            const sku = lowerMsg.split(' ').pop().toUpperCase();
            const product = await Product.findOne({ sku }).lean();
            reply = product 
                ? `Sản phẩm: ${product.name}\n- Tồn kho: ${product.stockQuantity} ${product.unit}\n- Giá bán: ${product.salePrice.toLocaleString()}đ`
                : "Mình không tìm thấy sản phẩm nào có mã SKU này.";
        }
        // 3. Tồn kho thấp
        else if (lowerMsg.includes('tồn kho') || lowerMsg.includes('hết hàng')) {
            const lowStock = await Product.find({ $expr: { $lt: ['$stockQuantity', '$minimumStock'] } }).lean();
            reply = lowStock.length > 0 
                ? `Cảnh báo! Có ${lowStock.length} mặt hàng sắp hết:\n` + lowStock.map(p => `- ${p.name}: Còn ${p.stockQuantity}`).join('\n')
                : "Tin tốt! Mọi mặt hàng đều đang ở mức an toàn. ☕";
        }
        // 4. Mặc định
        else {
            reply = "Hạt cà phê AI nghe đây! Bạn có thể hỏi mình về: Tồn kho, Doanh thu, thông tin Nhà cung cấp hoặc kiểm tra mã SKU sản phẩm nhé! ☕";
        }

        res.status(200).json({ success: true, reply });

    } catch (error) {
        console.error("Lỗi AI Chat:", error);
        res.status(500).json({ success: false, reply: "Hạt cà phê hơi mệt, bạn thử lại sau nhé! ☕" });
    }
};

// ... Các hàm còn lại (getWarehouseData, getLowStockAlert...) giữ nguyên vì đã đúng cấu trúc