// server/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên sản phẩm là bắt buộc'],
            trim: true,
        },
        sku: {
            type: String,
            required: [true, 'Mã SKU là bắt buộc'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            default: 'https://via.placeholder.com/150', 
        },
        category: {
            type: String,
            required: false,
        },
        supplier: {
            type: String,
            required: false,
        },
        salePrice: {
            type: Number,
            default: 0,
        },
        costPrice: {
            type: Number,
            default: 0,
        },
        stockQuantity: {
            type: Number,
            default: 0, // Mặc định là 0 nếu form không có ô nhập số lượng
        },
        unit: {
            type: String,
            default: 'Cái', // Nếu form không có ô nhập đơn vị tính, BE sẽ tự điền 'Cái'
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;