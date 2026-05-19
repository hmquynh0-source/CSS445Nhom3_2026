const express = require('express');
const router = express.Router();
const { createOutbound, getOutbounds } = require('../controllers/outboundController');

// Tuyến đường POST tạo đơn xuất kho: /api/outbounds
router.post('/', createOutbound);

// Tuyến đường GET lấy danh sách xuất kho: /api/outbounds
router.get('/', getOutbounds);

module.exports = router;