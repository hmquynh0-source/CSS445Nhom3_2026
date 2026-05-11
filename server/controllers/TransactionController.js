const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

/**
 * @desc    Tạo một Giao dịch mới (Nhập/Xuất) và đẩy vào Portal Nhà cung cấp
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

        // 3. Logic xử lý kho và giá vốn
        let newStock;
        let oldCostPrice = existingProduct.costPrice || 0;

        if (type === 'in') {
            if (numCostPrice <= 0) return res.status(400).json({ success: false, message: 'Giá vốn nhập kho phải > 0.' });
            
            newStock = existingProduct.stockQuantity + numQuantity;
            
            // Tính giá vốn trung bình di động
            const oldTotalValue = (existingProduct.stockQuantity || 0) * oldCostPrice;
            const incomingValue = numQuantity * numCostPrice;
            existingProduct.costPrice = (oldTotalValue + incomingValue) / newStock;
            
        } else if (type === 'out') {
            newStock = existingProduct.stockQuantity - numQuantity;
            if (newStock < 0) return res.status(400).json({ success: false, message: `Kho không đủ hàng (Hiện có: ${existingProduct.stockQuantity}).` });
        } else {
            return res.status(400).json({ success: false, message: 'Loại giao dịch không hợp lệ.' });
        }

        // Cập nhật tồn kho sản phẩm
        existingProduct.stockQuantity = newStock;
        await existingProduct.save();

        // 4. Tạo mã đơn yêu cầu (Khớp với giao diện ROASTLOGIC bạn gửi)
        // Định dạng: REQ - Năm hiện tại - Số ngẫu nhiên
        const requestId = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        // 5. Ghi lại giao dịch vào Database
        // Nếu là 'in' (nhập kho), nó sẽ tự động có trạng thái PENDING để NCC phê duyệt
        const transaction = await Transaction.create({
            product: productId,
            supplier: existingProduct.supplier ? existingProduct.supplier._id : null,
            type,
            quantity: numQuantity,
            price: type === 'in' ? numCostPrice : oldCostPrice,
            notes: note || '',
            requestId: requestId, // Mã hiển thị trên Portal
            status: type === 'in' ? 'PENDING' : 'COMPLETED' // 'in' thì chờ duyệt, 'out' thì hoàn thành luôn
        });

        res.status(201).json({
            success: true,
            message: type === 'in' 
                ? `Yêu cầu nhập hàng ${requestId} đã được gửi tới Nhà cung cấp!` 
                : 'Xuất kho thành công.',
            data: transaction
        });

    } catch (error) {
        console.error('Lỗi TransactionController:', error);
        res.status(500).json({
            success: false,
            message: 'Thực hiện giao dịch thất bại.',
            error: error.message
        });
    }
};

/**
 * @desc    Lấy tất cả các Giao dịch (Có lọc theo Nhà cung cấp nếu cần)
 * @route   GET /api/transactions
 */
exports.getTransactions = async (req, res) => {
    try {
        // Nếu là Nhà cung cấp đăng nhập, chỉ hiện giao dịch của họ
        let query = {};
        if (req.user && req.user.role === 'supplier') {
            query.supplier = req.user.supplierId;
        }

        const transactions = await Transaction.find(query)
            .populate({
                path: 'product',
                select: 'name sku unit stockQuantity',
                populate: { path: 'supplier', select: 'name' }
            })
            .sort({ createdAt: -1 })
            .lean();

        const processedData = transactions.map(t => ({
            ...t,
            productName: t.product ? t.product.name : 'N/A',
            sku: t.product ? t.product.sku : 'N/A',
            vendor: t.product?.supplier?.name || 'Hệ thống',
            totalValue: t.quantity * t.price
        }));

        res.status(200).json({
            success: true,
            count: processedData.length,
            data: processedData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi tải lịch sử giao dịch.' });
    }
};

/**
 * @desc    Báo cáo tổng giá trị kho (Aggregration)
 */
exports.getInventoryReport = async (req, res) => {
    try {
        const report = await Product.aggregate([
            { $match: { stockQuantity: { $gt: 0 } } },
            { $addFields: { inventoryValue: { $multiply: ["$stockQuantity", "$costPrice"] } } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalInventoryValue: { $sum: "$inventoryValue" }
                }
            },
            { $project: { _id: 0, totalProducts: 1, totalInventoryValue: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: report.length > 0 ? report[0] : { totalProducts: 0, totalInventoryValue: 0 }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi tạo báo cáo.' });
    }
};