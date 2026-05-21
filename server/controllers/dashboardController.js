const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

exports.getDynamicReport = async (req, res) => {
    try {
        const { range } = req.query; // day, month, year (nếu có dùng bộ lọc)

        // 1. Tính tổng sản lượng thực tế trong kho (Cộng tất cả các sản phẩm)
        const products = await Product.find();
        const totalWeight = products.reduce((sum, p) => sum + Number(p.stock || p.stockQuantity || 0), 0);

        // Giả lập các chỉ số KPI khác (Bạn có thể thay bằng logic đếm thực tế tùy ý)
        const revenue = "$12,450"; 
        const opCost = "$3,120";
        const compRate = "94%";

        // 2. Gom cụm tính toán cơ cấu tồn kho theo LOẠI HẠT (Category)
        const inventoryBreakdown = await Product.aggregate([
            {
                $lookup: {
                    from: "categories",       // Tên collection danh mục loại hạt trong MongoDB Compass
                    localField: "categoryId", // Tên trường liên kết danh mục nằm trong Schema Product
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            // Giải phẳng mảng liên kết vừa lookup được
            { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
            // Tiến hành gom nhóm theo TÊN LOẠI HẠT
            {
                $group: {
                    _id: "$categoryInfo.name", 
                    quantity: { $sum: { $ifNull: ["$stockQuantity", "$stock"] } } // Tính tổng khối lượng tồn kho
                }
            },
            // Định dạng lại cấu trúc trả về giống với Frontend mong đợi
            {
                $project: {
                    _id: 0,
                    name: { $ifNull: ["$_id", "Hạt chưa phân loại"] },
                    quantity: 1
                }
            },
            // Sắp xếp loại hạt có khối lượng từ cao xuống thấp
            { $sort: { quantity: -1 } }
        ]);

        // Trả về đúng cấu trúc chuẩn cho Frontend gán trực tiếp vào State
        res.status(200).json({
            success: true,
            kpis: {
                revenue,
                inventory: `${totalWeight.toLocaleString('vi-VN')} kg`, // Sẽ hiển thị đúng số thực tế, ví dụ: 1.869 kg
                opCost,
                compRate
            },
            chartData: [40, 52, 64, 76, 88, 150, 112, 124], // Giữ nguyên mảng biểu đồ cột doanh thu
            chartLabels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"],
            inventoryBreakdown, // Cấu trúc mảng cơ cấu loại hạt mới tinh
            originAnalysis: [
                { origin: "Lâm Đồng", weight: 1200, batches: 5, avgMoisture: 12.5 },
                { origin: "Đắk Lắk", weight: 669, batches: 3, avgMoisture: 11.8 }
            ]
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};