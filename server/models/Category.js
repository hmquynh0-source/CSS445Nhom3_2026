const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    // Tên loại sản phẩm (VD: Robusta G1, Arabica Specialty...)
    name: {
        type: String,
        required: [true, 'Tên loại sản phẩm là bắt buộc'],
        trim: true,
        // Đã loại bỏ unique: true để tránh xung đột tên hạt giữa các nhà cung cấp khác nhau
        maxlength: [100, 'Tên loại sản phẩm không được vượt quá 100 ký tự']
    },
    // Mô tả ngắn về loại sản phẩm / Đặc trưng vùng trồng
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
    },
    // 🚀 Số lượng tồn kho thực tế của loại hạt này (Khối lượng sẵn có tính bằng KG)
    quantity: {
        type: Number,
        default: 0,
        min: [0, 'Số lượng hàng tồn kho không được nhỏ hơn 0']
    },
    // 🚀 ID của Nhà cung cấp sở hữu loại hạt này (Liên kết sang bảng Users/Suppliers)
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Đổi thành 'Supplier' nếu bạn tách riêng bảng NCC, còn dùng chung phân quyền thì giữ 'User'
        required: [true, 'Mã nhà cung cấp là bắt buộc để quản lý kho riêng biệt']
    },
    // Ngày tạo (Tự động)
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 🛠️ TỐI ƯU INDEXES:
// 1. Index kết hợp: Đảm bảo MỘT nhà cung cấp không tạo 2 loại hạt trùng tên, nhưng các NCC khác nhau vẫn tạo được trùng tên
categorySchema.index({ name: 1, supplier: 1 }, { unique: true });

// 2. Index cho trường supplier để tăng tốc độ truy vấn lọc kho theo từng NCC khi load lại trang
categorySchema.index({ supplier: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;