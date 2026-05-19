const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// =================================================================
// 1. LẤY DANH SÁCH ĐƠN HÀNG (HỖ TRỢ LỌC THEO CẢ USER VÀ STATUS)
// =================================================================
// Cả tài khoản khách hàng (?userId=...) và phân hệ xuất kho (?status=APPROVED) đều gọi chung ở đây
router.get('/', async (req, res) => {
    try {
        const { userId, status } = req.query; 
        
        let filter = {};
        if (userId) {
            filter.user = userId;
        }
        if (status) {
            // Ép buộc cắt khoảng trắng và viết hoa hoàn toàn để tránh lỗi so sánh chuỗi
            filter.status = status.trim().toUpperCase(); 
        }

        const orders = await Order.find(filter)
            .populate('product')
            .sort({ createdAt: -1 }); // Đơn hàng mới nhất lên đầu

        res.json({ success: true, data: orders });
    } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
        res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu đơn hàng" });
    }
});

// =================================================================
// 2. [ADMIN] LẤY ĐƠN THEO TRẠNG THÁI (Giữ nguyên cho các phân hệ khác nếu cần)
// =================================================================
router.get('/admin/status/:statusName', async (req, res) => {
    try {
        const status = req.params.statusName.toUpperCase();
        const orders = await Order.find({ status }).populate('product');
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// =================================================================
// 3. TẠO ĐƠN HÀNG MỚI (Từ tài khoản Khách hàng / Sales gửi lên)
// =================================================================
router.post('/', async (req, res) => {
    try {
        const { product, quantity, totalPrice, userId, customerName } = req.body;

        // Tự động tạo mã đơn hàng ngẫu nhiên tránh trùng lặp
        const autoOrderCode = `RL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newOrder = new Order({
            orderCode: autoOrderCode,
            product: product,
            user: userId,
            quantity: quantity,
            totalPrice: totalPrice,
            status: 'APPROVED', // 🚀 Giữ nguyên là APPROVED để kho nhìn thấy ngay lập tức khi vừa đặt xong!
            customerName: customerName || "Khách hàng vãng lai"
        });

        await newOrder.save();
        res.status(201).json({ success: true, data: newOrder });
    } catch (err) {
        console.error("Lỗi tạo đơn hàng:", err.message);
        res.status(400).json({ success: false, message: "Không thể tạo đơn hàng: " + err.message });
    }
});

// =================================================================
// 4. [ADMIN] DUYỆT ĐƠN HÀNG (Chuyển trạng thái sang APPROVED)
// =================================================================
router.patch('/:id/approve', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'APPROVED' },
            { new: true }
        ).populate('product');
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: "Không thể duyệt đơn" });
    }
});

// =================================================================
// 5. 🚀 [OUTBOUND] XÁC NHẬN XUẤT KHO VÀ ĐỒNG BỘ TRỪ KHO THỰC TẾ
// =================================================================
router.post('/:id/confirm-export', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });

        // Chống lỗi bấm đúp chuột liên tục gửi nhiều yêu cầu làm trừ âm kho
        if (order.status === 'COMPLETED') {
            return res.status(400).json({ success: false, message: "Đơn hàng này đã được xuất kho hoàn tất từ trước!" });
        }

        const product = await Product.findById(order.product);
        if (!product || product.stock < order.quantity) {
            return res.status(400).json({ success: false, message: "Kho không đủ số lượng hàng tồn để thực hiện xuất!" });
        }

        // 🚀 ĐÃ SỬA LẠI TẠI ĐÂY: Đổi thành dấu trừ (-=) để bốc hàng ra khỏi kho
        product.stock -= order.quantity;
        await product.save();

        // Chuyển hẳn trạng thái của đơn hàng thành COMPLETED (Đã hoàn thành xuất kho)
        order.status = 'COMPLETED';
        await order.save();

        res.json({
            success: true,
            message: "Đã xuất kho thành công và cập nhật trừ tồn kho thực tế!",
            data: order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;