const Transaction = require('../models/Transaction'); 
const Product = require('../models/Product'); // Model chứa danh sách hạt nhân xanh của bạn

// Lấy thông số thực tế cho Supplier Dashboard
exports.getSupplierStats = async (req, res) => {
    try {
        // 1. TÍNH TỔNG TỒN KHO THẬT: Lấy toàn bộ các dòng hạt nhân xanh trong hệ thống
        const greenBeans = await Product.find({}); 
        
        // ĐỒNG BỘ: Chuyển đổi tính toán dựa trên trường 'stock' thực tế đang lưu hành trong DB
        const totalStock = greenBeans.reduce((sum, bean) => {
            return sum + (Number(bean.stock) || 0); 
        }, 0);

        // 2. Số đơn hệ thống đang vận chuyển (Trạng thái APPROVED và thuộc nhóm Nhập kho 'in')
        const shippingCount = await Transaction.countDocuments({ 
            status: 'APPROVED',
            type: 'in' 
        });

        // 3. Tổng số đơn đã HOÀN TẤT nhập kho thành công (COMPLETED) tính từ đầu tháng hiện tại
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const completedCount = await Transaction.countDocuments({
            status: 'COMPLETED',
            type: 'in',
            createdAt: { $gte: startOfMonth }
        });

        // Trả về cấu trúc dữ liệu hoàn chỉnh cho Frontend (SupplierDashboard.jsx) nhận diện
        res.status(200).json({
            success: true,
            data: {
                totalStock,       // Trả về số tổng khối lượng chuẩn (Ví dụ: 2701)
                shippingCount,    // Số đơn đang đi đường
                completedCount    // Số đơn hoàn thành trong tháng
            }
        });
    } catch (error) {
        console.error("🚨 Lỗi xảy ra tại getSupplierStats Controller:", error.message);
        res.status(500).json({ success: false, message: "Lỗi xử lý dữ liệu thống kê: " + error.message });
    }
};