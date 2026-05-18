const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); // Model Category thật của bạn

// Đường dẫn này kết hợp với tiền tố ở server.js sẽ thành: /api/supplier/products
router.get('/products', async (req, res) => {
  try {
    const products = await Category.find().sort({ name: 1 });
    // Trả về đúng cấu trúc JSON để Frontend đọc được
    res.json({ success: true, data: products }); 
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Đường dẫn cập nhật tồn kho: /api/supplier/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    let status = 'SẴN SÀNG';
    if (Number(quantity) <= 0) status = 'HẾT HÀNG';
    else if (Number(quantity) < 100) status = 'DƯỚI ĐỊNH MỨC';

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id, 
      { quantity: Number(quantity), status: status }, 
      { new: true }
    );
    res.json({ success: true, data: updatedCategory });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;