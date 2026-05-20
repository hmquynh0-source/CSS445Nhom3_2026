const express = require('express');
const router = express.Router();
const ProcessingHistory = require('../models/ProcessingHistory');
const processingController = require('../controllers/processingController');
let authMiddleware;
try {
    authMiddleware = require('../middleware/authMiddleware');
} catch (e) {
    authMiddleware = require('../middleware/auth');
}
const protect = authMiddleware?.protect || authMiddleware || ((req, res, next) => next());

router.get('/history', protect, async (req, res) => {
    try {
        const history = await ProcessingHistory.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: history });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi tải lịch sử chế biến: ' + error.message });
    }
});

router.post('/execute', protect, processingController.executeProcessing);

module.exports = router;