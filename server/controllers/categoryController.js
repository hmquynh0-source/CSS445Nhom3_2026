const Category = require('../models/Category');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// =========================================================================
// 🚀 1. CÁC HÀM XỬ LÝ RIÊNG CHO LUỒNG KHO NHÀ CUNG CẤP (SUPPLIER)
// =========================================================================

// @desc    Lấy TẤT CẢ sản phẩm hệ thống + sản phẩm Admin yêu cầu cung ứng
// @route   GET /api/categories/supplier-stock
// @access  Private (Supplier)
exports.getSupplierStock = async (req, res, next) => {
    try {
        const supplierId = req.user._id;

        // 1. Lấy tất cả danh mục hiện có trong hệ thống database
        const allCategories = await Category.find().sort({ name: 1 });

        // 2. Tự động quét và tìm các mặt hàng mà Admin đang gửi đơn yêu cầu nhập kho (PENDING) cho nhà cung cấp này
        // (Sử dụng khối try-catch bọc quanh phòng trường hợp tên Model đơn hàng của bạn cấu hình khác)
        let adminRequiredNames = [];
        try {
            // Kiểm tra xem Model ImportRequest đã được đăng ký trong Mongoose chưa
            const ImportModel = mongoose.models.ImportRequest || mongoose.models.Import;
            if (ImportModel) {
                const pendingRequests = await ImportModel.find({ 
                    supplier: supplierId,
                    status: 'PENDING'
                });
                // Trích xuất các tên hạt độc nhất Admin đang yêu cầu (Blend, Liberica...)
                adminRequiredNames = [...new Set(pendingRequests.map(item => item.productName || item.itemName))].filter(Boolean);
            }
        } catch (e) {
            console.log("Lưu ý: Chưa cấu hình đồng bộ tự động với bảng Đơn Hàng (ImportRequest Model).");
        }

        // 3. Chuyển đổi và map cấu trúc dữ liệu trả về Frontend
        // Lọc ra các bản ghi thực sự thuộc về NCC này
        const myStocks = allCategories.filter(cat => cat.supplier && cat.supplier.toString() === supplierId.toString());
        
        let finalStockList = myStocks.map(cat => ({
            _id: cat._id,
            name: cat.name,
            description: cat.description,
            quantity: cat.quantity,
            isCreatedInDb: true
        }));

        // Đọc danh mục hệ thống chung hoặc từ đơn hàng để bổ sung nếu NCC chưa khai báo
        allCategories.forEach(cat => {
            // Nếu hạt thuộc NCC khác thì NCC hiện tại sẽ nhìn thấy với số lượng = 0 để nhập hàng của mình
            const alreadyInList = finalStockList.some(item => item.name.toLowerCase() === cat.name.toLowerCase());
            if (!alreadyInList) {
                finalStockList.push({
                    _id: `SYS_TEMP_${cat._id}`,
                    name: cat.name,
                    description: cat.description || 'Danh mục có sẵn trên hệ thống.',
                    quantity: 0,
                    isCreatedInDb: false
                });
            }
        });

        // Bổ sung các hạt Admin đang yêu cầu gấp nếu như trong danh sách trên vẫn chưa có
        adminRequiredNames.forEach(name => {
            const alreadyInList = finalStockList.some(item => item.name.toLowerCase() === name.toLowerCase());
            if (!alreadyInList) {
                finalStockList.push({
                    _id: `REQ_TEMP_${Math.random().toString(36).substr(2, 9)}`,
                    name: name,
                    description: `Hàng do Quản trị viên (Admin) yêu cầu cung ứng riêng cho đơn hàng mới.`,
                    quantity: 0,
                    isCreatedInDb: false
                });
            }
        });

        res.status(200).json({
            success: true,
            count: finalStockList.length,
            data: finalStockList
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ khi truy xuất danh mục kho: ' + error.message 
        });
    }
};

// @desc    Nhà cung cấp cập nhật hoặc khai báo kho mới (Đã gộp và sửa lỗi trùng hàm)
// @route   PUT /api/categories/supplier-stock/:id
// @access  Private (Supplier)
exports.updateSupplierStock = async (req, res, next) => {
    try {
        const { name, quantity, description } = req.body;
        const supplierId = req.user._id;
        const categoryId = req.params.id;

        // Kiểm tra xem ID truyền lên là ID thật hay ID tạm thời của Frontend sinh ra
        const isTempId = categoryId.startsWith('SYS_TEMP_') || categoryId.startsWith('REQ_TEMP_');

        if (isTempId) {
            // TRƯỜNG HỢP 1: Mặt hàng chưa khai báo trong kho NCC -> Tiến hành tạo mới bản ghi riêng cho họ
            const newCategory = await Category.create({
                name,
                quantity: Number(quantity) || 0,
                description,
                supplier: supplierId
            });

            return res.status(200).json({
                success: true,
                message: 'Khai báo kho cho mặt hàng mới thành công!',
                data: newCategory
            });
        }

        // TRƯỜNG HỢP 2: Mặt hàng đã tồn tại trong DB, kiểm tra quyền sở hữu trước khi cho sửa
        let category = await Category.findOne({ _id: categoryId, supplier: supplierId });

        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy sản phẩm trong kho của bạn hoặc bạn không có quyền chỉnh sửa mặt hàng này.' 
            });
        }

        // Cập nhật thông tin số lượng mới
        category.name = name;
        category.quantity = Number(quantity);
        category.description = description;
        await category.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật số lượng kho thành công!',
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tên mặt hàng hạt này đã tồn tại trong kho của bạn rồi.' 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};


// =========================================================================
//  2. CÁC HÀM QUẢN LÝ DANH MỤC HỆ THỐNG CHUNG / ADMIN
// =========================================================================

// @desc    Tạo Loại sản phẩm mới (Tự động đính kèm mã NCC)
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
    try {
        const { name, quantity, description } = req.body;

        const category = await Category.create({
            name,
            quantity: Number(quantity) || 0,
            description,
            supplier: req.user._id
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tên loại sản phẩm này đã tồn tại trong kho của bạn.' 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Lấy tất cả Loại sản phẩm hệ thống
// @route   GET /api/categories
// @access  Public/Private 
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find()
            .populate('supplier', 'name email')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories || [] 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh mục.' });
    }
};

// @desc    Cập nhật Loại sản phẩm (Chung)
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