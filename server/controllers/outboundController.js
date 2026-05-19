const Outbound = require('../models/Outbound');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Tạo phiếu xuất kho và trừ tồn kho thực tế
// @route   POST /api/outbounds
exports.createOutbound = async (req, res) => {
    try {
        // Tiếp nhận toàn bộ cấu trúc dữ liệu từ FE đẩy lên
        const { orderCode, customerName, productId, product_id, quantity, totalPrice, shippingAddress } = req.body;

        // Tự động bóc tách ID sản phẩm dù FE truyền kiểu productId hay product_id
        const targetProductId = productId || product_id;

        // 1. Kiểm tra sản phẩm cà phê xem có tồn tại không
        const product = await Product.findById(targetProductId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy loại cà phê này trong hệ thống!" });
        }

        // 2. Kiểm tra lượng tồn kho thực tế (Hỗ trợ cả trường .stock lẫn .stockQuantity của bạn)
        const currentStock = product.stock !== undefined ? product.stock : (product.stockQuantity || 0);
        if (currentStock < quantity) {
            return res.status(400).json({
                success: false, 
                message: `Lỗi bốc dỡ: Số lượng xuất (${quantity} bao) vượt quá lượng tồn thực tế trong kho (${currentStock} bao)!`
            });
        }

        // 3. Sinh mã phiếu xuất tự động
        const outboundCode = `OUT-${Date.now()}`;

        // Tính toán lại giá tiền phòng hờ trường hợp FE truyền thiếu hoặc sai lệch kiểu số
        const finalPrice = totalPrice || (Number(quantity) * (product.price || product.salePrice || 0));

        // 4. Tạo bản ghi phiếu xuất kho mới (Bọc lót map chuẩn hóa với Model Schema)
        const newOutbound = new Outbound({
            outboundCode,
            orderCode: orderCode || null,
            customerName,
            product_id: targetProductId, // Gán trúng trường liên kết ObjectId trong DB của bạn
            quantity: Number(quantity),
            totalPrice: Number(finalPrice),
            shippingAddress: shippingAddress || "Nhận trực tiếp tại nhà máy"
        });

        await newOutbound.save();

        // 5. CẬP NHẬT TỒN KHO: Trừ đồng thời cả 2 trường đề phòng DB dùng tên khác
        if (product.stock !== undefined) product.stock -= Number(quantity);
        if (product.stockQuantity !== undefined) product.stockQuantity -= Number(quantity);
        await product.save();

        // 6. Cập nhật trạng thái đơn hàng gốc từ APPROVED -> EXPORTED nếu tìm thấy
        if (orderCode) {
            await Order.findOneAndUpdate({ orderCode: orderCode }, { status: 'EXPORTED' });
        }

        res.status(201).json({
            success: true,
            message: "XUẤT KHO CÀ PHÊ THÀNH CÔNG!",
            data: newOutbound
        });

    } catch (error) {
        console.error("Lỗi Controller Xuất Kho:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi xử lý xuất kho", error: error.message });
    }
};

// @desc    Lấy danh sách tất cả các phiếu đã xuất kho
// @route   GET /api/outbounds
exports.getOutbounds = async (req, res) => {
    try {
        const outbounds = await Outbound.find().populate('product_id', 'name sku price');
        res.status(200).json({ success: true, data: outbounds });
    } catch (error) {
        res.status(500).json({ success: false, message: "Không thể lấy lịch sử xuất kho", error: error.message });
    }
};