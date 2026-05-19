const mongoose = require('mongoose');

const OutboundSchema = new mongoose.Schema({
    outboundCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    orderCode: {
        type: String, // Liên kết với mã đơn hàng đã duyệt
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Liên kết tới bảng sản phẩm cà phê của bạn
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    shippingAddress: {
        type: String,
        default: "Nhận tại nhà máy"
    },
    exportDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING'],
        default: 'COMPLETED'
    }
}, { timestamps: true });

module.exports = mongoose.model('Outbound', OutboundSchema);