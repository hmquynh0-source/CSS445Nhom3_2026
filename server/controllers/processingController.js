const Category = require('../models/Category');
const Product = require('../models/Product');
const ProcessingHistory = require('../models/ProcessingHistory'); // Model lịch sử của bạn

exports.executeProcessing = async (req, res) => {
    try {
        const { source, target, weight, expectedLoss, temperature, processingTime, gasPressure } = req.body;

        // 1. Kiểm tra và trừ số lượng hạt thô trong Kho Danh Mục (Categories)
        const categoryDoc = await Category.findOne({ name: source });
        if (!categoryDoc) {
            return res.status(404).json({ success: false, message: `Không tìm thấy loại hạt thô: ${source}` });
        }
        
        // Giả sử trường lưu số lượng trong categories của bạn tên là stock hoặc quantity (bạn đổi lại cho đúng tên trường trong DB)
        const inputWeight = parseFloat(weight);
        if (categoryDoc.stock && categoryDoc.stock < inputWeight) {
            return res.status(400).json({ success: false, message: `Số lượng hạt thô trong kho không đủ! (Hiện còn: ${categoryDoc.stock} kg)` });
        }
        
        if (categoryDoc.stock) {
            categoryDoc.stock -= inputWeight; // Trừ kho nguyên liệu thô
            await categoryDoc.save();
        }

        // 2. Tính toán khối lượng thành phẩm thực tế sau hao hụt
        const lossPercent = parseFloat(expectedLoss) || 0;
        const outputWeight = (inputWeight * (1 - lossPercent / 100)).toFixed(1);

        // 3. Tìm sản phẩm đích trong collection products và cộng kho thành phẩm
        const productDoc = await Product.findOne({ name: target });
        if (!productDoc) {
            return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm đích: ${target}` });
        }

        // Cộng dồn vào kho thành phẩm (Đổi trường 'stock' thành tên trường số lượng thực tế trong DB của bạn)
        if (productDoc.stock !== undefined) {
            productDoc.stock += parseFloat(outputWeight);
        } else {
            productDoc.stock = parseFloat(outputWeight);
        }
        await productDoc.save();

        // 4. Tạo mã mẻ rang tự động ngẫu nhiên
        const batchId = `BATCH-${Math.floor(10000 + Math.random() * 90000)}`;

        // 5. Lưu vào nhật ký / lịch sử chế biến trong MongoDB
        const newHistoryItem = new ProcessingHistory({
            batchId,
            source,
            target,
            weightInfo: `${inputWeight}kg → Nhập kho ${outputWeight}kg`,
            lossInfo: `${lossPercent}% Hao hụt`,
            status: 'HOÀN TẤT VÀO KHO',
            tag: 'ĐÃ ĐỒNG BỘ KHO',
            tagColor: '#4F7942',
            temperature,
            processingTime,
            gasPressure,
            createdAt: new Date()
        });

        await newHistoryItem.save();

        res.status(200).json({
            success: true,
            message: "Xử lý chế biến thành công, đã tự động trừ kho nguyên liệu và cộng kho thành phẩm!",
            data: newHistoryItem
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};