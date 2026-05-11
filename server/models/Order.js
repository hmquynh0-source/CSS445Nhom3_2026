const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderCode: { 
        type: String, 
        required: true, 
        unique: true 
    },
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true // Bắt buộc phải có để biết trừ kho sản phẩm nào
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        // THÊM 'APPROVED' VÀO ĐÂY
        enum: ['PENDING', 'PROCESSING', 'APPROVED', 'COMPLETED', 'CANCELLED'], 
        default: 'PROCESSING' 
    },
    customerName: { 
        type: String, 
        default: 'Khách hàng vãng lai' 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Order', OrderSchema);