import React, { useState } from 'react';
import { Check, X, MapPin, Package, Info, ChevronRight } from 'lucide-react';

const SupplierApprovalPage = () => {
    const [selectedReq, setSelectedReq] = useState(null);

    const requests = [
        { id: 'REQ-2023-089', warehouse: 'Kho Trung tâm Đắk Lắk', date: '12/10/2023', value: '850.000.000', status: 'PENDING' },
        { id: 'REQ-2023-090', warehouse: 'Kho Cầu Đất - Đà Lạt', date: '13/10/2023', value: '1.200.000.000', status: 'PENDING' },
        { id: 'REQ-2023-091', warehouse: 'Kho Pleiku - Gia Lai', date: '14/10/2023', value: '940.500.000', status: 'REVIEWING' },
        { id: 'REQ-2023-092', warehouse: 'Kho Bảo Lộc', date: '15/10/2023', value: '1.280.000.000', status: 'PENDING' },
    ];

    return (
        <div className="max-w-[1400px] mx-auto p-8 animate-in fade-in duration-700">
            {/* Header Header phong cách Tạp chí */}
            <div className="flex justify-between items-end mb-12 border-b border-[#EAE1D6] pb-8">
                <div className="max-w-xl">
                    <h2 className="text-5xl font-serif text-[#3D2B1F] leading-tight mb-4">Phê duyệt yêu cầu nhập hàng</h2>
                    <p className="text-[#A89485] text-sm italic font-medium">Thẩm định chi tiết các lô hàng nhân xanh chất lượng cao từ mạng lưới nông hộ đối tác.</p>
                </div>
                <div className="flex gap-4">
                    <StatBox label="Đang chờ duyệt" value="12" sub="Yêu cầu" />
                    <StatBox label="Giá trị giải ngân dự kiến" value="4.280.500" sub="k VND" />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* DANH SÁCH BÊN TRÁI */}
                <div className="col-span-7 space-y-2">
                    <div className="grid grid-cols-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A89485] px-8 mb-4">
                        <div className="col-span-1">Mã đơn</div>
                        <div className="col-span-2">Nhà kho</div>
                        <div className="col-span-1">Giá trị</div>
                        <div className="col-span-1 text-right">Trạng thái</div>
                    </div>
                    {requests.map((req) => (
                        <div 
                            key={req.id}
                            onClick={() => setSelectedReq(req)}
                            className={`group grid grid-cols-5 items-center p-8 rounded-2xl transition-all cursor-pointer ${
                                selectedReq?.id === req.id ? 'bg-[#F3EDE4] shadow-sm' : 'hover:bg-[#F9F6F2]'
                            }`}
                        >
                            <div className="text-xs font-bold text-[#3D2B1F]">{req.id}</div>
                            <div className="col-span-2 text-[11px] font-medium text-[#3D2B1F] leading-relaxed">
                                {req.warehouse}
                                <p className="text-[10px] text-[#A89485] mt-1 font-normal">{req.date}</p>
                            </div>
                            <div className="text-xs font-black text-[#3D2B1F]">{req.value}</div>
                            <div className="flex justify-end">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-tighter ${
                                    req.status === 'REVIEWING' ? 'bg-[#F9F6F2] text-orange-600 border border-orange-200' : 'bg-[#F1F1F1] text-gray-500'
                                }`}>
                                    {req.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    
                    {/* Minh họa bản đồ nhỏ phía dưới (như mẫu) */}
                    <div className="mt-10 rounded-[2rem] overflow-hidden grayscale opacity-70 border border-[#EAE1D6] h-48 relative">
                        <div className="absolute inset-0 flex items-center justify-center bg-[#3D2B1F]/10">
                            <MapPin className="text-[#3D2B1F]" size={32} />
                        </div>
                        <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg text-[10px] font-bold">
                            ĐỊA ĐIỂM TIẾP NHẬN: LÔ Q2, KCN TRÀ ĐA, TP. PLEIKU, GIA LAI
                        </div>
                    </div>
                </div>

                {/* CHI TIẾT BÊN PHẢI (EDITORIAL SIDEBAR) */}
                <div className="col-span-5">
                    {selectedReq ? (
                        <div className="sticky top-8 bg-white border border-[#EAE1D6] rounded-[2.5rem] p-10 shadow-xl shadow-[#3D2B1F]/5 animate-in slide-in-from-right-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-[10px] font-black text-[#A89485] uppercase tracking-widest">Chi tiết yêu cầu</p>
                                    <h3 className="text-2xl font-serif text-[#3D2B1F] mt-1">{selectedReq.id}</h3>
                                    <p className="text-[11px] text-[#A89485]">{selectedReq.warehouse}</p>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <p className="text-[10px] font-black text-[#A89485] uppercase border-b border-[#F9F6F2] pb-2">Danh mục nhân xanh</p>
                                <ProductDetail name="Robusta Đắk Lắk (G1)" qty="5,000 kg" price="85.000 / kg" />
                                <ProductDetail name="Arabica Cầu Đất (Washed)" qty="2,500 kg" price="145.000 / kg" />
                                <ProductDetail name="Fine Robusta Honey" qty="80 kg" price="180.000 / kg" />
                            </div>

                            <div className="bg-[#F9F6F2] p-6 rounded-2xl mb-8 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-[#A89485] uppercase mb-1">Khối lượng tổng</p>
                                    <p className="text-xl font-bold text-[#3D2B1F]">8,580 kg</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-[#A89485] uppercase mb-1">Giá trị quyết toán</p>
                                    <p className="text-2xl font-black text-[#3D2B1F] leading-none">{selectedReq.value}</p>
                                    <p className="text-[10px] font-bold text-[#A89485] mt-1">VND</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <textarea 
                                    placeholder="Ghi chú & Lý do (nếu từ chối)..."
                                    className="w-full bg-[#F9F6F2] border-none rounded-xl p-4 text-xs italic outline-none min-h-[100px]"
                                />
                                <div className="flex gap-4">
                                    <button className="flex-1 py-4 bg-white border border-[#EAE1D6] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                                        Từ chối
                                    </button>
                                    <button className="flex-[2] py-4 bg-[#3D2B1F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A110B] transition-all flex items-center justify-center gap-2">
                                        Phê duyệt nhập kho <Check size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100 flex gap-3">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                    <Info size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-green-800 uppercase tracking-tighter">Intelligence Insight</p>
                                    <p className="text-[10px] text-green-700 leading-relaxed mt-1">Lô hàng này đã vượt qua bài kiểm định QC tại nguồn với số điểm 87/100.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed border-[#EAE1D6] rounded-[2.5rem] p-20 text-center">
                            <p className="text-xs font-bold text-[#A89485] uppercase tracking-widest leading-relaxed">Chọn một yêu cầu để xem thẩm định chi tiết</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatBox = ({ label, value, sub }) => (
    <div className="bg-[#F9F6F2] px-6 py-4 rounded-lg min-w-[140px]">
        <p className="text-[9px] font-black text-[#A89485] uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#3D2B1F]">{value}</span>
            <span className="text-[10px] font-bold text-[#A89485]">{sub}</span>
        </div>
    </div>
);

const ProductDetail = ({ name, qty, price }) => (
    <div className="flex justify-between items-center group">
        <div>
            <p className="text-[11px] font-bold text-[#3D2B1F] group-hover:text-brown-600 transition-colors">{name}</p>
            <p className="text-[9px] text-[#A89485] font-medium uppercase tracking-tighter">SKU: RL-808-001</p>
        </div>
        <div className="text-right">
            <p className="text-[11px] font-black text-[#3D2B1F]">{qty}</p>
            <p className="text-[9px] text-[#A89485] font-bold">{price}</p>
        </div>
    </div>
);

export default SupplierApprovalPage;