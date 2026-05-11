const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// 1. LẤY DANH SÁCH ĐƠN HÀNG (CÓ LỌC THEO USER)
// Frontend gọi: /api/orders?userId=ID_CUA_BAN
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query; // Nhận userId từ client gửi lên
        
        let filter = {};
        if (userId) {
            filter = { user: userId }; // Chỉ lọc những đơn hàng của user này
        }

        const orders = await Order.find(filter)
            .populate('product')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: orders });
    } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
        res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu đơn hàng" });
    }
});

// 2. [ADMIN] LẤY ĐƠN THEO TRẠNG THÁI (Cho quản lý kho)
router.get('/admin/status/:statusName', async (req, res) => {
    try {
        const status = req.params.statusName.toUpperCase();
        const orders = await Order.find({ status }).populate('product');
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. TẠO ĐƠN HÀNG MỚI (Cập nhật để lưu kèm User ID)
router.post('/', async (req, res) => {
    try {
        const { product, quantity, totalPrice, userId, customerName } = req.body;

        // Tự động tạo mã đơn hàng duy nhất dựa trên thời gian để tránh lỗi Duplicate Key
        const autoOrderCode = `RL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newOrder = new Order({
            orderCode: autoOrderCode,
            product: product,    // ID của sản phẩm
            user: userId,       // ID của người đặt hàng (để phân biệt giữa các tài khoản)
            quantity: quantity,
            totalPrice: totalPrice,
            status: 'PROCESSING',
            customerName: customerName || "Khách hàng vãng lai"
        });

        await newOrder.save();
        res.status(201).json({ success: true, data: newOrder });
    } catch (err) {
        console.error("Lỗi tạo đơn hàng:", err.message);
        res.status(400).json({ success: false, message: "Không thể tạo đơn hàng: " + err.message });
    }
});

// 4. [ADMIN] DUYỆT ĐƠN HÀNG (Chuyển sang APPROVED)
router.patch('/:id/approve', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'APPROVED' },
            { new: true }
        );
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: "Không thể duyệt đơn" });
    }
});

// 5. [ADMIN] XÁC NHẬN XUẤT KHO (Trừ tồn kho và chuyển COMPLETED)
router.post('/:id/confirm-export', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        const product = await Product.findById(order.product);
        if (!product || product.stock < order.quantity) {
            return res.status(400).json({ success: false, message: "Kho không đủ hàng hoặc sản phẩm không tồn tại!" });
        }

        // Thực hiện trừ kho
        product.stock -= order.quantity;
        await product.save();

        // Hoàn tất đơn hàng
        order.status = 'COMPLETED';
        await order.save();

        res.json({ success: true, message: "Đã xuất kho thành công và cập nhật tồn kho!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;