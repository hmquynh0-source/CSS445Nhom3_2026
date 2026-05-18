const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import các Middleware và Model
const { protect } = require('../middleware/authMiddleware'); 
const Transaction = require('../models/Transaction'); 
const Product = require('../models/Product'); 

// Import Controller xử lý số liệu Dashboard vừa đổi tên
const supplierPageCtrl = require('../controllers/supplierpageController');

// --- ROUTE THỐNG KÊ CHO SUPPLIER DASHBOARD ---
/**
 * @route   GET /api/transactions/supplier/dashboard-stats
 * @desc    Lấy số liệu thật (Tồn kho NCC, Đơn đang đi, Đơn hoàn tất tháng)
 */
router.get('/supplier/dashboard-stats', protect, supplierPageCtrl.getSupplierStats);


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
 * @desc    Tìm một giao dịch cụ thể theo mã requestId
 */
router.get('/:requestId', protect, async (req, res) => {
    try {
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
 * @desc    Phê duyệt đơn -> Cập nhật tăng kho hệ thống ĐỒNG THỜI trừ kho nhà cung cấp
 */
router.patch('/:id/approve', protect, async (req, res) => {
    try {
        const { id } = req.params;

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

        // 1. Kiểm tra lượng hàng sẵn có của Nhà cung cấp trước khi trừ kho
        const productData = await Product.findById(transaction.product);
        if (!productData) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại trong hệ thống" });
        }
        
        if ((productData.availableWeight || 0) < transaction.quantity) {
            return res.status(400).json({ 
                success: false, 
                message: `Kho NCC không đủ hàng! Hiện có: ${productData.availableWeight} kg, yêu cầu: ${transaction.quantity} kg.` 
            });
        }

        // 2. Chuyển trạng thái đơn hàng sang APPROVED
        transaction.status = 'APPROVED';
        await transaction.save();

        // 3. ĐỒNG BỘ KHO 2 BÊN:
        // - Vừa tăng tồn kho 'stock' của Hệ thống nhận (Kho tổng RoastLogic)
        // - Vừa trừ khối lượng sẵn có 'availableWeight' của Nhà cung cấp
        await Product.findByIdAndUpdate(transaction.product, {
            $inc: { 
                stock: transaction.quantity,                  // Cộng kho nhận
                availableWeight: -transaction.quantity       // Trừ khối lượng sẵn có tại mục nhà cung cấp
            }
        });

        res.json({ 
            success: true, 
            message: "Phê duyệt và kích hoạt vận chuyển thành công! Số liệu kho 2 bên đã tự động đồng bộ.",
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