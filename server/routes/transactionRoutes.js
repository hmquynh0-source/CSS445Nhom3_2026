const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import các Middleware và Model
const { protect } = require('../middleware/authMiddleware'); 
const Transaction = require('../models/Transaction'); 
const Product = require('../models/Product'); 

// --- CÁC ROUTE GIAO DỊCH ---

/**
 * @route   POST /api/transactions/import
 * @desc    Admin tạo yêu cầu NHẬP KHO (Gửi cho nhà cung cấp)
 */
router.post('/import', protect, async (req, res) => {
    try {
        const { productId, supplierId, quantity, price, warehouseId, note } = req.body;

        if (!productId || !supplierId || !quantity || !price) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập đầy đủ: Sản phẩm, Nhà cung cấp, Số lượng và Giá." 
            });
        }

        // Tạo mã định danh duy nhất (Có thể dùng mã bạn muốn hoặc timestamp)
        const uniqueId = `REQ-IM-${Date.now()}`;

        const newTransaction = new Transaction({
            type: 'in', 
            product: productId,
            supplier: supplierId,
            warehouse: mongoose.Types.ObjectId.isValid(warehouseId) ? warehouseId : null,
            quantity: Number(quantity),
            price: Number(price), 
            totalPrice: Number(price) * Number(quantity),
            status: 'PENDING', 
            requestId: uniqueId,
            notes: note || "Yêu cầu nhập kho mới",
            user: req.user ? req.user.name : 'Admin'
        });

        await newTransaction.save();

        res.status(201).json({ 
            success: true, 
            message: "Yêu cầu nhập kho đã được gửi tới Nhà cung cấp!", 
            data: newTransaction 
        });

    } catch (error) {
        console.error("Lỗi tạo yêu cầu nhập kho:", error.message);
        res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
    }
});

/**
 * @route   GET /api/transactions/pending
 * @desc    Lấy danh sách các đơn đang chờ duyệt
 */
router.get('/pending', protect, async (req, res) => {
    try {
        const pendingRequests = await Transaction.find({ status: 'PENDING' })
            .populate('product', 'name sku image')
            .populate('supplier', 'name email')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, data: pendingRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách chờ duyệt" });
    }
});

/**
 * @route   GET /api/transactions/:requestId
 * @desc    Tìm một giao dịch cụ thể theo mã requestId (Sửa lỗi 404)
 */
router.get('/:requestId', protect, async (req, res) => {
    try {
        // Tìm theo requestId thay vì _id của MongoDB
        const transaction = await Transaction.findOne({ requestId: req.params.requestId })
            .populate('product', 'name sku image category')
            .populate('supplier', 'name email address phone');

        if (!transaction) {
            return res.status(404).json({ 
                success: false, 
                message: `Không tìm thấy lệnh giao hàng với mã: ${req.params.requestId}` 
            });
        }

        res.json({ success: true, data: transaction });
    } catch (error) {
        console.error("Lỗi lấy chi tiết đơn hàng:", error.message);
        res.status(500).json({ success: false, message: "Lỗi Server khi tìm đơn hàng" });
    }
});

/**
 * @route   PATCH /api/transactions/:id/approve
 * @desc    Phê duyệt đơn -> Cập nhật kho hàng
 */
router.patch('/:id/approve', protect, async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem là ObjectId hay requestId
        let transaction;
        if (mongoose.Types.ObjectId.isValid(id)) {
            transaction = await Transaction.findById(id);
        } else {
            transaction = await Transaction.findOne({ requestId: id });
        }
        
        if (!transaction) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        if (transaction.status === 'APPROVED') {
            return res.status(400).json({ success: false, message: "Đơn hàng này đã được duyệt rồi" });
        }

        // Cập nhật trạng thái
        transaction.status = 'APPROVED';
        await transaction.save();

        // Cập nhật tồn kho thực tế của Sản phẩm
        await Product.findByIdAndUpdate(transaction.product, {
            $inc: { stock: transaction.quantity }
        });

        res.json({ 
            success: true, 
            message: "Phê duyệt thành công! Tồn kho đã được cập nhật.",
            data: transaction 
        });
    } catch (error) {
        console.error("Lỗi phê duyệt:", error);
        res.status(500).json({ success: false, message: "Lỗi Server khi phê duyệt" });
    }
});

/**
 * @route   GET /api/transactions
 * @desc    Lấy tất cả lịch sử giao dịch
 */
router.get('/', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('product', 'name sku')
            .populate('supplier', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi lấy lịch sử" });
    }
});

module.exports = router;