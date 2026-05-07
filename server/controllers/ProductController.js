const asyncHandler = require('express-async-handler');
const Product = require('../models/Product'); // Đảm bảo đường dẫn model đúng

// @desc    Lấy danh sách sản phẩm (Có hỗ trợ tìm kiếm và lọc)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { keyword, category } = req.query;
    
    let query = {};

    // Logic tìm kiếm theo tên hoặc SKU
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { sku: { $regex: keyword, $options: 'i' } }
        ];
    }

    // Logic lọc theo Category (nếu có truyền ID)
    if (category && category !== 'Tất cả Chủng loại') {
        query.category = category;
    }

    const products = await Product.find(query)
        .populate('category', 'name') // Lấy thêm tên chủng loại
        .populate('supplier', 'name') // Lấy thêm tên nhà cung cấp
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Public
const createProduct = asyncHandler(async (req, res) => {
    const { name, sku, costPrice, salePrice, unit, category, supplier, image, stockQuantity } = req.body;

    // 1. Kiểm tra các trường bắt buộc ở mức ứng dụng
    if (!name || !sku || !unit) {
        res.status(400);
        throw new Error("Vui lòng nhập đầy đủ các trường bắt buộc: Tên, Mã SKU, Đơn vị tính.");
    }

    // 2. Xử lý ID an toàn: Tránh lỗi Cast to ObjectId nếu gửi chuỗi rỗng
    const cleanCategory = (category && category !== "" && category !== "undefined") ? category : null;
    const cleanSupplier = (supplier && supplier !== "" && supplier !== "undefined") ? supplier : null;

    // 3. Tạo sản phẩm
    const product = await Product.create({
        name,
        sku,
        costPrice: Number(costPrice) || 0,
        salePrice: Number(salePrice) || 0,
        unit,
        category: cleanCategory,
        supplier: cleanSupplier,
        image,
        stockQuantity: Number(stockQuantity) || 0
    });

    res.status(201).json({
        success: true,
        data: product
    });
});

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = asyncHandler(async (req, res) => {
    // Kiểm tra ID từ URL có hợp lệ không trước khi truy vấn
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Không tìm thấy sản phẩm để cập nhật.");
    }

    // Xử lý ID an toàn cho Category và Supplier
    if (req.body.category === "" || req.body.category === "undefined") req.body.category = null;
    if (req.body.supplier === "" || req.body.supplier === "undefined") req.body.supplier = null;

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    ).populate('category supplier');

    res.status(200).json({
        success: true,
        data: updatedProduct
    });
});

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Sản phẩm không tồn tại.");
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Đã xóa sản phẩm thành công."
    });
});

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};