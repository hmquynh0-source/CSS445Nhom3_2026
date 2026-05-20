const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        default: 'in' 
    },
    // ĐÃ SỬA: Đổi từ ref: 'Product' sang 'Category' để khớp với ID của categories bạn đang lưu trong DB
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
        required: [true, 'Sản phẩm/Danh mục là bắt buộc']
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: [true, 'Nhà cung cấp là bắt buộc']
    },
    productName: {
        type: String,
        trim: true,
        default: ''
    },
    supplierName: {
        type: String,
        trim: true,
        default: ''
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        default: null
    },
    quantity: {
        type: Number,
        required: [true, 'Số lượng là bắt buộc']
    },
    price: {
        type: Number,
        required: [true, 'Giá là bắt buộc']
    },
    totalPrice: {
        type: Number,
        required: true
    },
    moisture: {
        type: Number,
        default: 0
    },
    screen: {
        type: String,
        default: ''
    },
    defectRate: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'],
        default: 'PENDING'
    },
    requestId: {
        type: String,
        required: true,
        unique: true
    },
    rejectionReason: {
        type: String,
        trim: true,
        default: ''
    },
    notes: {
        type: String,
        default: "Yêu cầu nhập kho nhân xanh"
    },
    user: {
        type: String,
        default: 'Admin'
    }
}, { 
    timestamps: true // Tự động sinh ra trường createdAt và updatedAt cho bạn
});

module.exports = mongoose.model('Transaction', transactionSchema);