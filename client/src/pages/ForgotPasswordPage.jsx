import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowRight, ChevronLeft, Coffee } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setMessage(res.data.message || "Mã khôi phục đã được gửi đến email của bạn.");
        } catch (err) {
            setError(err.response?.data?.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#FDF8F3] font-sans">
            {/* Background Image Overlay (Lấy cảm hứng từ ảnh bạn gửi) */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop" 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-20 grayscale"
                />
            </div>

            <div className="relative z-10 w-full max-w-lg p-6 flex flex-col items-center">
                {/* Logo Branding */}
                <div className="flex items-center gap-2 mb-12">
                    <Coffee className="text-[#3D2B1F] w-6 h-6" />
                    <h1 className="text-xl font-bold uppercase tracking-widest text-[#3D2B1F]">
                        RoastLogic Enterprise
                    </h1>
                </div>

                {/* Main Card */}
                <div className="bg-white w-full rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-12 flex flex-col items-center text-center">
                    <h2 className="text-3xl font-bold text-[#2C1810] mb-4">Quên mật khẩu?</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8 px-4">
                        Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div className="text-left space-y-2">
                            <label className="text-[10px] font-extrabold uppercase text-gray-700 tracking-[0.1em]">
                                Email Của Bạn
                            </label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    placeholder="name@company.com" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#EFE3D5] border-none rounded-lg py-4 pl-4 pr-12 focus:ring-2 focus:ring-[#3D2B1F] transition-all text-sm outline-none"
                                />
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A89485] w-5 h-5" />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
                        {message && <p className="text-green-600 text-xs font-medium">{message}</p>}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#3D2B1F] text-[#FDF8F3] py-4 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? "ĐANG GỬI..." : "Gửi mã khôi phục"} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-gray-100 w-full flex justify-center">
                        <Link 
                            to="/login" 
                            className="flex items-center gap-2 text-sm font-bold text-[#2C1810] hover:opacity-70 transition-opacity"
                        >
                            <ChevronLeft size={16} /> Quay lại Đăng nhập
                        </Link>
                    </div>
                </div>

                {/* Footer Subtext */}
                <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex gap-4 items-center opacity-30">
                        <div className="w-12 h-[1px] bg-[#3D2B1F]"></div>
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Boutique Logistics</span>
                        <div className="w-12 h-[1px] bg-[#3D2B1F]"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Credit */}
            <div className="fixed bottom-6 w-full px-12 flex justify-between items-center text-[10px] text-gray-400 font-medium tracking-wider">
                <span>© 2024 THE EDITORIAL ESTATE. ALL RIGHTS RESERVED.</span>
                <div className="flex gap-6 uppercase">
                    <span className="cursor-pointer hover:text-black">Privacy</span>
                    <span className="cursor-pointer hover:text-black">Security</span>
                    <span className="cursor-pointer hover:text-black">Contact Support</span>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;