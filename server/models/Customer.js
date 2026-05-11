const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  type: { 
    type: String, 
    enum: ['Khách lẻ tiềm năng', 'Khách hàng thân thiết', 'Đối tác thu mua'],
    default: 'Khách lẻ tiềm năng' 
  },
  director: String,
  total: { type: String, default: '0đ' },
  lastDate: { type: String, default: 'Vừa xong' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);