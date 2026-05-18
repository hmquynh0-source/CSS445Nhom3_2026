const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Họ và tên nhân sự không được để trống'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email không được để trống'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập đúng định dạng Email']
  },
  role: {
    type: String,
    required: [true, 'Vai trò không được để trống'],
    enum: ['Warehouse Manager', 'Logistics Coordinator', 'QC Inspector', 'Admin'],
    default: 'Warehouse Manager'
  },
  department: {
    type: String,
    required: [true, 'Bộ phận không được để trống'],
    enum: ['Vận hành', 'Chuỗi cung ứng', 'Kiểm soát chất lượng', 'Tổng bộ'],
    default: 'Vận hành'
  },
  joinDate: {
    type: String,
    default: () => {
      // Tự động sinh ngày định dạng DD/MM/YYYY theo giờ Việt Nam khi tạo mới
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'PENDING', 'LOCKED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true // Tự động thêm trường createdAt và updatedAt vào cơ sở dữ liệu
});

module.exports = mongoose.model('Staff', StaffSchema);