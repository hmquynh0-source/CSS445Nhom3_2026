import React from 'react';
import { Package, Coffee, ArrowRight } from 'lucide-react';

const CustomerDashboard = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* BANNER */}
                <div className="xl:col-span-2 relative h-[340px] rounded-[2.5rem] overflow-hidden group shadow-2xl">
                    <img 
                        src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        alt="Coffee"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
                    <div className="relative z-10 p-16 h-full flex flex-col justify-center text-[#FDF8F3] max-w-lg">
                        <h2 className="text-4xl font-bold mb-4 leading-tight">Chào mừng trở lại,<br/>Estate Member.</h2>
                        <p className="text-sm opacity-80 mb-10 leading-relaxed font-light">Nâng tầm trải nghiệm cà phê của bạn với những lựa chọn tốt nhất từ các trang trại cao cấp.</p>
                        <div className="flex gap-4">
                            <button className="bg-white text-[#3D2B1F] px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all">Xem đơn hàng</button>
                            <button className="border border-white/40 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 backdrop-blur-sm transition-all">Khám phá mới</button>
                        </div>
                    </div>
                </div>

                {/* NOTIFICATIONS BOX */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#EFE3D5] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em]">Thông báo</h3>
                        <span className="bg-green-100 text-green-700 text-[9px] font-black px-2.5 py-1 rounded-full animate-pulse">4 MỚI</span>
                    </div>
                    <div className="space-y-6 flex-1">
                        <NotificationItem 
                            icon={<Package size={16} className="text-orange-600" />} color="bg-orange-50" 
                            text="Đơn hàng đang giao" desc="Mã #RL-9021 đang trên đường vận chuyển." time="Vừa xong"
                        />
                        <NotificationItem 
                            icon={<Coffee size={16} className="text-green-600" />} color="bg-green-50" 
                            text="Robusta Honey mới" desc="Sản phẩm mới vừa cập bến tại kho." time="1 giờ trước"
                        />
                    </div>
                    <button className="w-full pt-6 text-[10px] font-black uppercase tracking-widest text-[#A89485] hover:text-[#3D2B1F] border-t border-gray-50 mt-4 transition-colors">Tất cả thông báo</button>
                </div>
            </div>

            {/* STATUS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <StatusCard count="03" label="Đơn hàng đang rang & đóng gói" tag="Xử lý" color="bg-orange-100 text-orange-700" />
                <StatusCard count="02" label="Đơn hàng đang trên đường giao" tag="Vận chuyển" color="bg-green-100 text-green-700" />
                <StatusCard count="14" label="Số đơn hàng thành công tháng này" tag="Lịch sử" color="bg-[#FDF8F3] text-[#3D2B1F]" />
            </div>
        </div>
    );
};

// Component con nhỏ gọn
const NotificationItem = ({ icon, color, text, desc, time }) => (
    <div className="flex gap-4 group cursor-pointer p-2 hover:bg-[#FDF8F3] rounded-2xl transition-colors">
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12`}>
            {icon}
        </div>
        <div>
            <h4 className="text-[11px] font-black uppercase tracking-tight mb-0.5">{text}</h4>
            <p className="text-[10px] text-gray-500 line-clamp-1">{desc}</p>
            <span className="text-[8px] text-[#A89485] font-bold uppercase">{time}</span>
        </div>
    </div>
);

const StatusCard = ({ count, label, tag, color }) => (
    <div className="bg-white border border-[#EFE3D5] p-10 rounded-[2.5rem] relative group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
        <span className={`absolute top-8 right-8 text-[8px] font-black px-3 py-1 rounded-full uppercase ${color}`}>{tag}</span>
        <h4 className="text-5xl font-black mb-4 tracking-tighter group-hover:scale-110 transition-transform origin-left">{count}</h4>
        <p className="text-[11px] text-[#A89485] font-bold leading-relaxed max-w-[150px]">{label}</p>
    </div>
);

export default CustomerDashboard;