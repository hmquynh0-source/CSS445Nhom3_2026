const express = require('express');
const router = express.Router();
const { 
    getSupplierInventory, 
    getSystemCategories, 
    updateOrKhaiBaoStock,
    deleteSupplierStock 
} = require('../controllers/supplierStockController');

const { protect } = require('../middleware/authMiddleware'); // Đảm bảo có middleware check token đăng nhập của bạn

router.get('/', protect, getSupplierInventory);
router.get('/categories', protect, getSystemCategories);
router.post('/update', protect, updateOrKhaiBaoStock);
router.delete('/:id', protect, deleteSupplierStock); // 🚀 KHAI BÁO TUYẾN ĐƯỜNG XÓA (:id)

module.exports = router;