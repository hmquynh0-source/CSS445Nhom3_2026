const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category'); // Import để hỗ trợ lọc theo tên chủng loại

// @desc    Lấy danh sách sản phẩm (Hỗ trợ tìm kiếm, lọc theo ID hoặc Tên chủng loại)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { keyword, category, categoryName } = req.query;
    
    let query = {};

    // 1. Tìm kiếm theo tên hoặc SKU (không phân biệt hoa thường)
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { sku: { $regex: keyword, $options: 'i' } }
        ];
    }

    // 2. Lọc theo ID chủng loại (Dùng cho trang quản lý chung)
    if (category && category !== 'Tất cả Chủng loại') {
        query.category = category;
    }

    // 3. Lọc theo Tên chủng loại (Dùng cho trang Nhập kho - InboundPage)
    if (categoryName) {
        // Tìm ID của category có tên tương ứng trước
        const foundCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
        });
        
        if (foundCategory) {
            query.category = foundCategory._id;
        } else {
            // Nếu không tìm thấy category tên đó, trả về mảng rỗng để an toàn
            return res.status(200).json({ success: true, count: 0, data: [] });
        }
    }

    const products = await Product.find(query)
        .populate('category', 'name') // Lấy thông tin tên chủng loại
        .populate('supplier', 'name') // Lấy thông tin tên nhà cung cấp
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

    // Kiểm tra dữ liệu đầu vào
    if (!name || !sku || !unit) {
        res.status(400);
        throw new Error("Thiếu thông tin bắt buộc: Tên, SKU, Đơn vị tính.");
    }

    // Kiểm tra SKU trùng lặp
    const productExists = await Product.findOne({ sku });
    if (productExists) {
        res.status(400);
        throw new Error("Mã SKU này đã tồn tại trong hệ thống.");
    }

    // Xử lý các ID nếu là chuỗi rỗng
    const cleanCategory = (category && category !== "") ? category : null;
    const cleanSupplier = (supplier && supplier !== "") ? supplier : null;

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
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Sản phẩm không tồn tại.");
    }

    // Xử lý ID an toàn
    if (req.body.category === "") req.body.category = null;
    if (req.body.supplier === "") req.body.supplier = null;

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
        throw new Error("Không tìm thấy sản phẩm.");
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Xóa sản phẩm thành công."
    });
});

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};