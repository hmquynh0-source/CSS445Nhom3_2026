const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Lấy danh sách sản phẩm (Có populate tên chủng loại)
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
    const { keyword, category } = req.query;
    
    let query = {};

    // Tìm kiếm theo tên hoặc SKU
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { sku: { $regex: keyword, $options: 'i' } }
        ];
    }

    // Lọc theo Category ID
    if (category && category !== 'Tất cả Chủng loại') {
        query.category = category;
    }

    // .populate('category', 'name') giúp lấy trường 'name' từ bảng Category gắn vào
    const products = await Product.find(query)
        .populate('category', 'name') 
        .populate('supplier', 'name')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
    const { name, sku, description, costPrice, salePrice, unit, category, supplier, image, stockQuantity } = req.body;

    if (!name || !sku) {
        res.status(400);
        throw new Error("Vui lòng nhập tên và mã SKU.");
    }

    const productExists = await Product.findOne({ sku });
    if (productExists) {
        res.status(400);
        throw new Error("Mã SKU này đã tồn tại.");
    }

    const product = await Product.create({
        name,
        sku,
        description,
        costPrice: Number(costPrice) || 0,
        salePrice: Number(salePrice) || 0,
        unit,
        category: category || null,
        supplier: supplier || null,
        image,
        stockQuantity: Number(stockQuantity) || 0
    });

    res.status(201).json({ success: true, data: product });
});

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Sản phẩm không tồn tại.");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate('category', 'name');

    res.status(200).json({ success: true, data: updatedProduct });
});

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error("Không tìm thấy sản phẩm.");
    }
    await product.deleteOne();
    res.status(200).json({ success: true, message: "Xóa thành công." });
});

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };