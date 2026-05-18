const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff'); // Import Model vừa tạo ở trên

// @route   GET /api/staff
// @desc    Lấy toàn bộ danh sách nhân sự thực tế từ MongoDB
// @access  Public (Hoặc bổ sung Middleware xác thực middlewareAuth nếu cần)
router.get('/', async (req, res) => {
  try {
    // Sắp xếp theo thứ tự bản ghi mới tạo sẽ nhảy lên đầu bảng
    const staffList = await Staff.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: staffList.length,
      data: staffList
    });
  } catch (error) {
    console.error('🚨 Lỗi GET /api/staff:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách nhân sự'
    });
  }
});

// @route   POST /api/staff
// @desc    Thêm mới một tài khoản nhân sự vào database
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, role, department, status } = req.body;

    // Kiểm tra xem Email nhân viên này đã tồn tại trong hệ thống chưa
    const staffExists = await Staff.findOne({ email });
    if (staffExists) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ Email này đã được đăng ký trong hệ thống'
      });
    }

    // Tiến hành tạo bản ghi mới
    const newStaff = new Staff({
      name,
      email,
      role,
      department,
      status
    });

    await newStaff.save();

    res.status(201).json({
      success: true,
      message: 'Thêm tài khoản nhân sự thành công!',
      data: newStaff
    });
  } catch (error) {
    console.error('🚨 Lỗi POST /api/staff:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi thêm mới nhân sự'
    });
  }
});

// @route   PUT /api/staff/:id
// @desc    Cập nhật thông tin hoặc trạng thái (ACTIVE/LOCKED) của nhân sự
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role, department, status } = req.body;

    // Tìm và cập nhật dữ liệu dựa trên ID tự động của MongoDB (_id)
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, status },
      { new: true, runValidators: true } // Trả về bản ghi mới sau khi sửa và chạy validate
    );

    if (!updatedStaff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản nhân sự này để cập nhật'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật tài khoản thành công!',
      data: updatedStaff
    });
  } catch (error) {
    console.error('🚨 Lỗi PUT /api/staff:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi cập nhật thông tin nhân sự'
    });
  }
});

module.exports = router;