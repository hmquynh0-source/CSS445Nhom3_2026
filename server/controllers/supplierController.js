const asyncHandler = require('express-async-handler');
const Supplier = require('../models/Supplier');
const Transaction = require('../models/Transaction');

// @desc    Lấy tất cả Nhà cung cấp (Dùng cho Dropdown)
// @route   GET /api/suppliers
// @access  Public (Nên để public để dropdown luôn có dữ liệu)
const getSuppliers = asyncHandler(async (req, res) => {
    // Chỉ lấy các trường cần thiết để dropdown nhẹ hơn
    const suppliers = await Supplier.find({}).sort({ name: 1 });

    res.status(200).json({
        success: true,
        data: suppliers || [] 
    });
});

// @desc    Tạo Nhà cung cấp mới
const createSupplier = asyncHandler(async (req, res) => {
    const { name, contactName, phone, email, address } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Vui lòng nhập tên nhà cung cấp');
    }

    const supplierExists = await Supplier.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (supplierExists) {
        res.status(400);
        throw new Error('Nhà cung cấp này đã tồn tại');
    }

    const supplier = await Supplier.create({
        name: name.trim(),
        contactName,
        phone,
        email,
        address,
    });

    res.status(201).json({
        success: true,
        data: supplier,
        message: 'Tạo thành công'
    });
});

// @desc    Cập nhật Nhà cung cấp
const updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
        res.status(404);
        throw new Error('Không tìm thấy Nhà cung cấp');
    }

    // Kiểm tra trùng tên khi sửa (trừ chính nó)
    if (req.body.name && req.body.name !== supplier.name) {
        const nameExists = await Supplier.findOne({ name: req.body.name });
        if (nameExists) {
            res.status(400);
            throw new Error('Tên nhà cung cấp đã tồn tại');
        }
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: updatedSupplier,
        message: 'Cập nhật thành công'
    });
});

// @desc    Xóa Nhà cung cấp
const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
        res.status(404);
        throw new Error('Không tìm thấy đối tác');
    }

    // Kiểm tra ràng buộc sản phẩm và giao dịch
    const Product = require('../models/Product');
    const [hasProducts, hasTransactions] = await Promise.all([
        Product.findOne({ supplier: req.params.id }),
        Transaction.findOne({ supplier: req.params.id })
    ]);

    if (hasProducts || hasTransactions) {
        res.status(400);
        throw new Error('Không thể xóa: Nhà cung cấp này đã có dữ liệu sản phẩm hoặc đơn hàng');
    }

    await supplier.deleteOne();
    res.json({ success: true, message: 'Đã xóa nhà cung cấp' });
});

// Giữ lại hàm portal nếu bạn có làm trang riêng cho Supplier
const getSupplierOrders = asyncHandler(async (req, res) => {
    const supplierId = req.user.supplierId; 
    if (!supplierId) {
        res.status(400);
        throw new Error('Tài khoản không liên kết NCC');
    }
    const orders = await Transaction.find({ supplier: supplierId }).populate('product');
    res.json({ success: true, data: orders });
});

module.exports = {
    createSupplier,
    getSuppliers,
    getSupplierOrders,
    updateSupplier,
    deleteSupplier,
};