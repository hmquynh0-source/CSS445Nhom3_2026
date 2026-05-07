import React from 'react';
import { 
  FaBox, 
  FaCheckCircle, 
  FaQrcode, 
  FaCloudUploadAlt, 
  FaCalendarAlt, 
  FaRegBell, 
  FaCog, 
  FaThList 
} from 'react-icons/fa';

const InboundPage = () => {
  return (
    <div className="min-h-screen bg-[#F9F1E7] p-4 md:p-8 font-sans text-[#3D2B1F]">

      {/* HEADER SECTION */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="max-w-2xl">
          <p className="text-[10px] font-black tracking-[0.3em] text-[#A89B8D] mb-3 uppercase">Module PB07</p>
          <h1 className="text-6xl md:text-7xl font-black italic mb-6 tracking-tighter leading-none">
            Nhập kho Logistics.
          </h1>
          <p className="text-sm md:text-base leading-relaxed opacity-80 max-w-lg font-medium">
            Quản lý dòng chảy của các loại hạt cà phê thượng hạng từ các điền trang trực tiếp vào hệ thống kho vận lưu trữ của chúng tôi.
          </p>
        </div>
        <div className="text-right border-l border-[#3D2B1F]/20 pl-8">
          <p className="text-5xl font-black mb-1 tabular-nums">482</p>
          <p className="text-[9px] font-black tracking-[0.25em] text-[#A89B8D] uppercase leading-none">
            Lô hàng trong tháng
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* LEFT COLUMN: MAIN FORM (8/12) */}
        <div className="md:col-span-8 space-y-10">
          <div className="bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(61,43,31,0.1)] overflow-hidden">
            <div className="p-6 border-b border-[#F1F1F1] flex justify-between items-center bg-white">
              <h2 className="font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3">
                <FaThList className="text-[#A89B8D]" /> Biểu mẫu nhập liệu kho
              </h2>
              <button className="text-[#3D2B1F] hover:scale-110 transition-transform">
                <FaBox size={14} />
              </button>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                {/* Product Selection */}
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">
                      Sản phẩm cà phê
                    </label>
                    <div className="relative">
                      <select className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold appearance-none focus:ring-2 focus:ring-[#3D2B1F]/10 outline-none cursor-pointer">
                        <option>Ethiopia Yirgacheffe G1</option>
                        <option>Santos NY2 Brazil</option>
                        <option>Dalat Arabica Vietnam</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
                    </div>
                  </div>
                  
                  <div className="group relative aspect-[16/9] bg-[#D9D1C7] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-inner">
                    <div className="absolute inset-0 bg-[#3D2B1F]/5 group-hover:bg-transparent transition-colors"></div>
                    <span className="relative z-10 text-[10px] font-black tracking-[0.2em] border-2 border-[#3D2B1F] px-6 py-3 uppercase bg-white/30 backdrop-blur-sm group-hover:bg-white transition-all">
                      Xem chi tiết lô hàng
                    </span>
                  </div>
                </div>

                {/* Supplier & Quantity */}
                <div className="space-y-10">
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">
                      Nhà cung cấp
                    </label>
                    <div className="relative">
                      <select className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold appearance-none focus:ring-2 focus:ring-[#3D2B1F]/10 outline-none cursor-pointer">
                        <option>Global Bean Trading Co.</option>
                        <option>Lâm Đồng Farmstead</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">
                        Số lượng (KG)
                      </label>
                      <input 
                        type="text" 
                        placeholder="0.00" 
                        className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#3D2B1F]/10 outline-none placeholder:opacity-30" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase mb-4 tracking-[0.15em] text-[#A89B8D]">
                        Số kiện (BAO)
                      </label>
                      <input 
                        type="text" 
                        placeholder="0" 
                        className="w-full p-5 bg-[#F4F4F4] border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#3D2B1F]/10 outline-none placeholder:opacity-30" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Info Row */}
              <div className="mt-16 pt-10 border-t border-[#F1F1F1] grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[9px] font-black text-[#A89B8D] uppercase tracking-[0.2em] mb-2">Mã SKU</p>
                  <p className="text-xs font-black tracking-tight">SKU-COF-ETH-001</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#A89B8D] uppercase tracking-[0.2em] mb-2">Ngày cập nhật</p>
                  <div className="flex items-center gap-3 text-xs font-black">
                    mm/dd/yyyy <FaCalendarAlt className="text-[#A89B8D]" />
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#A89B8D] uppercase tracking-[0.2em] mb-2">Trạng thái kho</p>
                  <div className="flex items-center gap-2 text-xs font-black text-[#4F7942]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4F7942] animate-pulse"></span> ĐỦ TIÊU CHUẨN
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-14 py-5 bg-[#E5D5C5] hover:bg-[#D9C7B5] transition-colors font-black text-[10px] tracking-[0.25em] rounded-lg uppercase">
                  Hủy bỏ
                </button>
                <button className="px-14 py-5 bg-[#3D2B1F] hover:bg-[#2A1D15] text-white transition-all font-black text-[10px] tracking-[0.25em] rounded-lg uppercase shadow-[0_10px_20px_-5px_rgba(61,43,31,0.4)] active:scale-95">
                  Xác nhận nhập kho
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR (4/12) */}
        <div className="md:col-span-4 space-y-8">
          {/* Capacity Card */}
          <div className="bg-white p-8 rounded-2xl shadow-[0_10px_40px_-15px_rgba(61,43,31,0.05)] border border-white">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-black text-xs uppercase mb-1 tracking-wider">Dung lượng kho hiện tại</h3>
                <p className="text-[9px] font-bold text-[#A89B8D] tracking-widest uppercase">Khu vực trung chuyển A-1</p>
              </div>
              <div className="p-2 bg-[#F9F1E7] rounded-lg text-[#3D2B1F]">
                <FaBox size={16} />
              </div>
            </div>
            
            <div className="relative h-12 bg-[#F0E6DA] rounded-xl overflow-hidden mb-5">
              <div className="bg-[#4F7942] h-full transition-all duration-1000 ease-out flex items-center px-4" style={{width: '75%'}}>
                <span className="text-[9px] font-black text-white tracking-[0.15em] whitespace-nowrap">75% CAPACITY</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest">
              <span className="text-[#3D2B1F]">3200 / 4000 TẤN</span>
              <span className="text-[#4F7942] px-2 py-1 bg-[#4F7942]/10 rounded">TÌNH TRẠNG TỐT</span>
            </div>
          </div>

          {/* History Card */}
          <div className="bg-[#EAE2D8] p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3D2B1F]/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="font-black text-xs uppercase tracking-[0.15em]">Lịch sử nhập kho gần đây</h3>
              <button className="text-[9px] font-black underline uppercase hover:text-white transition-colors">Xem tất cả</button>
            </div>
            
            <div className="space-y-6 relative z-10">
              {[
                {id: '#EST-2401', name: 'Yirgacheffe G1', origin: 'Ethiopia', weight: '450kg'},
                {id: '#EST-2402', name: 'Santos NY2', origin: 'Brazil', weight: '1,200kg'},
                {id: '#EST-2403', name: 'Dalat Arabica', origin: 'Vietnam', weight: '850kg'},
                {id: '#EST-2404', name: 'Huila Supremo', origin: 'Colombia', weight: '300kg'},
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-[#3D2B1F]/10 pb-4 last:border-0 last:pb-0 group/item">
                  <span className="text-[9px] font-black text-[#3D2B1F]/40 tabular-nums">{item.id}</span>
                  <div className="flex-1 px-5">
                    <p className="text-[11px] font-black uppercase tracking-tight group-hover/item:translate-x-1 transition-transform">{item.name}</p>
                    <p className="text-[9px] font-bold text-[#A89B8D] uppercase tracking-tighter">{item.origin}</p>
                  </div>
                  <span className="text-xs font-black tabular-nums">{item.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER FEATURES (3 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 border-t border-[#3D2B1F]/10 pt-12">
        <FeatureCard 
          icon={<FaCheckCircle size={14} />} 
          title="Kiểm định chất lượng" 
          desc="Mọi lô hàng nhập kho đều phải trải qua quy trình kiểm tra độ ẩm và độ đồng nhất trước khi lưu trữ chính thức." 
        />
        <FeatureCard 
          icon={<FaQrcode size={14} />} 
          title="Truy xuất nguồn gốc" 
          desc="Hệ thống tự động tạo mã QR định danh cho từng bao hàng, đảm bảo tính minh bạch từ nông trại đến tay khách hàng." 
        />
        <FeatureCard 
          icon={<FaCloudUploadAlt size={14} />} 
          title="Đồng bộ Ledger" 
          desc="Dữ liệu nhập kho được đồng bộ thời gian thực với sổ cái tài chính, tự động cập nhật giá trị tài sản ròng." 
        />
      </div>

      {/* FOOTER LOGO/BRAND */}
      <footer className="mt-20 pb-8 flex justify-center opacity-20 select-none">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">The Editorial Estate</h2>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group bg-[#E5DBCF]/30 p-8 rounded-2xl border border-transparent hover:border-[#D1C7BB] transition-all duration-300 hover:bg-[#E5DBCF]/50">
    <div className="bg-[#3D2B1F] text-white w-10 h-10 rounded-lg flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
      {icon}
    </div>
    <h4 className="font-black text-[11px] uppercase mb-4 tracking-[0.2em]">{title}</h4>
    <p className="text-[12px] leading-relaxed opacity-70 font-bold text-[#3D2B1F]/80">{desc}</p>
  </div>
);

export default InboundPage;