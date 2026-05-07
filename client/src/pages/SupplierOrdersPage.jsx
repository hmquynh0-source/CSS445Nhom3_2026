import React from 'react';
import { 
  Printer, 
  Truck, 
  MapPin, 
  User, 
  CheckCircle2, 
  Clock, 
  FileText,
  Navigation
} from 'lucide-react';

const SupplierOrdersPage = () => {
  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="bg-[#3D2B1F] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            Lệnh giao hàng – Nhà cung cấp
          </span>
          <h1 className="text-4xl font-serif text-[#3D2B1F] mt-3 mb-1">DO-SUP-2024-001</h1>
          <p className="text-[#A89485] text-sm font-medium italic">Chi tiết lô hàng nhân xanh từ nông trại</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#EAE1D6] text-[#3D2B1F] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#D6C9BA] transition-all">
            <Printer size={16} /> In lệnh giao hàng
          </button>
          <button className="flex items-center gap-2 bg-[#3D2B1F] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#1A110B] shadow-lg shadow-[#3D2B1F]/20 transition-all">
            Xác nhận khởi hành
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN (8 cols) */}
        <div className="col-span-8 space-y-6">
          {/* 1. Address Cards */}
          <div className="grid grid-cols-2 gap-6">
            <AddressCard 
              type="CƠ SỞ CỦA TÔI (XUẤT)"
              name="Nông Trại Cà Phê Gia Lai Organic"
              address="Thôn 4, Xã Ia Ka, Huyện Chư Păh, Gia Lai"
              person="Lê Văn Hùng"
              role="Người phụ trách kho"
              icon={<MapPin className="text-orange-600" size={20} />}
            />
            <AddressCard 
              type="KHO TỔNG ROASTLOGIC (NHẬN)"
              name="Kho Trung Chuyển Miền Nam"
              address="Lô C, KCN Cát Lái, TP. Thủ Đức, TP. HCM"
              person="028 3840 XXXX"
              role="Bộ phận điều phối kho"
              icon={<Navigation className="text-blue-600" size={20} />}
            />
          </div>

          {/* 2. Product Table Card */}
          <div className="bg-white rounded-[2rem] p-8 border border-[#EAE1D6] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#3D2B1F]">Danh sách hàng hóa cung cấp</h3>
              <p className="text-[11px] font-bold text-[#A89485]">Tổng cộng: 2 Loại nhân xanh</p>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black text-[#A89485] uppercase tracking-tighter border-b border-[#F9F6F2]">
                  <th className="text-left pb-4">Sản phẩm</th>
                  <th className="text-center pb-4">Khối lượng (KG)</th>
                  <th className="text-center pb-4">Quy cách đóng gói</th>
                  <th className="text-right pb-4">Mã lô</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9F6F2]">
                <ProductRow 
                  name="Robusta Gia Lai Honey"
                  detail="Độ ẩm: 12.5%"
                  weight="3,000"
                  pack="50 bao (60kg/bao)"
                  sku="GL-HON-0524"
                />
                <ProductRow 
                  name="Arabica Cầu Đất G1"
                  detail="Độ ẩm: 11.8%"
                  weight="1,200"
                  pack="20 bao (60kg/bao)"
                  sku="CD-SCR18-0524"
                />
              </tbody>
            </table>
          </div>

          {/* 3. Transport Details */}
          <div className="bg-white rounded-[2rem] p-8 border border-[#EAE1D6] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#3D2B1F]">
                <Truck size={18} /> Chi tiết vận chuyển
              </h3>
              <button className="text-[10px] font-bold text-green-700 underline">Sửa thông tin tài xế</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <TransportInfo label="Biển số xe" value="81C - 123.45" />
              <TransportInfo label="Tên tài xế" value="Phạm Hoàng Nam" />
              <TransportInfo label="Giờ khởi hành dự kiến" value="06:00 - 25/05/2024" icon={<Clock size={12}/>} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols) */}
        <div className="col-span-4 space-y-6">
          {/* Visual Image */}
          <div className="rounded-[2rem] overflow-hidden h-48 relative group shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Sẵn sàng"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
              <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded w-fit uppercase mb-2">Sẵn sàng xuất xưởng</span>
              <p className="text-white text-[10px] italic leading-relaxed opacity-90">"Chất lượng hạt nhân được kiểm soát nghiêm ngặt từ nông trại đến tận kho khách hàng."</p>
            </div>
          </div>

          {/* Electronic Signature Box */}
          <div className="bg-[#F9F6F2] rounded-[2rem] p-8 border border-[#EAE1D6] space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#3D2B1F] text-center">Xác nhận từ nhà cung cấp</h3>
            
            <SignatureArea label="Chữ ký quản lý nông trại" desc="Ký xác nhận đóng gói & xuất kho" />
            <SignatureArea label="Chữ ký tài xế (Khi nhận hàng)" desc="Ký xác nhận đã bốc hàng lên xe" />

            <button className="w-full bg-[#3D2B1F] text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl">
              Hoàn tất thủ tục xuất hàng
            </button>
            <p className="text-[9px] text-[#A89485] text-center italic">Bằng cách xác nhận, bạn cam kết hàng hóa đúng chủng loại và khối lượng như đã khai báo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const AddressCard = ({ type, name, address, person, role, icon }) => (
  <div className="bg-[#F9F6F2] p-6 rounded-[2rem] border border-[#EAE1D6] relative overflow-hidden group hover:border-[#3D2B1F] transition-all">
    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
      {icon}
    </div>
    <p className="text-[9px] font-black text-[#A89485] uppercase tracking-widest mb-4">{type}</p>
    <h4 className="text-sm font-bold text-[#3D2B1F] mb-1">{name}</h4>
    <p className="text-[11px] text-[#A89485] mb-4 leading-relaxed">{address}</p>
    <div className="flex items-center gap-3 pt-4 border-t border-[#EAE1D6]">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[#EAE1D6]">
        <User size={14} className="text-[#3D2B1F]" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#3D2B1F]">{person}</p>
        <p className="text-[9px] text-[#A89485] uppercase font-black">{role}</p>
      </div>
    </div>
  </div>
);

const ProductRow = ({ name, detail, weight, pack, sku }) => (
  <tr className="group hover:bg-[#F9F6F2]/50 transition-colors">
    <td className="py-5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#3D2B1F] rounded-lg flex items-center justify-center text-white font-serif italic shadow-sm">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-[12px] font-bold text-[#3D2B1F]">{name}</p>
          <p className="text-[10px] text-[#A89485] font-medium uppercase tracking-tighter">{detail}</p>
        </div>
      </div>
    </td>
    <td className="py-5 text-center font-bold text-sm text-[#3D2B1F]">{weight}</td>
    <td className="py-5 text-center text-[11px] font-medium text-[#A89485]">{pack}</td>
    <td className="py-5 text-right font-black text-[10px] text-[#3D2B1F] tracking-tighter uppercase">{sku}</td>
  </tr>
);

const TransportInfo = ({ label, value, icon }) => (
  <div className="bg-[#F9F6F2] p-4 rounded-xl">
    <p className="text-[9px] font-black text-[#A89485] uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-center gap-2">
      {icon && <span className="text-[#3D2B1F]">{icon}</span>}
      <p className="text-[12px] font-bold text-[#3D2B1F]">{value}</p>
    </div>
  </div>
);

const SignatureArea = ({ label, desc }) => (
  <div className="space-y-2 text-center">
    <p className="text-[10px] font-black text-[#3D2B1F] uppercase tracking-tighter">{label}</p>
    <div className="h-28 bg-white border border-dashed border-[#EAE1D6] rounded-2xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-[#3D2B1F] transition-all">
      <FileText size={24} className="text-[#EAE1D6] group-hover:text-[#3D2B1F] transition-colors" />
      <p className="text-[9px] text-[#A89485] italic font-medium">{desc}</p>
    </div>
  </div>
);

export default SupplierOrdersPage;