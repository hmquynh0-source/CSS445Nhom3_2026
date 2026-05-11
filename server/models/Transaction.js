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
            required: false, 
        },
        // 3. Mã yêu cầu nhập hàng (Mã định danh duy nhất)
        requestId: {
            type: String,
            unique: true,
            sparse: true, // Quan trọng: Cho phép null nếu không phải đơn nhập mà không gây lỗi trùng lặp
        },
        // 4. Trạng thái giao dịch (Cần cho luồng phê duyệt)
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
            default: 'PENDING', // Đổi mặc định thành PENDING để chờ duyệt
        },
        // 5. Loại giao dịch (Sửa enum để khớp với Route)
        type: {
            type: String,
            required: [true, 'Loại giao dịch là bắt buộc.'],
            enum: ['in', 'out', 'IMPORT', 'EXPORT'], // Cho phép cả 2 định dạng
            set: v => v.toLowerCase() === 'import' ? 'in' : (v.toLowerCase() === 'export' ? 'out' : v)
            // Logic set ở trên: Nếu gửi IMPORT -> tự đổi thành 'in' cho đồng nhất dữ liệu
        },
        // 6. Số lượng
        quantity: {
            type: Number,
            required: [true, 'Số lượng là bắt buộc.'],
            min: [1, 'Số lượng giao dịch phải lớn hơn 0.'],
        },
        // 7. Giá giao dịch (Giá gốc)
        price: {
            type: Number,
            required: [true, 'Giá giao dịch là bắt buộc.'],
            min: [0, 'Giá không thể là số âm.'],
        },
        // 8. Tổng giá trị (Tính toán từ price * quantity)
        totalPrice: {
            type: Number,
            default: 0
        },
        // 9. Ghi chú
        notes: {
            type: String,
            trim: true,
        },
        // 10. Người thực hiện (Nên liên kết với User model nếu có)
        user: {
            type: String, 
            default: 'System Admin', 
        },
    },
    {
        timestamps: true,
    }
);

// Tránh lỗi "Duplicate schema index" mà Terminal đã cảnh báo:
// Chỉ định nghĩa index ở đây nếu TRONG schema ở trên chưa khai báo index: true hoặc unique: true
// Vì requestId đã có unique: true ở trên, ta không cần thêm index riêng bên dưới này nữa.
TransactionSchema.index({ supplier: 1 });
TransactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;