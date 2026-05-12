// server/controllers/aiController.js

const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Supplier = require('../models/Supplier');

/**
 * @desc    Xử lý hội thoại chat với "Hạt Cà Phê AI"
 * @route   POST /api/ai/chat
 * @access  Private
 */
exports.handleAIChat = async (req, res) => {
    try {
        const { message } = req.body;
        const lowerMsg = message.toLowerCase();
        let reply = "";

        // 1. Xử lý hỏi về Tồn kho thấp
        if (lowerMsg.includes('tồn kho') || lowerMsg.includes('hết hàng') || lowerMsg.includes('thấp')) {
            const lowStock = await Product.find({
                $expr: { $lt: ['$stockQuantity', '$minimumStock'] }
            }).lean();

            if (lowStock.length > 0) {
                const list = lowStock.map(p => `- ${p.name} (Còn ${p.stockQuantity} ${p.unit})`).join('\n');
                reply = `Cảnh báo! Hiện có ${lowStock.length} mặt hàng sắp hết:\n${list}\nBạn nên xem xét nhập thêm hàng ngay nhé! ☕`;
            } else {
                reply = "Tin tốt! Hiện tại mọi mặt hàng trong kho đều đang ở mức an toàn. ☕";
            }
        }

        // 2. Xử lý hỏi về Doanh thu / Thống kê
        else if (lowerMsg.includes('doanh thu') || lowerMsg.includes('tiền') || lowerMsg.includes('bán được')) {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const monthlyTransactions = await Transaction.find({
                type: 'out',
                createdAt: { $gte: startOfMonth }
            }).lean();

            const revenue = monthlyTransactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
            reply = `Doanh thu tháng này của RoastLogic đạt khoảng ${revenue.toLocaleString('vi-VN')} VNĐ từ ${monthlyTransactions.length} giao dịch. Khá là bận rộn đấy! 🚀`;
        }

        // 3. Xử lý hỏi về Đơn hàng chờ (Pending)
        else if (lowerMsg.includes('chờ') || lowerMsg.includes('đơn hàng mới') || lowerMsg.includes('inbound')) {
            const pending = await Transaction.find({ type: 'in' }).limit(5).sort({ createdAt: -1 }).lean();
            if (pending.length > 0) {
                reply = `Hiện đang có ${pending.length} lô hàng vừa nhập kho hoặc đang chờ xử lý. Bạn có muốn xem chi tiết trong mục 'Nhập kho' không?`;
            } else {
                reply = "Hiện không có đơn hàng nào đang ở trạng thái chờ xử lý.";
            }
        }

        // 4. Các câu hỏi xã giao hoặc mặc định
        else if (lowerMsg.includes('chào') || lowerMsg.includes('hello')) {
            reply = "Chào bạn! Mình là Hạt Cà Phê AI của RoastLogic. Bạn muốn kiểm tra tồn kho, doanh thu hay hỏi gì về nhà cung cấp không? ☕";
        }
        else {
            reply = "Hạt cà phê nghe đây! Hiện tại mình có thể giúp bạn kiểm tra: \n1. Sản phẩm sắp hết hàng\n2. Doanh thu tháng\n3. Trạng thái các đơn hàng nhập/xuất.\nBạn thử hỏi 'Sản phẩm nào sắp hết' xem sao!";
        }

        res.status(200).json({ success: true, reply });

    } catch (error) {
        res.status(500).json({ success: false, reply: "Hạt cà phê hơi mệt, bạn thử lại sau nhé! ☕⚠️" });
    }
    // 1. Kiểm tra Nhà cung cấp
    if (lowerMsg.includes('nhà cung cấp') || lowerMsg.includes('supplier')) {
        const supplierName = lowerMsg.replace(/.*nhà cung cấp\s+/g, '').trim();
        const supplier = await Supplier.findOne({ name: new RegExp(supplierName, 'i') }).lean();

        if (supplier) {
            reply = `Thông tin nhà cung cấp ${supplier.name}:\n- Người liên hệ: ${supplier.contactName}\n- SĐT: ${supplier.phone}\n- Email: ${supplier.email}`;
        } else {
            const totalSuppliers = await Supplier.countDocuments();
            reply = `RoastLogic hiện đang hợp tác với ${totalSuppliers} nhà cung cấp. Bạn muốn tìm thông tin của đơn vị cụ thể nào không?`;
        }
    }

    // 2. Thống kê giao dịch nhanh
    else if (lowerMsg.includes('giao dịch') || lowerMsg.includes('xuất kho') || lowerMsg.includes('nhập kho')) {
        const today = new Date().setHours(0, 0, 0, 0);
        const count = await Transaction.countDocuments({ createdAt: { $gte: today } });
        reply = `Hôm nay hệ thống đã ghi nhận ${count} giao dịch mới. Bạn có thể vào mục 'Giao dịch' để xem chi tiết từng mã vận đơn nhé! ☕`;
    }

    // 3. Kiểm tra sản phẩm cụ thể (Ví dụ: Arabica, Robusta)
    else if (lowerMsg.includes('kiểm tra mã') || lowerMsg.includes('sku')) {
        const sku = lowerMsg.split(' ').pop().toUpperCase();
        const product = await Product.findOne({ sku }).lean();
        if (product) {
            reply = `Sản phẩm: ${product.name}\n- Tồn kho: ${product.stockQuantity} ${product.unit}\n- Giá bán: ${product.salePrice.toLocaleString()}đ\n- Vị trí: Kho A1`;
        } else {
            reply = "Mình không tìm thấy sản phẩm nào có mã SKU này. Bạn kiểm tra lại giúp mình nhé!";
        }
    }
};

/**
 * @desc    Get complete warehouse data for AI analysis
 */
exports.getWarehouseData = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('supplier', 'name contactName phone email')
            .populate('category', 'name')
            .select('name sku stockQuantity minimumStock costPrice salePrice supplier category unit')
            .lean();

        const suppliers = await Supplier.find()
            .select('name contactName phone email address')
            .lean();

        const transactions = await Transaction.find()
            .populate('product', 'name sku')
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        const data = {
            products: products.map(p => ({
                id: p._id,
                name: p.name,
                sku: p.sku,
                quantity: p.stockQuantity,
                minimumStock: p.minimumStock,
                price: p.costPrice,
                salePrice: p.salePrice,
                unit: p.unit,
                preferredSupplier: p.supplier?.name || 'N/A',
                category: p.category?.name || 'N/A'
            })),
            suppliers: suppliers.map(s => ({
                id: s._id,
                name: s.name,
                contactPerson: s.contactName || '',
                phone: s.phone || '',
                email: s.email || '',
                address: s.address || ''
            })),
            transactions: transactions.map(t => ({
                id: t._id,
                type: t.type === 'in' ? 'inbound' : 'outbound',
                productName: t.product?.name || 'Unknown',
                quantity: t.quantity,
                price: t.price,
                timestamp: new Date(t.createdAt).toLocaleDateString('vi-VN')
            }))
        };

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi tải dữ liệu kho', error: error.message });
    }
};

/**
 * @desc    Get low stock products alert
 */
exports.getLowStockAlert = async (req, res) => {
    try {
        const lowStockProducts = await Product.find({
            $expr: { $lt: ['$stockQuantity', '$minimumStock'] }
        })
            .populate('supplier', 'name phone email')
            .sort({ stockQuantity: 1 })
            .lean();

        const alert = lowStockProducts.map(p => ({
            id: p._id,
            name: p.name,
            currentStock: p.stockQuantity,
            minimumStock: p.minimumStock,
            shortage: p.minimumStock - p.stockQuantity,
            preferredSupplier: p.supplier?.name || 'N/A'
        }));

        res.status(200).json({ success: true, count: alert.length, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy cảnh báo tồn kho thấp', error: error.message });
    }
};

/**
 * @desc    Get pending inbound orders
 */
exports.getPendingOrders = async (req, res) => {
    try {
        const pendingOrders = await Transaction.find({ type: 'in' })
            .populate('product', 'name sku')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const orders = pendingOrders.map(t => ({
            id: t._id,
            productName: t.product?.name || 'Unknown',
            quantity: t.quantity,
            totalValue: t.quantity * t.price,
            createdAt: new Date(t.createdAt).toLocaleDateString('vi-VN'),
            status: 'pending'
        }));

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy đơn hàng chờ xử lý', error: error.message });
    }
};

/**
 * @desc    Get revenue statistics
 */
exports.getRevenueStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const monthlyTransactions = await Transaction.find({
            type: 'out',
            createdAt: { $gte: startOfMonth }
        }).lean();

        const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);

        res.status(200).json({
            success: true,
            data: {
                monthly: {
                    revenue: monthlyRevenue,
                    transactions: monthlyTransactions.length,
                    startDate: startOfMonth.toLocaleDateString('vi-VN')
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi tính toán doanh thu', error: error.message });
    }
};

/**
 * @desc    Get supplier performance analytics
 */
exports.getSupplierAnalytics = async (req, res) => {
    try {
        const suppliers = await Supplier.find().lean();
        const analytics = await Promise.all(
            suppliers.map(async (supplier) => {
                const transactions = await Transaction.find({ type: 'in' })
                    .populate({
                        path: 'product',
                        match: { supplier: supplier._id }
                    }).lean();

                const validT = transactions.filter(t => t.product);
                return {
                    id: supplier._id,
                    name: supplier.name,
                    totalOrders: validT.length,
                    totalValue: validT.reduce((sum, t) => sum + (t.quantity * t.price), 0),
                    rating: (validT.length > 0 ? 4.5 : 0).toFixed(1) // Mock rating
                };
            })
        );

        res.status(200).json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi phân tích nhà cung cấp', error: error.message });
    }
};