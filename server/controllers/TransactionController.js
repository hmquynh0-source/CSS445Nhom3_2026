const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * @desc    Tạo một Giao dịch mới (Nếu Nhập: Tạo lệnh PENDING chờ NCC duyệt | Nếu Xuất: Trừ kho trực tiếp)
 * @route   POST /api/transactions
 */
exports.createTransaction = async (req, res) => {
    try {
        const { productId, type, quantity, note, costPrice } = req.body;

        const numQuantity = parseFloat(quantity);
        const numCostPrice = parseFloat(costPrice) || 0;

        // 1. Kiểm tra dữ liệu đầu vào
        if (!productId || !type || isNaN(numQuantity) || numQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ: Sản phẩm, Loại giao dịch và Số lượng.'
            });
        }

        // 2. Tìm sản phẩm và lấy thông tin Nhà cung cấp (Supplier)
        const existingProduct = await Product.findById(productId).populate('supplier');
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
        }

        const oldCostPrice = existingProduct.costPrice || 0;
        const currentStock = existingProduct.stock || existingProduct.stockQuantity || 0;

        // 3. Xử lý logic theo từng loại giao dịch
        if (type === 'in') {
            if (numCostPrice <= 0) {
                return res.status(400).json({ success: false, message: 'Giá vốn nhập kho phải lớn hơn 0.' });
            }
            // 💡 QUAN TRỌNG: Lệnh nhập kho ban đầu tạo ra ở dạng PENDING nên CHƯA được cộng kho Admin ở đây.
            // Việc cộng kho và tính giá vốn trung bình sẽ do hàm `confirmReceipt` (Bước 2) xử lý.
            
        } else if (type === 'out') {
            // Xuất kho thì trừ trực tiếp tại chỗ
            const newStock = currentStock - numQuantity;
            if (newStock < 0) {
                return res.status(400).json({ success: false, message: `Kho không đủ hàng (Hiện có: ${currentStock} kg).` });
            }
            
            // Cập nhật trường tồn kho tương ứng (Hỗ trợ cả 2 cách đặt tên stock hoặc stockQuantity)
            if (existingProduct.stock !== undefined) existingProduct.stock = newStock;
            if (existingProduct.stockQuantity !== undefined) existingProduct.stockQuantity = newStock;
            await existingProduct.save();
        } else {
            return res.status(400).json({ success: false, message: 'Loại giao dịch không hợp lệ.' });
        }

        // 4. Tạo mã đơn yêu cầu format chuẩn chỉnh chuyên nghiệp
        const requestId = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        // 5. Ghi lại giao dịch vào Database
        const transaction = await Transaction.create({
            product: productId,
            productName: existingProduct.name, // Lưu backup tên đề phòng populate lỗi
            supplier: existingProduct.supplier ? existingProduct.supplier._id : null,
            type,
            quantity: numQuantity,
            price: type === 'in' ? numCostPrice : oldCostPrice,
            totalPrice: numQuantity * (type === 'in' ? numCostPrice : oldCostPrice),
            notes: note || (type === 'in' ? 'Yêu cầu nhập kho mới' : 'Xuất kho hệ thống'),
            requestId: requestId, 
            status: type === 'in' ? 'PENDING' : 'COMPLETED', // 'in' phải chờ NCC và Admin duyệt, 'out' xong luôn
            user: req.user ? req.user.name : 'Admin'
        });

        return res.status(201).json({
            success: true,
            message: type === 'in' 
                ? `Yêu cầu nhập hàng ${requestId} đã được gửi tới hệ thống thẩm định của Nhà cung cấp!` 
                : 'Xuất kho thành công và cập nhật số lượng tồn kho tổng.',
            data: transaction
        });

    } catch (error) {
        console.error('Lỗi tại createTransaction:', error);
        return res.status(500).json({
            success: false,
            message: 'Thực hiện giao dịch thất bại.',
            error: error.message
        });
    }
};

/**
 * @desc    Lấy tất cả các Giao dịch (Tự động lọc thông minh theo vai trò User)
 * @route   GET /api/transactions
 */
exports.getTransactions = async (req, res) => {
    try {
        let query = {};
        // Nếu là tài khoản Nhà cung cấp, chỉ cho phép xem đơn hàng gắn với ID của họ
        if (req.user && req.user.role === 'supplier') {
            query.supplier = req.user.supplierId || req.user._id;
        }

        const transactions = await Transaction.find(query)
            .populate({
                path: 'product',
                select: 'name sku unit stock stockQuantity costPrice',
                populate: { path: 'supplier', select: 'name' }
            })
            .sort({ createdAt: -1 })
            .lean();

        // Chuẩn hóa cấu trúc data phẳng (Flatten) để Frontend dễ render lên Table
        const processedData = transactions.map(t => {
            const itemPrice = t.price || 0;
            return {
                ...t,
                productName: t.product ? t.product.name : (t.productName || 'N/A'),
                sku: t.product ? t.product.sku : 'N/A',
                vendor: t.product?.supplier?.name || 'Hệ thống',
                totalValue: t.totalPrice || (t.quantity * itemPrice)
            };
        });

        return res.status(200).json({
            success: true,
            count: processedData.length,
            data: processedData
        });
    } catch (error) {
        console.error('Lỗi tại getTransactions:', error);
        return res.status(500).json({ success: false, message: 'Lỗi tải lịch sử giao dịch: ' + error.message });
    }
};

/**
 * @desc    Báo cáo tổng hợp số lượng mặt hàng và tổng giá trị vốn của kho (Kế toán kho)
 */
exports.getInventoryReport = async (req, res) => {
    try {
        // Tự động kiểm tra xem DB đang dùng trường 'stock' hay 'stockQuantity' để tính toán
        const sampleProduct = await Product.findOne({ stock: { $exists: true } });
        const targetStockField = sampleProduct ? "$stock" : "$stockQuantity";

        const report = await Product.aggregate([
            { 
                $match: { 
                    $or: [
                        { stock: { $gt: 0 } }, 
                        { stockQuantity: { $gt: 0 } }
                    ] 
                } 
            },
            { 
                $addFields: { 
                    inventoryValue: { $multiply: [targetStockField, { $ifNull: ["$costPrice", 0] }] } 
                } 
            },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalInventoryValue: { $sum: "$inventoryValue" }
                }
            },
            { $project: { _id: 0, totalProducts: 1, totalInventoryValue: 1 } }
        ]);

        return res.status(200).json({
            success: true,
            data: report.length > 0 ? report[0] : { totalProducts: 0, totalInventoryValue: 0 }
        });
    } catch (error) {
        console.error('Lỗi tại getInventoryReport:', error);
        return res.status(500).json({ success: false, message: 'Lỗi thống kê báo cáo kho.' });
    }
};