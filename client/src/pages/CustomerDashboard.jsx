import React from 'react';
import { Wallet, Truck, Box, Sparkles, ShoppingCart, ArrowRight } from 'lucide-react';

const CustomerDashboard = () => {
    return (
        <div className="bg-[#FCF9F4] min-h-screen p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* --- HEADER BANNER --- */}
            <div className="bg-[#2C1D11] rounded-[2rem] p-12 text-white mb-8 shadow-2xl relative overflow-hidden">
                <div className="max-w-2xl relative z-10">
                    <h1 className="text-4xl font-black mb-4 tracking-tight italic text-[#FDF8F3]">Logistics Cà Phê Chính Xác</h1>
                    <p className="text-sm font-light text-gray-300 mb-8 leading-relaxed">
                        Nền tảng quản lý chuyên nghiệp dành cho các nhà rang xay và đối tác thương mại cà phê toàn cầu. Tối ưu hóa chuỗi cung ứng từ nông trại đến tách cà phê.
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-[#3A7D44] text-white px-6 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-[#2F6637] transition-colors">
                            Đơn hàng mới
                        </button>
                        <button className="bg-[#463529] text-white px-6 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-[#574334] transition-colors">
                            Xem bảng giá Bean
                        </button>
                    </div>
                </div>
                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    title="Số dư sổ cái" 
                    value="1,240.50M" 
                    sub="~ +12.5% tháng này" 
                    icon={<Wallet size={20} className="text-[#A89485]" />} 
                />
                <StatCard 
                    title="Vận chuyển đang chờ" 
                    value="14" 
                    sub="6 đơn hàng dự kiến đến hôm nay" 
                    icon={<Truck size={20} className="text-[#A89485]" />} 
                />
                <StatCard 
                    title="Trạng thái kho" 
                    value="92%" 
                    sub={<span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold">TỐT</span>} 
                    icon={<Box size={20} className="text-[#A89485]" />} 
                />
            </div>

            {/* --- MAIN SECTION: ORDERS & AI INSIGHTS --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
                
                {/* Lệnh Đơn Hàng Gần Đây */}
                <div className="xl:col-span-2 bg-[#F8EFE0] rounded-[2rem] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-[#2C1D11] tracking-tight">Đơn hàng gần đây</h2>
                        <button className="text-[10px] font-bold uppercase tracking-widest text-[#A89485] hover:text-[#2C1D11]">Tất cả đơn hàng</button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[9px] uppercase tracking-widest text-[#A89485] border-b border-[#EADBC8]">
                                    <th className="pb-4 font-bold">Mã đơn hàng</th>
                                    <th className="pb-4 font-bold">Loại hạt</th>
                                    <th className="pb-4 font-bold">Số lượng</th>
                                    <th className="pb-4 font-bold">Trạng thái</th>
                                    <th className="pb-4 font-bold">Giá trị</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <TableRow 
                                    id="#ORD-9921" name="Arabica - Ethiopia Yirgacheffe" qty="450 kg" 
                                    status="ĐANG GIAO" statusColor="bg-[#D1E7DD] text-[#0F5132]" price="₫185.0M" 
                                />
                                <TableRow 
                                    id="#ORD-9904" name="Robusta - Gia Lai Grade 1" qty="1,200 kg" 
                                    status="CHỜ XỬ LÝ" statusColor="bg-[#FFF3CD] text-[#856404]" price="₫240.5M" 
                                />
                                <TableRow 
                                    id="#ORD-9859" name="Culi - Special Blend" qty="200 kg" 
                                    status="HOÀN TẤT" statusColor="bg-[#E2E3E5] text-[#383D41]" price="₫112.2M" 
                                />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Insights Sidebar */}
                <div className="bg-[#2C1D11] rounded-[2rem] p-8 text-white shadow-2xl flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={20} className="text-orange-400" />
                        <h2 className="text-xl font-black tracking-tight">AI Insights</h2>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed mb-6 font-light">
                        Dựa trên xu hướng tiêu dùng, chúng tôi dự báo giá Arabica sẽ tăng 4.2% trong tháng tới. Bạn nên đặt hàng trước để tối ưu chi phí.
                    </p>
                    
                    <div className="space-y-3 mt-auto">
                        <div className="bg-[#3F2B1C] p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-[#4A3322] transition-colors">
                            <p className="text-[9px] uppercase tracking-widest text-orange-400 font-bold mb-1">Gợi ý mua hàng</p>
                            <p className="text-sm font-bold">Nhập kho Robusta ngay hôm nay</p>
                        </div>
                        <div className="bg-[#3F2B1C] p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-[#4A3322] transition-colors">
                            <p className="text-[9px] uppercase tracking-widest text-red-400 font-bold mb-1">Cảnh báo tồn kho</p>
                            <p className="text-sm font-bold">Mã SKU-882 đang ở mức báo động</p>
                        </div>
                    </div>
                    <button className="w-full mt-6 bg-[#3A7D44] hover:bg-[#2F6637] text-white py-3 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-colors">
                        Xem phân tích chi tiết
                    </button>
                </div>
            </div>

            {/* --- PRODUCTS SECTION --- */}
            <div>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-black text-[#2C1D11] tracking-tight uppercase">Hạt xanh cao cấp</h2>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-[#A89485] hover:text-[#2C1D11]">Xem tất cả</button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ProductCard 
                        tag="SẴN HÀNG" tagColor="bg-green-600"
                        origin="ARABICA | ETHIOPIA" name="Yirgacheffe Grade 1" price="410.000"
                        img="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600"
                    />
                    <ProductCard 
                        tag="SỐ LƯỢNG ÍT" tagColor="bg-orange-500"
                        origin="ROBUSTA | VIỆT NAM" name="Gia Lai Honey Process" price="195.000"
                        img="https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=600"
                    />
                    <ProductCard 
                        tag="SẴN HÀNG" tagColor="bg-green-600"
                        origin="CULI | ĐẮK LẮK" name="Special Peaberry Blend" price="285.000"
                        img="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600"
                    />
                    <ProductCard 
                        tag="SẴN HÀNG" tagColor="bg-green-600"
                        origin="ARABICA | BRAZIL" name="Santos NY2/3 Sc 17/18" price="355.000"
                        img="https://images.unsplash.com/photo-1524350876685-274059332603?q=80&w=600"
                    />
                </div>
            </div>

        </div>
    );
};

/* =========================================
   COMPONENTS HỖ TRỢ (NÊN ĐỂ CÙNG FILE)
========================================= */

const StatCard = ({ title, value, sub, icon }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EFE3D5] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#A89485]">{title}</h3>
            {icon}
        </div>
        <div>
            <h4 className="text-3xl font-black text-[#2C1D11] mb-2 tracking-tighter">{value}</h4>
            <div className="text-xs text-gray-500 font-medium">{sub}</div>
        </div>
    </div>
);

const TableRow = ({ id, name, qty, status, statusColor, price }) => (
    <tr className="border-b border-[#EADBC8]/50 last:border-0 hover:bg-white/40 transition-colors">
        <td className="py-4 font-bold text-xs text-[#2C1D11]">{id}</td>
        <td className="py-4 font-medium text-xs text-[#5D4A3E]">{name}</td>
        <td className="py-4 font-medium text-xs text-[#5D4A3E]">{qty}</td>
        <td className="py-4">
            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide ${statusColor}`}>
                {status}
            </span>
        </td>
        <td className="py-4 font-black text-xs text-[#2C1D11]">{price}</td>
    </tr>
);

const ProductCard = ({ tag, tagColor, origin, name, price, img }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EFE3D5] group cursor-pointer hover:shadow-xl transition-all duration-300">
        <div className="relative h-40 rounded-xl overflow-hidden mb-4">
            <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <span className={`absolute top-2 left-2 text-[8px] font-black text-white px-2 py-1 rounded ${tagColor}`}>
                {tag}
            </span>
        </div>
        <p className="text-[9px] uppercase tracking-widest text-[#A89485] font-bold mb-1">{origin}</p>
        <h3 className="text-sm font-black text-[#2C1D11] mb-4 leading-tight">{name}</h3>
        <div className="flex justify-between items-center mt-auto">
            <p className="font-black text-[#2C1D11]">₫{price}<span className="text-xs text-gray-400 font-medium">/kg</span></p>
            <button className="w-8 h-8 rounded-lg bg-[#FDF8F3] text-[#2C1D11] flex items-center justify-center hover:bg-[#2C1D11] hover:text-white transition-colors">
                <ShoppingCart size={14} />
            </button>
        </div>
    </div>
);

export default CustomerDashboard;