const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true
    },
    sku: {
        type: String,
        required: [true, 'Vui lòng nhập mã SKU'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    costPrice: {
        type: Number,
        default: 0
    },
    salePrice: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        default: 'Bao 25kg'
    },
    stockQuantity: {
        type: Number,
        default: 0
    },
    image: {
        type: String, // Lưu link ảnh hoặc base64
        default: ''
    },
    // PHẦN QUAN TRỌNG NHẤT: Liên kết với model Category
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
        required: false
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);