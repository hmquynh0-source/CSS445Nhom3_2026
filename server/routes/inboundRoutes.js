const express = require('express');
const router = express.Router();
const InboundProduct = require('../models/InboundProduct'); // Đảm bảo đường dẫn tới Model đúng

// 1. Lấy danh sách lịch sử nhập kho thực tế
router.get('/products', async (req, res) => {
    try {
        // ĐÃ SỬA: Thêm .populate() để tự động lôi trường 'name' từ bảng categories sang React
        // Thử populate cả productId và categoryId để chắc chắn dính một trong hai cấu hình Model của bạn
        const history = await InboundProduct.find()
            .populate('productId', 'name')
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 });
            
        res.json({ data: history }); 
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

// 2. API: Cập nhật thông số QC của lô hàng (Phục vụ nút Chỉnh sửa QC)
router.put('/update-qc/:lotId', async (req, res) => {
    try {
        const { moisture, screen, defectRate } = req.body;
        
        // Tìm lô hàng dựa theo batchCode (mã LOT) và cập nhật thông số mới
        const updatedLot = await InboundProduct.findOneAndUpdate(
            { batchCode: req.params.lotId },
            { 
                moisture: Number(moisture), 
                screen: screen, 
                defectRate: Number(defectRate),
                status: "QC PASSED" // Chuyển trạng thái sang Đạt chuẩn kiểm định
            },
            { new: true } // Trả về data sau khi cập nhật thành công
        );

        if (!updatedLot) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lô hàng này" });
        }

        res.json({ success: true, data: updatedLot });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Backend: " + error.message });
    }
});

// 3. API: Truy xuất nguồn gốc hành trình lô hàng (Phục vụ nút Truy xuất)
router.get('/trace/:lotId', async (req, res) => {
    try {
        // ĐÃ SỬA: Truy xuất nguồn gốc cũng cần nhúng tên loại hạt từ bảng categories vào cho chuẩn
        const lot = await InboundProduct.findOne({ batchCode: req.params.lotId })
            .populate('productId', 'name')
            .populate('categoryId', 'name');
        
        if (!lot) {
            return res.status(404).json({ success: false, message: "Mã lô không tồn tại" });
        }
        
        // Lấy tên loại hạt cụ thể sau khi đã populate thành công
        const specificProductName = lot.productId?.name || lot.categoryId?.name || lot.productName || "Cà phê nhân thô";
        
        res.json({ 
            success: true, 
            traceData: {
                batchCode: lot.batchCode,
                productName: specificProductName, // Trả về tên hạt cụ thể (Blend, Arabica...)
                weight: lot.weight,
                supplierName: lot.supplier || "Nhà Cung Cấp Đối Tác",
                importDate: lot.importDate || lot.createdAt,
                qcStatus: lot.status || "QC PASSED"
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống: " + error.message });
    }
});

module.exports = router;