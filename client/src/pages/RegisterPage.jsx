import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('customer'); // Mặc định là khách hàng
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp');
        }

        setLoading(true);
        try {
            // Gửi đúng role: 'customer' hoặc 'supplier'
            const response = await axios.post('/api/auth/register', {
                ...formData,
                role: role 
            });

            if (response.data.success) {
                // Chuyển hướng sang trang login sau khi đăng ký thành công
                navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FDF8F3]">
            {/* CỘT TRÁI - IMAGE & BRANDING */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-black">
                <img 
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop" 
                    alt="Coffee background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="relative z-10 p-12 flex flex-col justify-between text-white w-full">
                    <div>
                        <h1 className="text-3xl font-bold tracking-widest uppercase">The Editorial Estate</h1>
                        <div className="w-12 h-1 bg-green-700 mt-2"></div>
                    </div>
                    
                    <div className="max-w-md">
                        <p className="text-xl font-semibold mb-4">Precision Coffee Ledger for Professionals.</p>
                        <p className="text-gray-300 leading-relaxed">
                            Tham gia mạng lưới tinh hoa gồm các đồn điền cà phê, quản trị viên kho bãi 
                             và các nhà cung cấp chuyên biệt trong hệ sinh thái doanh nghiệp toàn cầu.
                        </p>
                    </div>

                    <p className="text-sm text-gray-400">
                        © 2026 THE EDITORIAL ESTATE. PRECISION LOGISTICS.
                    </p>
                </div>
            </div>

            {/* CỘT PHẢI - FORM ĐĂNG KÝ */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-bold text-[#2C1810]">ĐĂNG KÝ TÀI KHOẢN</h2>
                        <p className="text-gray-500 mt-2">Lựa chọn vai trò của bạn để bắt đầu.</p>
                    </div>

                    {/* SELECT ROLE TAB */}
                    <div className="flex bg-[#EFE3D5] p-1 rounded-md">
                        <button 
                            type="button"
                            onClick={() => setRole('customer')}
                            className={`flex-1 py-2 text-sm font-bold rounded transition-all ${role === 'customer' ? 'bg-white text-black shadow-sm' : 'text-gray-600'}`}
                        >
                            Khách hàng
                        </button>
                        <button 
                            type="button"
                            onClick={() => setRole('supplier')}
                            className={`flex-1 py-2 text-sm font-bold rounded transition-all ${role === 'supplier' ? 'bg-white text-black shadow-sm' : 'text-gray-600'}`}
                        >
                            Nhà cung cấp
                        </button>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* HỌ VÀ TÊN */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-700">Họ và Tên</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    name="name" type="text" placeholder="Nguyen Van A" required
                                    className="w-full bg-[#EFE3D5] border-none rounded-md py-3 pl-10 focus:ring-2 focus:ring-[#4A3428] outline-none"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-700">Email Doanh Nghiệp</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    name="email" type="email" placeholder="example@estate.com" required
                                    className="w-full bg-[#EFE3D5] border-none rounded-md py-3 pl-10 focus:ring-2 focus:ring-[#4A3428] outline-none"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* SỐ ĐIỆN THOẠI */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-700">Số Điện Thoại</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    name="phone" type="text" placeholder="+84 000 000 000" required
                                    className="w-full bg-[#EFE3D5] border-none rounded-md py-3 pl-10 focus:ring-2 focus:ring-[#4A3428] outline-none"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* MẬT KHẨU */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-700">Mật Khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    name="password" type="password" placeholder="••••••••" required
                                    className="w-full bg-[#EFE3D5] border-none rounded-md py-3 pl-10 focus:ring-2 focus:ring-[#4A3428] outline-none"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* XÁC NHẬN MẬT KHẨU */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-700">Xác Nhận Mật Khẩu</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    name="confirmPassword" type="password" placeholder="••••••••" required
                                    className="w-full bg-[#EFE3D5] border-none rounded-md py-3 pl-10 focus:ring-2 focus:ring-[#4A3428] outline-none"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-600 text-sm text-center font-medium bg-red-50 py-2 rounded">{error}</p>}

                        {/* SUBMIT BUTTON */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#4A3428] text-white py-4 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-[#35251D] transition-all mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'ĐANG KHỞI TẠO...' : 'TẠO TÀI KHOẢN HỆ THỐNG'} <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <p className="text-[10px] text-gray-500 text-center uppercase mt-6 tracking-wider">
                        Bằng cách đăng ký, bạn đồng ý với <span className="underline cursor-pointer">Điều khoản</span> và <span className="underline cursor-pointer">Chính sách bảo mật</span>.
                    </p>

                    <div className="text-center pt-2">
                        <p className="text-sm">
                            Đã có tài khoản? <button onClick={() => navigate('/login')} className="font-bold hover:underline text-[#2C1810]">Đăng nhập ngay</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;