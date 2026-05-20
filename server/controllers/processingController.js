const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ProcessingHistory = require('../models/ProcessingHistory'); // Model lịch sử của bạn

exports.executeProcessing = async (req, res) => {
    try {
        const { source, target, weight, expectedLoss, temperature, processingTime, gasPressure } = req.body;

        // 1. Kiểm tra và trừ số lượng hạt thô trong Kho Danh Mục (Categories)
        let categoryDoc = null;
        const sourceValue = source?.toString().trim();
        if (sourceValue && mongoose.Types.ObjectId.isValid(sourceValue)) {
            categoryDoc = await Category.findById(sourceValue);
        }
        if (!categoryDoc) {
            categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${sourceValue}$`, 'i') } });
        }
        if (!categoryDoc) {
            return res.status(404).json({ success: false, message: `Không tìm thấy loại hạt thô: ${source}` });
        }
        
        const inputWeight = parseFloat(weight);
        const availableQty = categoryDoc.quantity || categoryDoc.stock || 0;
        if (availableQty < inputWeight) {
            return res.status(400).json({ success: false, message: `Số lượng hạt thô trong kho không đủ! (Hiện còn: ${availableQty} kg)` });
        }
        
        if (categoryDoc.quantity !== undefined) {
            categoryDoc.quantity -= inputWeight; // Trừ kho nguyên liệu thô
        } else if (categoryDoc.stock !== undefined) {
            categoryDoc.stock -= inputWeight;
        }

        try {
            await categoryDoc.save();
        } catch (saveError) {
            if (saveError.name === 'ValidationError' && saveError.errors?.supplier) {
                const updateFields = {};
                if (categoryDoc.quantity !== undefined) updateFields.quantity = categoryDoc.quantity;
                if (categoryDoc.stock !== undefined) updateFields.stock = categoryDoc.stock;

                if (Object.keys(updateFields).length > 0) {
                    await Category.findByIdAndUpdate(categoryDoc._id, { $set: updateFields }, { runValidators: false });
                }
            } else {
                throw saveError;
            }
        }

        // 2. Tính toán khối lượng thành phẩm thực tế sau hao hụt
        const lossPercent = parseFloat(expectedLoss) || 0;
        const outputWeight = parseFloat((inputWeight * (1 - lossPercent / 100)).toFixed(1));

        // 3. Tìm sản phẩm đích trong collection products và cộng kho thành phẩm
        let productDoc = null;
        const targetValue = target?.toString().trim();
        if (targetValue && mongoose.Types.ObjectId.isValid(targetValue)) {
            productDoc = await Product.findById(targetValue);
        }
        if (!productDoc) {
productDoc = await Product.findOne({ name: { $regex: new RegExp(`^${targetValue}$`, 'i') } });
        }
        if (!productDoc) {
            return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm đích: ${target}` });
        }

        if (productDoc.stockQuantity !== undefined) {
            productDoc.stockQuantity += outputWeight;
        }
        if (productDoc.stock !== undefined) {
            productDoc.stock += outputWeight;
        }
        if (productDoc.stockQuantity === undefined && productDoc.stock === undefined) {
            productDoc.stockQuantity = outputWeight;
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
