const mongoose = require('mongoose');

const SupplierProductSchema = new mongoose.Schema({
    skuCode: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // Ví dụ: Robusta Honey G1
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Kết nối đến bảng danh mục
    region: { type: String, default: 'Chưa xác định' },
    moisture: { type: String, default: '12.5%' },
    screenSize: { type: String, default: 'S18' },
    quantity: { type: Number, required: true, default: 0 }, // Số lượng tồn kho dạng số (để trừ kho)
    status: { type: String, default: 'SẴN SÀNG' }
}, { timestamps: true });

module.exports = mongoose.isValidObjectId('SupplierProduct') 
  ? mongoose.model('SupplierProduct') 
  : mongoose.model('SupplierProduct', SupplierProductSchema);