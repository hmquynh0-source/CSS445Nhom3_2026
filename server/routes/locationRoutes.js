const express = require('express');
const router = express.Router();

// Lấy dữ liệu tỉnh/huyện/xã (proxy tới open-api để tránh CORS trên client)
router.get('/provinces', async (req, res) => {
    try {
        const response = await fetch('https://provinces.open-api.vn/api/?depth=3');
        if (!response.ok) return res.status(502).json({ success: false, message: 'Lỗi khi lấy danh sách tỉnh' });
        const data = await response.json();
        return res.json({ success: true, data });
    } catch (err) {
        console.error('Location proxy error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;