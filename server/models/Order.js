const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    // 1. Mã đơn hàng: Không để unique: true ở đây nữa để tránh lỗi E11000 nếu gửi null
    orderCode: { 
        type: String, 
        required: true
    },

    // 2. Liên kết với người dùng (Đây là chìa khóa để phân biệt đơn hàng của từng tài khoản)
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    // 3. Liên kết với sản phẩm
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true 
    },

    // 4. Số lượng đặt
    quantity: { 
        type: Number, 
        required: true,
        min: [1, 'Số lượng phải ít nhất là 1']
    },

    // 5. Tổng tiền
    totalPrice: { 
        type: Number, 
        required: true 
    },

    // 6. Trạng thái đơn hàng
    status: { 
        type: String, 
        enum: ['PENDING', 'PROCESSING', 'APPROVED', 'COMPLETED', 'CANCELLED'], 
        default: 'PROCESSING' 
    },

    // 7. Thông tin bổ sung
    customerName: { 
        type: String, 
        default: 'Khách hàng vãng lai' 
    }
}, { 
    timestamps: true // Tự động tạo createdAt và updatedAt
});

// Tạo index để tìm kiếm theo user nhanh hơn (nhưng không bắt buộc duy nhất)
OrderSchema.index({ user: 1 });

module.exports = mongoose.model('Order', OrderSchema);