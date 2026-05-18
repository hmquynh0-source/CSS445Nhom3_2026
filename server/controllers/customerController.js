const Customer = require('../models/Customer'); // Đảm bảo đúng tên file Model của bạn

// 1. Thêm mới khách hàng (Dành cho nút bấm "Thêm khách hàng" bị lỗi của bạn)
exports.createCustomer = async (req, res) => {
    try {
        // 🚀 SỬA TẠI ĐÂY: Thêm 'director' vào danh sách hứng dữ liệu từ Frontend
        const { name, email, phone, address, type, director } = req.body;

        if (email) {
            const existingCustomer = await Customer.findOne({ email });
            if (existingCustomer) {
                return res.status(400).json({ success: false, message: "Email khách hàng này đã tồn tại!" });
            }
        }

        // 🚀 SỬA TẠI ĐÂY: Truyền 'director' và 'type' vào lúc tạo bản ghi mới
        const newCustomer = new Customer({
            name,
            email,
            phone,
            address,
            type,       // Đảm bảo lưu đúng phân loại từ client chọn
            director    // Kích hoạt lưu Người đại diện vào MongoDB
        });

        await newCustomer.save();
        res.status(201).json({ success: true, message: "Thêm khách hàng thành công!", data: newCustomer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi thêm khách hàng: " + error.message });
    }
};

// 2. Lấy danh sách khách hàng (Để hiển thị lên bảng)
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách khách hàng: " + error.message });
    }
};
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, type, director } = req.body;

        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            { name, email, phone, address, type, director },
            { new: true, runValidators: true } // new: true để trả về dữ liệu mới sau khi sửa
        );

        if (!updatedCustomer) {
            return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng!" });
        }

        res.json({ success: true, message: "Cập nhật khách hàng thành công!", data: updatedCustomer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi cập nhật: " + error.message });
    }
};