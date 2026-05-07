// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * @desc    Tạo JWT (JSON Web Token)
 * @param   {string} id - User ID
 * @returns {string} Token
 */
const generateToken = (id) => {
    // Sử dụng JWT_SECRET từ .env để ký (sign) token
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token hết hạn sau 30 ngày
    });
};

/**
 * @desc    Đăng ký người dùng mới
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    const validRoles = ['admin', 'manager', 'staff', 'supplier', 'customer'];
    const userRole = validRoles.includes(role) ? role : 'staff';

    try {
        // 1. Kiểm tra email đã tồn tại chưa
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'Người dùng với email này đã tồn tại.' });
        }

        // 2. Tạo người dùng mới
        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
        });

        if (user) {
            // 3. Trả về thông tin người dùng và JWT
            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công.',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id), // Tạo token
                },
            });
        } else {
            res.status(400).json({ success: false, message: 'Dữ liệu người dùng không hợp lệ.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký.', error: error.message });
    }
};

/**
 * @desc    Đăng nhập người dùng
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Tìm người dùng bằng email
        const user = await User.findOne({ email }).select('+password');

        // Bước 4.2: Kiểm tra nếu tài khoản không tồn tại
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Tài khoản không tồn tại' // Khớp với đặc tả 4.2
            });
        }

        // Bước 4.3: Kiểm tra nếu mật khẩu sai
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Mật khẩu không đúng' // Khớp với đặc tả 4.3
            });
        }

        // Bước 4.1: Đăng nhập thành công -> Trả về thông tin và Token
        res.json({
            success: true,
            message: 'Đăng nhập thành công.',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, // Trả về quyền hạn để Client chuyển hướng Dashboard
                token: generateToken(user._id),
            },
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi đăng nhập.', 
            error: error.message 
        });
    }
};

/**
 * @desc    Quên mật khẩu
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Email không tồn tại trong hệ thống.' });
        }

        // TODO: Tích hợp gửi email thực tế tại đây.
        res.json({
            success: true,
            message: 'Yêu cầu khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi gửi yêu cầu khôi phục mật khẩu.',
            error: error.message,
        });
    }
};

/**
 * @desc    Lấy thông tin người dùng hiện tại (dựa trên JWT)
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    // req.user được gán bởi 'protect' middleware sau khi xác thực token
    const user = await User.findById(req.user._id).select('-password'); 

    if (user) {
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } else {
        res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }
};

// 💡 Cấu trúc exports cuối cùng
exports.generateToken = generateToken;