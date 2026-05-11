const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require('../controllers/supplierController');

// GET: Công khai (để dropdown luôn có dữ liệu)
// POST: Bảo vệ (chỉ admin mới được thêm)
router.route('/')
    .get(getSuppliers) 
    .post(protect, createSupplier);

router.route('/:id')
    .put(protect, updateSupplier)
    .delete(protect, deleteSupplier);

module.exports = router;