// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Để mã hóa mật khẩu

const UserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên người dùng là bắt buộc'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Vui lòng nhập địa chỉ email hợp lệ'
            ]
        },
        password: {
            type: String,
            required: [true, 'Mật khẩu là bắt buộc'],
            minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
            select: false, // Không trả về trường password khi query
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'staff', 'supplier', 'customer'], // Phân quyền
            default: 'staff',
        }
    },
    {
        timestamps: true,
    }
);

// Middleware Pre-save: Mã hóa mật khẩu trước khi lưu vào CSDL
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    // Tạo salt và mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức để so sánh mật khẩu
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // So sánh mật khẩu người dùng nhập vào (đã mã hóa) với mật khẩu trong CSDL
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;