const express = require('express');
const { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    // 🚀 Import thêm 2 hàm xử lý bộ lọc kho cho Nhà cung cấp từ Controller
    getSupplierStock,
    updateSupplierStock
} = require('../controllers/categoryController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Tất cả các route trong file này đều yêu cầu xác thực (protect)

// -------------------------------------------------------------
// 🚀 TÙY CHỌN RIÊNG CHO NHÀ CUNG CẤP (Phải đặt TRÊN tuyến đường /:id)
// -------------------------------------------------------------

// GET: /api/categories/supplier-stock -> Lấy danh sách hạt riêng của NCC đang đăng nhập
router.route('/supplier-stock')
    .get(protect, getSupplierStock);

// PUT: /api/categories/supplier-stock/:id -> NCC tự cập nhật Tên/Số lượng/Mô tả hạt của mình
router.route('/supplier-stock/:id')
    .put(protect, updateSupplierStock);


// -------------------------------------------------------------
//  TUYẾN ĐƯỜNG CHUNG CHO DANH MỤC HỆ THỐNG / ADMIN
// -------------------------------------------------------------

router.route('/')
    .get(protect, getCategories)     // GET /api/categories
    .post(protect, createCategory);  // POST /api/categories

router.route('/:id')
    .put(protect, updateCategory)    // PUT /api/categories/:id
    .delete(protect, deleteCategory); // DELETE /api/categories/:id

module.exports = router;