// server/controllers/categoryController.js

const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Tạo Loại sản phẩm mới
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tên loại sản phẩm đã tồn tại.' 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Lấy tất cả Loại sản phẩm
// @route   GET /api/categories
// @access  Public/Private 
exports.getCategories = async (req, res, next) => {
    try {
        // Sắp xếp theo tên A-Z
        const categories = await Category.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            // Đảm bảo trả về mảng rỗng nếu không có data để tránh crash Frontend
            data: categories || [] 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh mục.' });
    }
};

// @desc    Cập nhật Loại sản phẩm
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
    try {
        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy loại sản phẩm.' });
        }

        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true 
        });

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tên loại sản phẩm này đã được sử dụng.' 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Xóa Loại sản phẩm
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy loại sản phẩm.' });
        }
        
        // KIỂM TRA RÀNG BUỘC: Không cho xóa nếu danh mục này đang chứa sản phẩm
        const relatedProductsCount = await Product.countDocuments({ category: req.params.id });
        if (relatedProductsCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Lỗi: Có ${relatedProductsCount} sản phẩm đang thuộc loại này. Không thể xóa.` 
            });
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Đã xóa loại sản phẩm thành công',
            data: {}
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa.' });
    }
};