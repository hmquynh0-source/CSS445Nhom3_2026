const SupplierStock = require('../models/SupplierStock');
const mongoose = require('mongoose');

// @desc    Lấy toàn bộ kho thực tế của NCC (Đã sửa: Trả về đầy đủ trường categoryID)
// @route   GET /api/supplier-stocks
exports.getSupplierInventory = async (req, res) => {
    try {
        const supplierId = req.user._id;
        const actualStocks = await SupplierStock.find({ supplier: supplierId });

        const finalInventory = actualStocks.map(stock => ({
            _id: stock._id,
            categoryID: stock.categoryID ? stock.categoryID.toString() : '', 
            name: stock.productName,
            description: stock.description,
            quantity: stock.quantity,
            isKhaiBao: true
        }));

        res.status(200).json({ 
            success: true, 
            count: finalInventory.length,
            data: finalInventory 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Lấy trực tiếp danh sách danh mục gốc từ collection 'categories' trong DB
// @route   GET /api/supplier-stocks/categories
exports.getSystemCategories = async (req, res) => {
    try {
        const db = mongoose.connection.db;
        if (!db) {
            return res.status(500).json({ success: false, message: 'Chưa kết nối được với MongoDB.' });
        }

        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        
        const targetCollectionName = collectionNames.find(name => 
            ['categories', 'category', 'categoriesmodels', 'categorymodels'].includes(name.toLowerCase())
        );

        if (!targetCollectionName) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bảng danh mục trong CSDL hiện tại.' });
        }

        const categories = await db.collection(targetCollectionName).find({}).toArray();
        
        const formattedCategories = categories.map(cat => ({
            _id: cat._id.toString(),
            name: cat.name || cat.itemName || 'Chưa đặt tên'
        })).filter(cat => cat.name !== 'Chưa đặt tên');

        res.status(200).json({ success: true, data: formattedCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi đồng bộ danh mục: ' + error.message });
    }
};

// @desc    Khai báo mới hoặc Cập nhật số lượng tồn kho (Đã chuẩn hóa ObjectId)
// @route   POST /api/supplier-stocks/update
exports.updateOrKhaiBaoStock = async (req, res) => {
    try {
        const { id, categoryID, name, quantity, description } = req.body;
        const supplierId = req.user._id;

        if (!categoryID) {
            return res.status(400).json({ success: false, message: 'Thiếu mã danh mục gốc của loại hạt.' });
        }
const cleanCategoryID = new mongoose.Types.ObjectId(categoryID);
        let stock = null;

        // 1. Chế độ Edit: Tìm bằng ID dòng kho
        if (id && mongoose.Types.ObjectId.isValid(id)) {
            stock = await SupplierStock.findOne({ _id: id, supplier: supplierId });
        } 
        
        // 2. Chế độ Add (hoặc phòng hờ): Tìm trùng lặp bằng categoryID gốc
        if (!stock) {
            stock = await SupplierStock.findOne({ supplier: supplierId, categoryID: cleanCategoryID });
        }

        // 3. Tiến hành Lưu/Cập nhật
        if (stock) {
            stock.quantity = Number(quantity);
            stock.description = description;
            stock.productName = name.trim();
            stock.categoryID = cleanCategoryID; 
            await stock.save();
        } else {
            stock = new SupplierStock({
                supplier: supplierId,
                categoryID: cleanCategoryID, 
                productName: name.trim(),
                quantity: Number(quantity),
                description: description
            });
            await stock.save();
        }

        res.status(200).json({ success: true, message: 'Cập nhật kho thành công!', data: stock });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống backend: ' + error.message });
    }
};

// @desc    Xóa hoàn toàn một dòng sản phẩm khỏi kho cung ứng (FIX LỖI 404)
// @route   DELETE /api/supplier-stocks/:id
exports.deleteSupplierStock = async (req, res) => {
    try {
        const stockId = req.params.id;
        const supplierId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(stockId)) {
            return res.status(400).json({ success: false, message: 'Mã định danh dòng kho không hợp lệ.' });
        }

        const stock = await SupplierStock.findOneAndDelete({ _id: stockId, supplier: supplierId });

        if (!stock) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy dòng sản phẩm để xóa.' });
        }

        res.status(200).json({ success: true, message: `Đã gỡ bỏ hạt "${stock.productName}" thành công!` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống backend: ' + error.message });
    }
};
