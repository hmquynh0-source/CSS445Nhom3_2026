// server/routes/transactionRoutes.js

const express = require('express');
const router = express.Router();

// Import các hàm từ Controller
const { 
    createTransaction, 
    getTransactions 
} = require('../controllers/TransactionController'); 

// Import Middleware bảo vệ (Yêu cầu đăng nhập/Token)
const { protect } = require('../middleware/authMiddleware'); 

// Import trực tiếp Model để thực hiện các câu lệnh truy vấn chi tiết
const Transaction = require('../models/Transaction'); 


// --- CÁC ROUTE GIAO DỊCH ---

/**
 * @route   POST /api/transactions
 * @desc    Tạo giao dịch mới (Nhập hoặc Xuất kho)
 * @access  Private
 */
router.post('/', protect, createTransaction);

/**
 * @route   GET /api/transactions
 * @desc    Lấy tất cả lịch sử giao dịch (Có thể dùng cho báo cáo chung)
 * @access  Private
 */
router.get('/', protect, getTransactions);

/**
 * @route   GET /api/transactions/pending
 * @desc    Lấy danh sách các đơn đang chờ duyệt (Dùng cho trang Phê duyệt)
 * @access  Private
 */
router.get('/pending', protect, async (req, res) => {
    try {
        const pendingRequests = await Transaction.find({ status: 'PENDING' });
        res.json(pendingRequests);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách chờ duyệt" });
    }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Lấy chi tiết một đơn hàng theo orderId (Dùng cho trang Lệnh giao hàng)
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        // Tìm theo trường 'orderId' (ví dụ: DO-SUP-2024-001) thay vì _id mặc định
        const transaction = await Transaction.findOne({ 
            $or: [
                { orderId: req.params.id },
                { requestId: req.params.id }
            ]
        });

        if (!transaction) {
            return res.status(404).json({ message: "Không tìm thấy mã đơn này trong hệ thống" });
        }
        
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server khi tìm dữ liệu đơn hàng" });
    }
});

/**
 * @route   PATCH /api/transactions/:id/approve
 * @desc    Phê duyệt đơn hàng (Đổi status từ PENDING -> APPROVED)
 * @access  Private
 */
router.patch('/:id/approve', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { $or: [{ orderId: req.params.id }, { requestId: req.params.id }] },
            { status: 'APPROVED' },
            { new: true }
        );
        
        if (!transaction) {
            return res.status(404).json({ message: "Không tìm thấy đơn để phê duyệt" });
        }
        
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi phê duyệt đơn hàng" });
    }
});

module.exports = router;