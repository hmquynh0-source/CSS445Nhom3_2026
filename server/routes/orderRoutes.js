const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // Cần import Product để trừ tồn kho

// 1. Lấy danh sách đơn hàng chung (Dùng cho Lịch sử đơn hàng của khách)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('product').sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu" });
    }
});

// 2. [ADMIN] Lấy danh sách đơn hàng chờ duyệt (PROCESSING) hoặc đã duyệt (APPROVED)
// Dùng cho giao diện Xuất kho của Admin (PB08)
router.get('/admin/status/:statusName', async (req, res) => {
    try {
        const status = req.params.statusName.toUpperCase();
        const orders = await Order.find({ status }).populate('product');
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Tạo đơn hàng mới (Từ khách hàng)
router.post('/', async (req, res) => {
    try {
        const { orderCode, product, quantity, totalPrice } = req.body;
        const newOrder = new Order({
            orderCode: orderCode || `RL-${Math.floor(1000 + Math.random() * 9000)}`,
            product,
            quantity,
            totalPrice,
            status: 'PROCESSING', // Mặc định là chờ duyệt
            customerName: "Khách hàng vãng lai"
        });
        await newOrder.save();
        res.status(201).json({ success: true, data: newOrder });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// 4. [ADMIN] Duyệt đơn hàng (Chuyển sang APPROVED để hiện ở danh sách chờ xuất)
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

// 5. [ADMIN] Xác nhận xuất kho (Trừ tồn kho thật và chuyển sang COMPLETED)
router.post('/:id/confirm-export', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        // Tìm sản phẩm và trừ số lượng trong kho
        const product = await Product.findById(order.product);
        if (product.stock < order.quantity) {
            return res.status(400).json({ success: false, message: "Kho không đủ hàng!" });
        }

        product.stock -= order.quantity; // Trừ kho
        await product.save();

        // Cập nhật đơn hàng thành hoàn tất
        order.status = 'COMPLETED';
        await order.save();

        res.json({ success: true, message: "Đã xuất kho thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;