import React, { useState, useEffect } from 'react';
import { 
  Box, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const SupplierInventoryPage = () => {
  // Dữ liệu SKU giả lập
  const skuData = [
    { code: "VN-DAK-ROB-18", name: "Robusta Honey G1", region: "Daklak", moist: "12.5%", size: "S18", qty: "450,000", status: "SẴN SÀNG" },
    { code: "VN-LAM-ARA-SC", name: "Arabica Wash Specialty", region: "Lâm Đồng", moist: "11.8%", size: "S16", qty: "12,500", status: "DƯỚI ĐỊNH MỨC", alert: true },
    { code: "VN-GIA-CUL-PR", name: "Culi Robusta Premium", region: "Gia Lai", moist: "12.2%", size: "S18", qty: "85,000", status: "SẴN SÀNG" },
  ];

  return (
    <div className="w-full space-y-8 p-1 transition-opacity duration-500 ease-in-out">
      {/* 1. TOP STATS: Phân loại tồn kho */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InventoryQuickStat label="ROBUSTA G1" value="1,240" unit="Tấn" trend="+12%" up />
        <InventoryQuickStat label="ARABICA SPECIALTY" value="856" unit="Tấn" trend="-2%" />
        <InventoryQuickStat label="CULI PREMIUM" value="420" unit="Tấn" trend="+8%" up />
        <InventoryQuickStat label="CHERRY (EXCELSA)" value="185" unit="Tấn" trend="Ổn định" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. CHART AREA (Left - 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#F9F6F2] border border-[#EAE1D6] rounded-[2.5rem] p-8 overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#3D2B1F]">Biến Động Tồn Kho</h3>
                <p className="text-[11px] text-[#A89485] font-medium">Dữ liệu tổng hợp 30 ngày gần nhất</p>
              </div>
              <div className="flex bg-white rounded-lg p-1 border border-[#EAE1D6] scale-90 sm:scale-100">
                <button className="px-4 py-1.5 text-[10px] font-bold bg-[#3D2B1F] text-white rounded-md">30 NGÀY</button>
                <button className="px-4 py-1.5 text-[10px] font-bold text-[#A89485] hover:text-[#3D2B1F]">90 NGÀY</button>
              </div>
            </div>
            
            {/* Biểu đồ cột đã tối ưu layout */}
            <div className="flex items-end justify-between h-48 gap-2 px-4">
              {[40, 70, 45, 90, 65, 30, 85, 40, 95].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div 
                    style={{ height: `${height}%` }} 
                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 ${i === 3 || i === 8 ? 'bg-[#3D2B1F]' : 'bg-[#D6C9BA] group-hover:bg-[#A89485]'}`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RegionCard 
              title="Cao Nguyên Lâm Đồng" 
              img="https://images.unsplash.com/photo-1501333190117-bf58ad11cfa5?q=80&w=2070"
              stats={{ qty: "1,200", moist: "11.5%", s: "S18" }}
            />
            <RegionCard 
              title="Thủ Phủ Cà Phê" 
              img="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070"
              stats={{ qty: "800", moist: "13.0%", s: "S16" }}
            />
          </div>
        </div>

        {/* 3. SIDEBAR INFO (Right - 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#EAE1D6] rounded-[2.5rem] p-8 shadow-sm h-fit">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#3D2B1F] mb-6">Lô Hàng Sắp Xuất</h3>
            <div className="space-y-4">
              <IncomingShipment id="#SHP-2904-A" status="ĐANG CHUẨN BỊ" color="green" />
              <IncomingShipment id="#SHP-2105-B" status="KIỂM ĐỊNH" color="orange" />
            </div>
            <button className="w-full mt-6 py-4 border border-[#EAE1D6] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#3D2B1F] hover:text-white transition-all duration-300">
              Theo dõi hành trình
            </button>
          </div>

          <div className="bg-white border border-[#EAE1D6] rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#3D2B1F] mb-6">Lịch Sử Nhập/Xuất</h3>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#EAE1D6]">
              <TimelineItem time="HÔM NAY, 08:45" action="Nhập kho: 20 Tấn Robusta S18" sub="Hợp tác xã Krông Năng" isNew />
              <TimelineItem time="HÔM QUA, 14:30" action="Xuất kho: 15 Tấn Culi Premium" sub="Nhà rang xay Specialty HCM" />
              <TimelineItem time="21/10, 10:00" action="Nhập kho: 50 Tấn Arabica Honey" sub="Nông trường Cầu Đất" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. SKU DETAIL TABLE - Added Responsive Wrapper */}
      <div className="bg-[#F9F6F2] border border-[#EAE1D6] rounded-[2.5rem] p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#3D2B1F]">Chi Tiết Tồn Kho SKU</h3>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-[10px] font-bold text-[#A89485] uppercase hover:text-[#3D2B1F]"><Filter size={14}/> Lọc</button>
            <button className="flex items-center gap-2 text-[10px] font-bold text-[#A89485] uppercase hover:text-[#3D2B1F]"><Download size={14}/> Xuất báo cáo</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-[10px] font-black text-[#A89485] uppercase tracking-tighter border-b border-[#EAE1D6]">
                <th className="pb-4">MÃ SKU</th>
                <th className="pb-4">SẢN PHẨM</th>
                <th className="pb-4">VÙNG TRỒNG</th>
                <th className="pb-4">ĐỘ ẨM</th>
                <th className="pb-4">SÀNG</th>
                <th className="pb-4">TỒN KHO (KG)</th>
                <th className="pb-4 text-right">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE1D6]/50 text-xs">
              {skuData.map((sku, idx) => (
                <SKURow key={idx} {...sku} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components (Tối ưu hóa Memoization-like behavior) ---

const InventoryQuickStat = ({ label, value, unit, trend, up }) => (
  <div className="bg-white border border-[#EAE1D6] p-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <p className="text-[10px] font-black text-[#A89485] uppercase tracking-widest mb-2">{label}</p>
    <div className="flex items-baseline gap-2 mb-2">
      <span className="text-3xl font-bold text-[#3D2B1F]">{value}</span>
      <span className="text-[11px] font-medium text-[#A89485]">{unit}</span>
    </div>
    <div className={`flex items-center gap-1 text-[10px] font-bold ${up ? 'text-green-600' : 'text-orange-600'}`}>
      {trend === "Ổn định" ? null : up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
      {trend} {trend !== "Ổn định" && "tháng này"}
    </div>
  </div>
);

const RegionCard = ({ title, img, stats }) => (
  <div className="relative rounded-[2rem] overflow-hidden h-64 group shadow-md border border-[#EAE1D6]">
    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={title} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-8 flex flex-col justify-end">
      <h4 className="text-white font-serif italic text-xl mb-4">{title}</h4>
      <div className="flex gap-6 border-t border-white/20 pt-4">
        <div><p className="text-[8px] text-white/60 uppercase font-black">Tồn kho</p><p className="text-white font-bold text-xs">{stats.qty} Tấn</p></div>
        <div><p className="text-[8px] text-white/60 uppercase font-black">Độ ẩm</p><p className="text-white font-bold text-xs">{stats.moist}</p></div>
        <div><p className="text-[8px] text-white/60 uppercase font-black">Sàng</p><p className="text-white font-bold text-xs">{stats.s}</p></div>
      </div>
    </div>
  </div>
);

const IncomingShipment = ({ id, status, color }) => (
  <div className="flex items-center justify-between p-4 bg-[#F9F6F2] rounded-2xl border border-[#EAE1D6] hover:bg-white transition-colors duration-300">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color === 'green' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
        <TrendingUp size={16} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-[#3D2B1F]">{id}</p>
        <p className="text-[9px] text-[#A89485] font-medium">Dự kiến: 28/10/2023</p>
      </div>
    </div>
    <span className={`text-[8px] font-black px-2 py-1 rounded shadow-sm ${color === 'green' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'}`}>
      {status}
    </span>
  </div>
);

const TimelineItem = ({ time, action, sub, isNew }) => (
  <div className="pl-8 relative group">
    <div className={`absolute left-0 top-1 w-[22px] h-[22px] rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 ${isNew ? 'bg-[#3D2B1F]' : 'bg-[#A89485]'}`}></div>
    <p className="text-[9px] font-bold text-[#A89485] mb-1">{time}</p>
    <p className="text-[11px] font-bold text-[#3D2B1F] group-hover:text-amber-900 transition-colors">{action}</p>
    <p className="text-[10px] italic text-[#A89485]">Từ: {sub}</p>
  </div>
);

const SKURow = ({ code, name, region, moist, size, qty, status, alert }) => (
  <tr className="group hover:bg-white transition-colors cursor-default">
    <td className="py-5 font-black text-[10px] text-[#A89485] uppercase tracking-tighter">{code}</td>
    <td className="py-5 font-bold text-[#3D2B1F]">{name}</td>
    <td className="py-5 text-[#A89485] font-medium">{region}</td>
    <td className="py-5 text-[#3D2B1F] font-medium">{moist}</td>
    <td className="py-5 text-[#3D2B1F] font-medium">{size}</td>
    <td className="py-5 font-black text-[#3D2B1F]">{qty}</td>
    <td className="py-5 text-right">
      <span className={`text-[8px] font-black px-3 py-1 rounded-full whitespace-nowrap ${alert ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
        {status}
      </span>
    </td>
  </tr>
);

export default SupplierInventoryPage;