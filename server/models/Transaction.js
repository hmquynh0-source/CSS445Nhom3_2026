// server/models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = mongoose.Schema(
    {
        // 1. Liên kết đến Sản phẩm
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Sản phẩm là bắt buộc cho giao dịch.'],
        },
        // 2. Liên kết đến Nhà cung cấp (CỰC KỲ QUAN TRỌNG cho Portal NCC)
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
            required: false, // Tạm thời để false nếu là giao dịch xuất kho (out)
        },
        // 3. Mã yêu cầu nhập hàng (Hiện trên giao diện ROASTLOGIC)
        requestId: {
            type: String,
            unique: true,
            sparse: true, // Cho phép null đối với các giao dịch cũ hoặc giao dịch xuất
        },
        // 4. Trạng thái giao dịch (Để NCC phê duyệt)
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
            default: 'COMPLETED', // Mặc định là hoàn thành, trừ khi là yêu cầu nhập hàng
        },
        // 5. Loại giao dịch: 'in' (Nhập) hoặc 'out' (Xuất)
        type: {
            type: String,
            required: [true, 'Loại giao dịch (in/out) là bắt buộc.'],
            enum: ['in', 'out'], 
        },
        // 6. Số lượng (kg/bao)
        quantity: {
            type: Number,
            required: [true, 'Số lượng là bắt buộc.'],
            min: [1, 'Số lượng giao dịch phải lớn hơn 0.'],
        },
        // 7. Giá giao dịch (Giá vốn tại thời điểm đó)
        price: {
            type: Number,
            required: [true, 'Giá giao dịch là bắt buộc.'],
            min: [0, 'Giá không thể là số âm.'],
        },
        // 8. Ghi chú (Tên đối tác, lý do nhập/xuất)
        notes: {
            type: String,
            trim: true,
        },
        // 9. Người thực hiện
        user: {
            type: String, 
            default: 'System', 
        },
    },
    {
        timestamps: true, // Tự động tạo createdAt, updatedAt
    }
);

// Tạo Index để tìm kiếm nhanh theo mã yêu cầu hoặc nhà cung cấp
TransactionSchema.index({ requestId: 1 });
TransactionSchema.index({ supplier: 1 });

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;