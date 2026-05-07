import React from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { 
    LayoutDashboard, Package, Coffee, FileText, Users, 
    Search, Bell, LogOut, Settings, HelpCircle, 
    Plus, ChevronLeft, ChevronRight, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const { userName, userProfile, logout, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userDisplayName = userProfile?.name || userName || 'Khách hàng';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* PHẦN CSS TRỰC TIẾP TRONG JSX */}
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                .dashboard-container {
                    font-family: 'Inter', sans-serif;
                    background-color: #FDF8F3;
                    color: #3D2B1F;
                }

                .sidebar-shadow {
                    box-shadow: 4px 0 24px rgba(61, 43, 31, 0.02);
                }

                .custom-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #EFE3D5;
                    border-radius: 10px;
                }

                .banner-overlay {
                    background: linear-gradient(90deg, rgba(44, 24, 16, 0.9) 0%, rgba(44, 24, 16, 0.3) 100%);
                }

                .btn-primary {
                    background-color: #3D2B1F;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .btn-primary:hover {
                    background-color: #000000;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }

                .status-card {
                    transition: all 0.3s ease;
                    border: 1px solid #EFE3D5;
                }
                .status-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 30px rgba(61, 43, 31, 0.05);
                    background-color: #ffffff;
                }

                .order-row {
                    transition: background-color 0.2s;
                }
                .order-row:hover {
                    background-color: #F9F6F4;
                }

                .search-focus:focus {
                    background-color: #ffffff !important;
                    box-shadow: 0 0 0 2px #3D2B1F;
                }
            `}} />

            <div className="dashboard-container flex min-h-screen">
                {/* SIDEBAR - Khớp image_f5a9f6.jpg */}
                <aside className="w-64 bg-white border-r border-[#EFE3D5] flex flex-col p-6 sticky top-0 h-screen sidebar-shadow">
                    <div className="mb-10">
                        <h1 className="text-xl font-extrabold tracking-widest uppercase text-[#3D2B1F]">RoastLogic</h1>
                        <p className="text-[10px] font-bold text-[#A89485] tracking-tighter">ENTERPRISE TIER</p>
                    </div>

                    <nav className="flex-1 space-y-1 custom-scroll overflow-y-auto">
                        <NavItem icon={<LayoutDashboard size={18}/>} label="Tổng quan" active />
                        <NavItem icon={<Package size={18}/>} label="Đơn hàng" />
                        <NavItem icon={<Coffee size={18}/>} label="Sản phẩm" />
                        <NavItem icon={<FileText size={18}/>} label="Sổ cái" />
                        <NavItem icon={<Users size={18}/>} label="Danh bạ" />
                    </nav>

                    <div className="mt-auto space-y-2 pt-6 border-t border-[#EFE3D5]">
                        <button className="w-full btn-primary text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider mb-4">
                            <Plus size={16} /> Đơn hàng mới
                        </button>
                        <NavItem icon={<HelpCircle size={18}/>} label="Hỗ trợ" />
                        <NavItem icon={<Settings size={18}/>} label="Cài đặt" />
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3 text-red-600 font-bold text-xs uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all mt-2"
                        >
                            <LogOut size={18} /> Đăng xuất
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-10 overflow-y-auto">
                    {/* TOP HEADER */}
                    <header className="flex justify-between items-center mb-10">
                        <div className="relative w-1/3">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89485]" size={18} />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm đơn hàng, sản phẩm..." 
                                className="search-focus w-full bg-[#EFE3D5] border-none rounded-full py-2.5 pl-12 pr-4 text-xs outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="relative cursor-pointer">
                                <Bell size={20} className="text-[#3D2B1F]" />
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2 h-2 rounded-full border-2 border-white"></span>
                            </div>
                            <div className="flex items-center gap-3 bg-white p-1 pr-5 rounded-full shadow-sm border border-[#EFE3D5] cursor-pointer hover:bg-gray-50">
                                <div className="w-9 h-9 bg-[#3D2B1F] rounded-full flex items-center justify-center text-[#FDF8F3] font-bold text-sm">
                                    {userDisplayName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-extrabold uppercase tracking-tight">{userDisplayName}</span>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-3 gap-10">
                        {/* BANNER CHÀO MỪNG */}
                        <div className="col-span-2 relative h-[340px] rounded-[2.5rem] overflow-hidden group">
                            <img 
                                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070" 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt="Coffee background"
                            />
                            <div className="absolute inset-0 banner-overlay"></div>
                            <div className="relative z-10 p-16 h-full flex flex-col justify-center text-[#FDF8F3] max-w-lg">
                                <h2 className="text-4xl font-bold mb-4 leading-[1.1]">Chào mừng trở lại,<br/>Estate Member.</h2>
                                <p className="text-sm opacity-70 mb-10 leading-relaxed font-light">Nâng tầm trải nghiệm cà phê của bạn với những lựa chọn tốt nhất từ các trang trại cao cấp trên toàn thế giới.</p>
                                <div className="flex gap-4">
                                    <button className="bg-white text-[#3D2B1F] px-8 py-3.5 rounded-xl font-extrabold text-[11px] uppercase tracking-widest hover:bg-[#FDF8F3] transition-colors shadow-lg">Xem đơn hàng</button>
                                    <button className="bg-transparent border border-white/30 text-white px-8 py-3.5 rounded-xl font-extrabold text-[11px] uppercase tracking-widest hover:bg-white/10 transition-colors backdrop-blur-sm">Khám phá mới</button>
                                </div>
                            </div>
                        </div>

                        {/* NOTIFICATIONS BOX */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#EFE3D5]">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-extrabold text-sm uppercase tracking-widest">Thông báo mới</h3>
                                <span className="bg-green-100 text-green-700 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">4 TIN MỚI</span>
                            </div>
                            <div className="space-y-8">
                                <NotificationItem 
                                    icon={<Package size={16} className="text-orange-600" />} color="bg-orange-50" 
                                    text="Đơn hàng #RL-9021 đang giao" desc="Tài xế đang vận chuyển đến địa chỉ của bạn." time="10 phút trước"
                                />
                                <NotificationItem 
                                    icon={<Coffee size={16} className="text-green-600" />} color="bg-green-50" 
                                    text="Ưu đãi độc quyền Estate" desc="Giảm 15% cho dòng Robusta Honey mới." time="2 giờ trước"
                                />
                            </div>
                            <button className="w-full text-center text-[10px] font-extrabold uppercase tracking-[0.2em] mt-10 text-[#A89485] hover:text-[#3D2B1F] transition-colors">Tất cả thông báo</button>
                        </div>
                    </div>

                    {/* TRẠNG THÁI VẬN HÀNH */}
                    <section className="mt-16">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <p className="text-[10px] font-black text-[#A89485] uppercase tracking-[0.25em] mb-2">Hoạt động vận hành</p>
                                <h3 className="text-2xl font-bold tracking-tight">Trạng thái đơn hàng</h3>
                            </div>
                            <button className="text-[11px] font-bold underline decoration-2 underline-offset-4 text-[#A89485] hover:text-[#3D2B1F]">Lịch sử đơn hàng</button>
                        </div>
                        <div className="grid grid-cols-3 gap-8">
                            <StatusCard count="03" label="Đơn hàng đang trong giai đoạn rang & đóng gói" tag="Đang xử lý" tagColor="bg-orange-100 text-orange-700" />
                            <StatusCard count="02" label="Đơn hàng đang trên đường tới địa điểm của bạn" tag="Đang giao" tagColor="bg-green-100 text-green-700" />
                            <StatusCard count="14" label="Tổng số đơn hàng thành công trong tháng này" tag="Hoàn thành" tagColor="bg-[#EFE3D5] text-[#3D2B1F]" />
                        </div>
                    </section>

                    {/* BẢNG ĐƠN HÀNG GẦN ĐÂY */}
                    <section className="mt-16 bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#EFE3D5]">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8">Đơn hàng gần đây</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-black text-[#A89485] uppercase tracking-widest border-b border-gray-100">
                                    <th className="pb-6 text-left">Mã đơn hàng</th>
                                    <th className="pb-6 text-left">Sản phẩm</th>
                                    <th className="pb-6 text-left">Ngày đặt</th>
                                    <th className="pb-6 text-left">Tổng tiền</th>
                                    <th className="pb-6 text-right">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <OrderRow id="#RL-9024" product="Arabica Cầu Đất (500g) x2" date="Hôm nay, 14:20" price="1.100.000đ" status="Đang xử lý" />
                                <OrderRow id="#RL-8911" product="Robusta Honey (1kg)" date="12 Th05, 2024" price="640.000đ" status="Đang giao" />
                                <OrderRow id="#RL-8802" product="Mix Pack (Taster Box)" date="08 Th05, 2024" price="450.000đ" status="Hoàn thành" />
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </>
    );
};

// Component con
const NavItem = ({ icon, label, active = false }) => (
    <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-[#FDF8F3] text-[#3D2B1F] font-bold shadow-sm' : 'text-[#A89485] hover:bg-gray-50'}`}>
        {icon}
        <span className="text-[13px] font-medium tracking-tight">{label}</span>
    </div>
);

const NotificationItem = ({ icon, color, text, desc, time }) => (
    <div className="flex gap-4 group cursor-pointer">
        <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
            {icon}
        </div>
        <div className="border-b border-gray-50 pb-4 w-full">
            <h4 className="text-[11px] font-extrabold uppercase tracking-tight mb-1">{text}</h4>
            <p className="text-[10px] text-gray-500 mb-1 leading-relaxed line-clamp-1">{desc}</p>
            <span className="text-[9px] text-[#A89485] font-bold uppercase tracking-tighter">{time}</span>
        </div>
    </div>
);

const StatusCard = ({ count, label, tag, tagColor }) => (
    <div className="status-card bg-[#FDF8F3]/50 p-10 rounded-[2rem] relative">
        <span className={`absolute top-6 right-6 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${tagColor}`}>{tag}</span>
        <h4 className="text-5xl font-bold mb-4 tracking-tighter">{count}</h4>
        <p className="text-[11px] text-[#A89485] font-medium leading-relaxed max-w-[140px]">{label}</p>
    </div>
);

const OrderRow = ({ id, product, date, price, status }) => (
    <tr className="order-row border-b border-gray-50 last:border-0 group">
        <td className="py-6 font-bold text-xs tracking-widest">{id}</td>
        <td className="py-6 text-xs font-medium text-gray-600">{product}</td>
        <td className="py-6 text-xs text-[#A89485]">{date}</td>
        <td className="py-6 font-bold text-sm text-[#3D2B1F]">{price}</td>
        <td className="py-6 text-right">
            <span className={`text-[9px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest ${
                status === 'Hoàn thành' ? 'bg-[#EFE3D5] text-[#3D2B1F]' : 
                status === 'Đang giao' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
                {status}
            </span>
        </td>
    </tr>
);

export default CustomerDashboard;