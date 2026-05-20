const mongoose = require('mongoose');

const SupplierStockSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    categoryID: {
        type: mongoose.Schema.Types.ObjectId, // Khóa ngoại đồng bộ 100% với bảng Categories tổng
        required: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SupplierStock', SupplierStockSchema);