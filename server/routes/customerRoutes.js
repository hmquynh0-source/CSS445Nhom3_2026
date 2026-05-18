const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

// 1. Tuyến đường cho URL gốc (POST để thêm, GET để lấy danh sách)
// URL: http://localhost:5000/api/customers
router.post('/', protect, customerController.createCustomer);
router.get('/', protect, customerController.getCustomers);

// 2. 🚀 TUYẾN ĐƯỜNG CHỈNH SỬA (PUT) - Tách riêng ra cho chắc chắn
// URL: http://localhost:5000/api/customers/:id
// LƯU Ý: Chỉ viết là '/:id', KHÔNG ĐƯỢC VIẾT '/api/customers/:id'
router.put('/:id', protect, customerController.updateCustomer);

module.exports = router;