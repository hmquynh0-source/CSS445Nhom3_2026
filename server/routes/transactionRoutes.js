const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import Middleware và Model hệ thống
let authMiddleware;
try {
    authMiddleware = require('../middleware/authMiddleware');
} catch (e) {
    authMiddleware = require('../middleware/auth');
}
const protect = authMiddleware?.protect || authMiddleware || ((req, res, next) => next());

const Transaction = require('../models/Transaction'); 
const Product = require('../models/Product'); 
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const SupplierStock = require('../models/SupplierStock'); 
const supplierPageCtrl = require('../controllers/supplierpageController');

// ==========================================
// ĐOẠN 1: CÁC ROUTE TĨNH (ĐẶT TRÊN ĐẦU ĐỂ TRÁNH LỖI 404)
// ==========================================

/**
 * @route   GET /api/inbound/products hoặc /api/transactions/products
 * @desc    Lấy danh sách sản phẩm hiển thị phía kho Admin
 */
router.route('/products').get(protect, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi tải sản phẩm: " + error.message });
    }
});

/**
 * @route   GET /api/transactions/pending
 * @desc    Lấy danh sách các đơn hàng đang chờ duyệt hiển thị lên bảng
 */
router.route('/pending').get(protect, async (req, res) => {
    try {
        const query = { status: 'PENDING' };

        if (req.user && req.user.role === 'supplier') {
            const supplier = await Supplier.findOne({
                $or: [
                    { email: req.user.email },
                    { name: req.user.name }
                ]
            });
            if (supplier) {
                query.supplier = supplier._id;
            }
        }

        const pendingRequests = await Transaction.find(query)
            .populate('product', 'name sku image')
            .populate('supplier', 'name email')
            .sort({ createdAt: -1 });
            
        return res.status(200).json({ success: true, data: pendingRequests });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi tải danh sách chờ duyệt" });
    }
});

router.get('/supplier/dashboard-stats', protect, supplierPageCtrl.getSupplierStats);

router.get('/', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('product', 'name sku')
            .populate('supplier', 'name')
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi lấy lịch sử" });
}
});

// --- CRUD CHO Admin Nhập Kho ---
router.post('/', protect, async (req, res) => {
    try {
        const { requestId, productName, supplierName, quantity, moisture, screenSize, defects } = req.body;
        if (!productName || !supplierName || !quantity) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ: sản phẩm, nhà cung cấp và số lượng." });
        }

        const category = await Category.findOne({ name: { $regex: new RegExp(`^${productName.trim()}$`, 'i') } });
        if (!category) {
            return res.status(404).json({ success: false, message: `Không tìm thấy loại hạt: ${productName}` });
        }

        let supplier = await Supplier.findOne({ name: { $regex: new RegExp(`^${supplierName.trim()}$`, 'i') } });
        if (!supplier) {
            supplier = await Supplier.create({ name: supplierName.trim() });
        }

        const existingId = requestId && await Transaction.findOne({ requestId: requestId.trim() });
        if (existingId) {
            return res.status(409).json({ success: false, message: 'Mã phiếu này đã tồn tại, vui lòng dùng mã khác.' });
        }

        const newTransaction = await Transaction.create({
            type: 'in',
            product: category._id,
            supplier: supplier._id,
            productName: category.name,
            supplierName: supplier.name,
            quantity: Number(quantity),
            price: 0,
            totalPrice: 0,
            status: 'PENDING',
            requestId: requestId?.trim() || `REQ-${Date.now()}`,
            moisture: Number(moisture || 0),
            screen: screenSize || 'Sàng 18',
            defectRate: Number(defects || 0),
            notes: 'Yêu cầu nhập kho mới',
            user: req.user?.name || 'Admin'
        });

        return res.status(201).json({ success: true, message: 'Tạo phiếu nhập kho thành công.', data: newTransaction });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, supplierName, quantity, moisture, screenSize, defects } = req.body;

        let transaction = mongoose.Types.ObjectId.isValid(id)
            ? await Transaction.findById(id)
            : await Transaction.findOne({ requestId: id });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập kho.' });
        }

        if (productName) {
            const category = await Category.findOne({ name: { $regex: new RegExp(`^${productName.trim()}$`, 'i') } });
            if (category) {
                transaction.product = category._id;
                transaction.productName = category.name;
            }
        }

        if (supplierName) {
let supplier = await Supplier.findOne({ name: { $regex: new RegExp(`^${supplierName.trim()}$`, 'i') } });
            if (!supplier) {
                supplier = await Supplier.create({ name: supplierName.trim() });
            }
            transaction.supplier = supplier._id;
            transaction.supplierName = supplier.name;
        }

        if (quantity !== undefined) transaction.quantity = Number(quantity);
        if (moisture !== undefined) transaction.moisture = Number(moisture);
        if (screenSize !== undefined) transaction.screen = screenSize;
        if (defects !== undefined) transaction.defectRate = Number(defects);
        transaction.totalPrice = Number(transaction.quantity) * Number(transaction.price || 0);

        await transaction.save();
        return res.status(200).json({ success: true, message: 'Cập nhật phiếu nhập kho thành công.', data: transaction });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = mongoose.Types.ObjectId.isValid(id)
            ? await Transaction.findById(id)
            : await Transaction.findOne({ requestId: id });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập kho này.' });
        }

        await transaction.remove();
        return res.status(200).json({ success: true, message: 'Đã xóa phiếu nhập kho.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/update-qc/:lotId', protect, async (req, res) => {
    try {
        const { moisture, screen, defectRate } = req.body;
        const { lotId } = req.params;

        const transaction = mongoose.Types.ObjectId.isValid(lotId)
            ? await Transaction.findById(lotId)
            : await Transaction.findOne({ requestId: lotId });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập kho này.' });
        }

        transaction.moisture = Number(moisture || transaction.moisture);
        transaction.screen = screen || transaction.screen;
        transaction.defectRate = Number(defectRate || transaction.defectRate);
        await transaction.save();

        return res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});


// ==========================================
// ĐOẠN 2: THAO TÁC XỬ LÝ QUY TRÌNH 2 BƯỚC KHÉP KÍN
// ==========================================

/**
 * @route   POST /api/transactions/import
 * @desc    Tạo đơn nhập kho ban đầu (Trạng thái mặc định: PENDING)
 */
router.post('/import', protect, async (req, res) => {
    try {
        const { productId, supplierId, quantity, price, warehouseId, note } = req.body;
        if (!productId || !supplierId || !quantity || !price) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đủ thông tin đơn." });
        }

        const uniqueId = `REQ-IM-${Date.now()}`;
        const newTransaction = new Transaction({
            type: 'in', 
            product: productId,
            supplier: supplierId,
            warehouse: mongoose.Types.ObjectId.isValid(warehouseId) ? warehouseId : null,
            quantity: Number(quantity),
            price: Number(price), 
            totalPrice: Number(price) * Number(quantity),
            status: 'PENDING', 
            requestId: uniqueId,
            notes: note || "Yêu cầu nhập kho mới",
            user: req.user ? req.user.name : 'Admin'
        });

        await newTransaction.save();
        return res.status(201).json({ success: true, message: "Tạo đơn thành công!", data: newTransaction });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * BƯỚC 1: NCC DUYỆT ĐƠN -> CHỈ TRỪ KHO NHÀ CUNG CẤP (Chưa tăng kho Admin)
 */
const supplierApproveHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const transactionQuery = mongoose.Types.ObjectId.isValid(id)
            ? { _id: id }
            : { requestId: id };

        if (req.user && req.user.role === 'supplier') {
            const supplier = await Supplier.findOne({
                $or: [
                    { email: req.user.email },
                    { name: req.user.name }
                ]
            });
            if (supplier) {
                transactionQuery.supplier = supplier._id;
            }
        }

        const transaction = await Transaction.findOne(transactionQuery).populate('product');
        
        if (!transaction) return res.status(404).json({ success: false, message: "Không thấy đơn hàng." });
        if (transaction.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: "Đơn hàng này đã được xử lý từ trước." });
        }

        const targetProductName = transaction.productName || (transaction.product ? transaction.product.name : "Blend");

        // Ưu tiên khớp theo categoryID nếu có, rồi fallback về productName
        let supplierInventory = null;
        if (transaction.product) {
            const categoryId = transaction.product._id ? transaction.product._id : transaction.product;
            supplierInventory = await SupplierStock.findOne({
                supplier: transaction.supplier,
                categoryID: categoryId
            });
        }

        if (!supplierInventory) {
supplierInventory = await SupplierStock.findOne({ 
                supplier: transaction.supplier, 
                productName: { $regex: new RegExp(`^${targetProductName.trim()}$`, 'i') }
            });
        }

        if (!supplierInventory) {
            return res.status(404).json({ success: false, message: `NCC chưa có loại hạt "${targetProductName}" trong danh mục kho.` });
        }
        if (supplierInventory.quantity < transaction.quantity) {
            return res.status(400).json({ success: false, message: `Kho NCC không đủ! Còn: ${supplierInventory.quantity} KG.` });
        }

        // Cập nhật đơn sang APPROVED (Chờ nhân sự xác nhận nhận hàng thực tế)
        transaction.status = 'APPROVED';
        await transaction.save();

        // Khấu trừ khối lượng sẵn có của Nhà cung cấp
        supplierInventory.quantity -= Number(transaction.quantity);
        await supplierInventory.save();

        return res.status(200).json({ 
            success: true, 
            message: `Nhà cung cấp phê duyệt thành công! Kho NCC đã trừ ${transaction.quantity} KG. Đơn chờ Nhân sự xác nhận nhập kho thực tế.`,
            data: transaction 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Đăng ký toàn bộ đầu cổng bắt sự kiện Duyệt đơn Bước 1 của NCC
router.all('/:id/approve', protect, supplierApproveHandler);
router.all('/approve/:id', protect, supplierApproveHandler);


/**
 * BƯỚC 2 (TÍNH NĂNG THEO YÊU CẦU): NHÂN SỰ XÁC NHẬN NHẬP KHO -> CHÍNH THỨC CỘNG KHÔ ADMIN
 * @route   PUT /api/transactions/:id/confirm-receipt hoặc /api/inbound/confirm-receipt/:id
 */
const adminConfirmReceiptHandler = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`👷 Nhân sự đang thực hiện xác nhận nhập kho thực tế cho đơn: ${id}`);

        let transaction = mongoose.Types.ObjectId.isValid(id)
            ? await Transaction.findById(id).populate('product')
            : await Transaction.findOne({ requestId: id }).populate('product');

        if (!transaction) return res.status(404).json({ success: false, message: "Không tìm thấy thông tin đơn hàng này." });
        
        if (transaction.status === 'COMPLETED') {
            return res.status(400).json({ success: false, message: "Phiếu nhập kho này đã hoàn tất nhập hàng từ trước, không thể cộng dồn tiếp!" });
        }
        if (transaction.status !== 'APPROVED') {
            return res.status(400).json({ success: false, message: "Đơn hàng này chưa được phía Nhà cung cấp ký duyệt xuất kho!" });
        }

        let targetProductName = transaction.productName || (transaction.product ? transaction.product.name : "Blend");
// 1. Chuyển trạng thái đơn hàng sang trạng thái cuối cùng: COMPLETED (Đã nhập kho)
        transaction.status = 'COMPLETED';
        if (req.user) transaction.user = req.user.name; // Ghi nhận tên nhân sự bấm máy nếu có auth
        await transaction.save();

        // 2. CHÍNH THỨC CỘNG KHỐI LƯỢNG VÀO KHO TỔNG CỦA ADMIN (Bảng Category nguyên liệu thô)
        if (transaction.product) {
            await Category.findByIdAndUpdate(transaction.product, {
                $inc: { quantity: transaction.quantity }
            });
        } else {
            await Category.findOneAndUpdate(
                { name: { $regex: new RegExp(`^${targetProductName.trim()}$`, 'i') } },
                { $inc: { quantity: transaction.quantity } }
            );
        }

        return res.status(200).json({
            success: true,
            message: `Xác nhận nhập kho hoàn tất! Hệ thống đã chính thức cộng tăng ${transaction.quantity} KG vào kho hạt ${targetProductName} của Admin.`,
            data: transaction
        });
    } catch (error) {
        console.error("Lỗi xác nhận nhập kho:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi xác nhận nhập kho: " + error.message });
    }
};

// Đăng ký các cổng lắng nghe nút bấm xác nhận từ Nhân sự Admin
router.route('/:id/confirm-receipt').put(protect, adminConfirmReceiptHandler).post(protect, adminConfirmReceiptHandler);
router.route('/confirm-receipt/:id').put(protect, adminConfirmReceiptHandler).post(protect, adminConfirmReceiptHandler);


// ==========================================
// ĐOẠN 3: TUYẾN ĐƯỜNG ĐỘNG (BẮT BUỘC ĐẶT CUỐI CÙNG)
// ==========================================
router.route('/:requestId').get(protect, async (req, res) => {
    try {
        const { requestId } = req.params;
        if (requestId === 'pending') {
            const pendingRequests = await Transaction.find({ status: 'PENDING' }).populate('product').populate('supplier').sort({ createdAt: -1 });
            return res.status(200).json({ success: true, data: pendingRequests });
        }

        let transaction = mongoose.Types.ObjectId.isValid(requestId)
            ? await Transaction.findById(requestId).populate('product').populate('supplier')
            : await Transaction.findOne({ requestId: requestId }).populate('product').populate('supplier');

        if (!transaction) return res.status(404).json({ success: false, message: "Không tìm thấy lệnh giao hàng." });
        return res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
